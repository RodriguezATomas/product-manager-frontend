import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { UsersService } from '../users/services/users.service';
import { CartService, Purchase } from '../products/services/cart.service';
import { ProductsService } from '../products/services/products.service';
import { RepairsService } from '../repairs/services/repairs.service';

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
      value: '0',
      helper: 'Total en catálogo',
      icon: 'inventory_2'
    },
    {
      label: 'Usuarios',
      value: '0',
      helper: 'Registrados',
      icon: 'group'
    },
    {
      label: 'Ventas',
      value: '$0',
      helper: 'Total ingresos',
      icon: 'shopping_cart'
    },
    {
      label: 'Reparaciones',
      value: '0',
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
      route: '/dashboard/purchases'
    },
    {
      label: 'Ver reparaciones',
      icon: 'build_circle',
      route: '/repairs'
    },
    {
      label: 'Turnos del día',
      icon: 'event',
      route: '/dashboard/appointments'
    }
  ];

  selectedPurchase: Purchase | null = null;
  private recentSalesData: RecentSale[] = [];

  lowStockProducts: LowStockProduct[] = [];

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private cartService: CartService,
    private productsService: ProductsService,
    private usersService: UsersService,
    private repairsService: RepairsService,
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
    return this.recentSalesData;
  }

  ngOnInit(): void {
    if (!this.isAdmin) {
      this.router.navigate(['/products']);
      return;
    }

    this.cartService.getPurchases(this.currentUserName).subscribe((purchases) => {
      this.recentSalesData = purchases.slice(0, 5).map((purchase) => ({
        id: purchase.id,
        user: purchase.user,
        status: purchase.status,
        date: purchase.date,
        purchase
      }));
      this.updateStat('Ventas', this.formatCurrency(purchases.reduce((total, purchase) => total + purchase.total, 0)));
    });

    this.productsService.getProducts().subscribe((products) => {
      this.updateStat('Productos', String(products.length));
      this.lowStockProducts = products
        .filter((product) => product.stock <= 5)
        .sort((firstProduct, secondProduct) => firstProduct.stock - secondProduct.stock)
        .map((product) => ({
          name: product.name,
          stock: product.stock
        }));
    });

    this.usersService.getUsers({ pageIndex: 0, pageSize: 1 }).subscribe((users) => {
      this.updateStat('Usuarios', String(users.total));
    });

    this.repairsService.getRepairs().subscribe((repairs) => {
      const activeRepairs = repairs.filter((repair) => repair.status !== 'completed' && repair.status !== 'cancelled');
      this.updateStat('Reparaciones', String(activeRepairs.length));
    });
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

  backToSales(): void {
    this.selectedPurchase = null;
  }

  private updateStat(label: string, value: string): void {
    this.stats = this.stats.map((stat) => (stat.label === label ? { ...stat, value } : stat));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(value);
  }
}
