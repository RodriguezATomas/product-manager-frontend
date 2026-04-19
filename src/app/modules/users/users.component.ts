import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize } from 'rxjs';
import { UsersService } from './services/users.service';
import { User, UserPayload, UsersQuery } from './models/user.model';
import { UserFormDialogComponent } from './components/user-form-dialog/user-form-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filtersForm = this.fb.group({
      name: [''],
      role: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    this.paginator?.firstPage();
    this.loadUsers();
  }

  clearFilters(): void {
    this.filtersForm.reset({ name: '', role: '' });
    this.applyFilters();
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

  trackByUser(_: number, user: User): string {
    return user.id;
  }

  getRoleClass(role: string): string {
    return role === 'admin' ? 'role-chip role-chip-admin' : 'role-chip role-chip-user';
  }

  private loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers(this.buildQuery()).pipe(
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

  private showRequestError(error: any, fallbackMessage: string): void {
    const message = error?.error?.message || error?.message || fallbackMessage;
    this.snackBar.open(message, 'Cerrar', { duration: 5000 });
  }
}
