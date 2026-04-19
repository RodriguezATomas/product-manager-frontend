import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import {
  PaginatedUsers,
  ProfilePayload,
  User,
  UserPayload,
  UsersQuery
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getUsers(query: UsersQuery): Observable<PaginatedUsers> {
    let params = new HttpParams()
      .set('page', `${query.pageIndex + 1}`)
      .set('limit', `${query.pageSize}`);

    if (query.sortBy && query.sortOrder) {
      params = params.set('sortBy', `${query.sortBy}:${query.sortOrder}`);
    }

    if (query.name?.trim()) {
      params = params.set('name', query.name.trim());
    }

    if (query.role?.trim()) {
      params = params.set('role', query.role.trim());
    }

    return this.http.get<unknown>(`${environment.apiUrl}/users`, { params }).pipe(
      map((response) => this.normalizeUsersResponse(response, query))
    );
  }

  createUser(payload: UserPayload): Observable<User> {
    return this.http.post<unknown>(`${environment.apiUrl}/users`, payload).pipe(
      map((response) => this.normalizeUser(this.extractEntity(response)))
    );
  }

  updateUser(userId: string, payload: UserPayload): Observable<User> {
    return this.http.patch<unknown>(`${environment.apiUrl}/users/${userId}`, payload).pipe(
      map((response) => this.normalizeUser(this.extractEntity(response)))
    );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${userId}`);
  }

  getProfile(): Observable<User> {
    const currentUserId = this.getCurrentUserId();

    return this.http.get<unknown>(`${environment.apiUrl}/users/${currentUserId}`).pipe(
      map((response) => this.normalizeUser(this.extractEntity(response))),
      catchError(() => {
        const storedUser = this.authService.currentUserData;

        if (!storedUser) {
          return throwError(() => new Error('No se pudo obtener el perfil del usuario actual.'));
        }

        return of(this.normalizeUser(storedUser));
      })
    );
  }

  updateProfile(payload: ProfilePayload): Observable<User> {
    const currentUserId = this.getCurrentUserId();

    return this.http.patch<unknown>(`${environment.apiUrl}/users/${currentUserId}`, payload).pipe(
      map((response) => this.normalizeUser(this.extractEntity(response))),
      map((user) => {
        this.authService.updateStoredUser(user);
        return user;
      })
    );
  }

  private normalizeUsersResponse(response: unknown, query: UsersQuery): PaginatedUsers {
    if (Array.isArray(response)) {
      return {
        items: response.map((item) => this.normalizeUser(item)),
        total: response.length,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize
      };
    }

    const data = this.extractEntity(response) as Record<string, unknown>;
    const rawItems = this.asArray(data['results'] ?? data['items'] ?? data['users'] ?? data['data'] ?? []);
    const total = this.toNumber(data['totalResults'] ?? data['total'] ?? data['count'] ?? rawItems.length);
    const page = this.toNumber(data['page'] ?? query.pageIndex + 1);
    const limit = this.toNumber(data['limit'] ?? query.pageSize);

    return {
      items: rawItems.map((item) => this.normalizeUser(item)),
      total,
      pageIndex: Math.max(page - 1, 0),
      pageSize: limit
    };
  }

  private normalizeUser(source: any): User {
    return {
      id: String(source?.id ?? source?._id ?? ''),
      name: String(source?.name ?? source?.fullName ?? 'Sin nombre'),
      email: String(source?.email ?? ''),
      role: String(source?.role ?? 'user'),
      isEmailVerified: Boolean(source?.isEmailVerified ?? source?.emailVerified ?? source?.verified),
      status: this.normalizeStatus(source)
    };
  }

  private normalizeStatus(source: any): string {
    if (typeof source?.status === 'string') {
      return source.status;
    }

    if (source?.isActive === false || source?.active === false) {
      return 'inactive';
    }

    return 'active';
  }

  private extractEntity(response: unknown): unknown {
    if (!response || typeof response !== 'object') {
      return response;
    }

    const record = response as Record<string, unknown>;
    return record['user'] ?? record['data'] ?? record['result'] ?? response;
  }

  private asArray(value: unknown): any[] {
    return Array.isArray(value) ? value : [];
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private getCurrentUserId(): string {
    const user = this.authService.currentUserData;
    const userId = String(user?.id ?? user?._id ?? '').trim();

    if (!userId) {
      throw new Error('No se encontró el id del usuario actual en la sesión.');
    }

    return userId;
  }
}
