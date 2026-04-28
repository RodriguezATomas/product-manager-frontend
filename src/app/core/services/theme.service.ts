import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // NUEVO: servicio global disponible en toda la app sin registrar en providers.
})
export class ThemeService {
  private readonly storageKey = 'app-theme'; // NUEVO: clave de localStorage para persistir el tema.
  private darkTheme = false; // NUEVO: estado interno del tema actual.

  get isDarkTheme(): boolean {
    return this.darkTheme; // NUEVO: getter para consultar el estado desde componentes.
  }

  initTheme(): void {
    const savedTheme = localStorage.getItem(this.storageKey); // NUEVO: recupera preferencia guardada.
    this.darkTheme = savedTheme === 'dark'; // NUEVO: define estado inicial.
    this.applyThemeClass(); // NUEVO: aplica clase CSS al body al iniciar la app.
  }

  toggleTheme(): void {
    this.darkTheme = !this.darkTheme; // NUEVO: alterna claro/oscuro.
    localStorage.setItem(this.storageKey, this.darkTheme ? 'dark' : 'light'); // NUEVO: persiste elección.
    this.applyThemeClass(); // NUEVO: refresca clases del body para impactar toda la UI.
  }

  private applyThemeClass(): void {
    document.body.classList.remove('light-theme', 'dark-theme'); // NUEVO: limpia clases previas.
    document.body.classList.add(this.darkTheme ? 'dark-theme' : 'light-theme'); // NUEVO: aplica clase activa.
  }
}
