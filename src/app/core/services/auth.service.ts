import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment'; // Asegurate de tener configurado tu API_URL aquí

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // El BehaviorSubject guarda el valor actual de la sesión (token o datos del usuario)
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient) {
    // Al iniciar, revisamos si hay un usuario en el localStorage
    let currentUser: any = { token: undefined };
    const savedUser = localStorage.getItem('token');
    
    if (savedUser) {
      try {
        // Intenta parsear como JSON
        currentUser = JSON.parse(savedUser);
      } catch (e) {
        // Si no es JSON, es probablemente un JWT token directo
        currentUser = { token: savedUser };
      }
    }
    
    this.currentUserSubject = new BehaviorSubject<any>(currentUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  // Getter simple para obtener el valor actual del usuario sin suscribirse
  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(map(response => {
        // Si el login es exitoso, guardamos el usuario/token en localStorage
        localStorage.setItem('token', JSON.stringify(response));
        this.currentUserSubject.next(response);
        return response;
      }));
  }

  register(userData: { email: string; password: string; name?: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, userData)
      .pipe(map(response => {
        // Si el registro es exitoso, guardamos el usuario/token en localStorage
        localStorage.setItem('token', JSON.stringify(response));
        this.currentUserSubject.next(response);
        return response;
      }));
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUserSubject.next({token: undefined});
  }
}