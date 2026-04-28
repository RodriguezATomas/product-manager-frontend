import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, Sort } from '@angular/material/sort';
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { User, UserPayload, UsersQuery } from './models/user.model';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  readonly displayedColumns = ['name', 'email', 'role', 'isEmailVerified', 'actions'];
  readonly roleOptions = [
    { label: 'Todos los roles', value: '' },
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ];

  users: User[] = [];
  totalUsers = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;
  filtersForm: FormGroup;
  currentSort: Sort = { active: 'name', direction: 'asc' };
  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService, // NUEVO: servicio de tema para alternar modo oscuro/claro.
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.filtersForm = this.fb.group({
      name: [''],
      role: ['']
    });
  }

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Usuario';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme; // NUEVO: expone estado del tema al template.
  }

  ngOnInit(): void {
    this.setupRealtimeFilters();
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadUsers();
  }

  clearFilters(): void {
    this.filtersForm.reset({ name: '', role: '' });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSortChange(sort: Sort): void {
    this.currentSort = sort;
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadUsers();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '560px',
      data: null
    });

    dialogRef.afterClosed().subscribe((payload?: UserPayload) => {
      if (!payload) {
        return;
      }

      this.usersService.createUser(payload).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado correctamente.', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => this.showRequestError(error, 'No se pudo crear el usuario.')
      });
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '560px',
      data: user
    });

    dialogRef.afterClosed().subscribe((payload?: UserPayload) => {
      if (!payload) {
        return;
      }

      this.usersService.updateUser(user.id, payload).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado correctamente.', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => this.showRequestError(error, 'No se pudo actualizar el usuario.')
      });
    });
  }

  confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro que deseás eliminar a ${user.name}?`
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado correctamente.', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => this.showRequestError(error, 'No se pudo eliminar el usuario.')
      });
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme(); // NUEVO: cambia tema y lo persiste en localStorage.
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'role-chip role-chip-admin' : 'role-chip role-chip-user';
  }

  exportFilteredUsers(): void {
    if (!this.users.length) {
      this.snackBar.open('No hay usuarios para exportar con los filtros actuales.', 'Cerrar', { duration: 4000 });
      return;
    }

    const csvContent = this.buildCsvContent(this.users);
    const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadUrl = URL.createObjectURL(csvBlob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = this.buildCsvFileName();
    link.click();

    URL.revokeObjectURL(downloadUrl);
    this.snackBar.open('Reporte CSV descargado correctamente.', 'Cerrar', { duration: 3000 });
  }

  private setupRealtimeFilters(): void {
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pageIndex = 0;
      this.paginator?.firstPage();
      this.loadUsers();
    });
  }

  private loadUsers(): void {
    const query = this.buildQuery();

    if (query.name?.trim()) {
      this.loadUsersByPartialName(query);
      return;
    }

    this.loading = true;
    this.usersService.getUsers(query).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (response) => {
        this.users = response.items;
        this.totalUsers = response.total;
        this.pageIndex = response.pageIndex;
        this.pageSize = response.pageSize;
      },
      error: (error) => {
        this.users = [];
        this.totalUsers = 0;
        this.showRequestError(error, 'No se pudo cargar la lista de usuarios.');
      }
    });
  }

  private loadUsersByPartialName(query: UsersQuery): void {
    const normalizedSearch = this.normalizeSearchTerm(query.name);
    const baseQuery: UsersQuery = {
      ...query,
      pageIndex: 0,
      pageSize: 500,
      name: ''
    };

    this.loading = true;
    this.usersService.getUsers(baseQuery).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (response) => {
        const filteredUsers = response.items.filter((user) =>
          this.normalizeSearchTerm(user.name).includes(normalizedSearch)
        );
        const startIndex = this.pageIndex * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        this.totalUsers = filteredUsers.length;
        this.users = filteredUsers.slice(startIndex, endIndex);
      },
      error: (error) => {
        this.users = [];
        this.totalUsers = 0;
        this.showRequestError(error, 'No se pudo cargar la lista de usuarios.');
      }
    });
  }

  private buildQuery(): UsersQuery {
    const { name, role } = this.filtersForm.getRawValue();

    return {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      sortBy: this.currentSort.active,
      sortOrder: this.currentSort.direction,
      name,
      role
    };
  }

  private buildCsvContent(users: User[]): string {
    const headers = ['Nombre', 'Email', 'Rol', 'Verificacion', 'Estado'];
    const rows = users.map((user) => [
      this.escapeCsvValue(user.name),
      this.escapeCsvValue(user.email),
      this.escapeCsvValue(user.role),
      this.escapeCsvValue(user.isEmailVerified ? 'Verificado' : 'Pendiente'),
      this.escapeCsvValue(user.status === 'inactive' ? 'Inactivo' : 'Activo')
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  }

  private buildCsvFileName(): string {
    const { name, role } = this.filtersForm.getRawValue();
    const nameSegment = String(name || 'todos').trim().replace(/\s+/g, '-').toLowerCase() || 'todos';
    const roleSegment = String(role || 'todos').trim().toLowerCase() || 'todos';
    return `usuarios-${nameSegment}-${roleSegment}.csv`;
  }

  private escapeCsvValue(value: unknown): string {
    const normalizedValue = String(value ?? '').replace(/"/g, '""');
    return `"${normalizedValue}"`;
  }

  private normalizeSearchTerm(value: unknown): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private showRequestError(error: any, fallbackMessage: string): void {
    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
