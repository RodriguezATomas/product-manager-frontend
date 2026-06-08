import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkTheme = true;

  get isDarkTheme(): boolean {
    return this.darkTheme;
  }

  initTheme(): void {
    this.applyThemeClass();
  }

  toggleTheme(): void {
    this.applyThemeClass();
  }

  private applyThemeClass(): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add('dark-theme');
  }
}
