import { Component, OnInit } from '@angular/core';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'project-manager-frontend';

  constructor(private themeService: ThemeService) {} // NUEVO: inyección del servicio de tema global.

  ngOnInit(): void {
    this.themeService.initTheme(); // NUEVO: inicializa y aplica tema persistido al arrancar la app.
  }
}
