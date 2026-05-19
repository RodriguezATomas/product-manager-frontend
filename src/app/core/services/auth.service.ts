import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  isEmailVerified?: boolean;
  verified?: boolean;
  status?: string;
}

export interface AuthSession {
  token?: string;
  tokens?: {
    access?: {
      token?: string;
    };
  };
  user?: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<AuthSession>;
  public currentUser$: Observable<AuthSession>;

  constructor(private http: HttpClient) {
    let currentUser: AuthSession = { token: undefined };
    const savedUser = localStorage.getItem('token');

    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
      } catch {
        currentUser = { token: savedUser };
      }
    }

    this.currentUserSubject = new BehaviorSubject<AuthSession>(currentUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): AuthSession {
    return this.currentUserSubject.value;
  }

  public get currentUserData(): AuthUser | undefined {
    return this.currentUserSubject.value?.user;
  }

  public get currentUserRole(): string {
    return String(this.currentUserData?.role ?? '');
  }

  public isAuthenticated(): boolean {
    const token = this.currentUserValue?.tokens?.access?.token || this.currentUserValue?.token;
    return Boolean(token && token !== 'undefined');
  }

  public hasRole(...roles: string[]): boolean {
    const currentRole = this.currentUserRole;
    return roles.includes(currentRole);
  }

  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/auth/login`, credentials).pipe(
      map((response) => {
        this.persistSession(response);
        return response;
      })
    );
  }

  register(userData: { email: string; password: string; name?: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/auth/register`, userData).pipe(
      map((response) => {
        this.persistSession(response);
        return response;
      })
    );
  }

  updateStoredUser(user: AuthUser): void {
    const currentSession = this.currentUserSubject.value || {};
    const nextSession: AuthSession = {
      ...currentSession,
      user: {
        ...currentSession.user,
        ...user
      }
    };

    this.persistSession(nextSession);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next({ token: undefined });
  }

  private persistSession(session: AuthSession): void {
    localStorage.setItem('token', JSON.stringify(session));
    this.currentUserSubject.next(session);
  }
}
