import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { CartService, Purchase } from '../products/services/cart.service';

interface DashboardStat {
  label: string;
  value: string;
  helper: string;
  icon: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
}

interface RecentSale {
  id: string;
  user: string;
  status: string;
  date: string;
  purchase: Purchase;
}

interface LowStockProduct {
  name: string;
  stock: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStat[] = [
    {
      label: 'Productos',
      value: '128',
      helper: 'Total en catálogo',
      icon: 'inventory_2'
    },
    {
      label: 'Usuarios',
      value: '246',
      helper: 'Registrados',
      icon: 'group'
    },
    {
      label: 'Ventas',
      value: '$2,450,000',
      helper: 'Total ingresos',
      icon: 'shopping_cart'
    },
    {
      label: 'Reparaciones',
      value: '18',
      helper: 'En proceso',
      icon: 'build'
    }
  ];

  quickActions: QuickAction[] = [
    {
      label: 'Nuevo producto',
      icon: 'add_box',
      route: '/products'
    },
    {
      label: 'Ver compras',
      icon: 'shopping_bag',
      route: '/dashboard'
    },
    {
      label: 'Ver reparaciones',
      icon: 'build_circle',
      route: '/dashboard'
    },
    {
      label: 'Turnos del día',
      icon: 'event',
      route: '/dashboard'
    }
  ];

  selectedPurchase: Purchase | null = null;

  lowStockProducts: LowStockProduct[] = [
    {
      name: 'Teclado Mecánico',
      stock: 5
    },
    {
      name: 'Mouse Gamer',
      stock: 3
    },
    {
      name: 'Auriculares RGB',
      stock: 2
    },
    {
      name: 'Monitor 24"',
      stock: 1
    }
  ];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private cartService: CartService,
    private router: Router
  ) {}

  get currentUserName(): string {
    return this.authService.currentUserData?.name || 'Admin';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentUserRoleLabel(): string {
    return this.isAdmin ? 'Administrador' : 'Usuario';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme;
  }

  get recentSales(): RecentSale[] {
    return this.cartService.getPurchases().map((purchase) => ({
      id: purchase.id,
      user: purchase.user,
      status: purchase.status,
      date: purchase.date,
      purchase
    }));
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/products']);
      return;
    }

  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  selectPurchase(purchase: Purchase): void {
    this.selectedPurchase = purchase;
  }
}
