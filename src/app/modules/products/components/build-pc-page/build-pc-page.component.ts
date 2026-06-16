import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize, retry } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { ProductsService } from '../../services/products.service';

interface BuildStep {
  key: string;
  label: string;
  category: string;
}

interface SelectedEntry {
  step: BuildStep;
  product: Product;
}

@Component({
  selector: 'app-build-pc-page',
  templateUrl: './build-pc-page.component.html',
  styleUrls: ['../../products.component.css', '../cart-page/cart-page.component.css', './build-pc-page.component.css']
})
export class BuildPcPageComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  currentStepIndex = 0;
  readonly fallbackProductImage = 'assets/images/esueldos-logo-azul.png';
  readonly steps: BuildStep[] = [
    { key: 'case', label: 'gabinetes', category: 'gabinetes' },
    { key: 'motherboard', label: 'placas madre', category: 'placas madre' },
    { key: 'processor', label: 'procesadores', category: 'procesadores' },
    { key: 'ram', label: 'memorias RAM', category: 'memorias RAM' },
    { key: 'storage', label: 'discos solidos', category: 'discos solidos' },
    { key: 'cooler', label: 'coolers', category: 'coolers' },
    { key: 'power', label: 'fuentes', category: 'fuentes' },
    { key: 'gpu', label: 'placas de video', category: 'placas de video' }
  ];
  selectedProducts: Record<string, Product> = {};

  constructor(
    private productsService: ProductsService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  get currentStep(): BuildStep {
    return this.steps[this.currentStepIndex];
  }

  get currentStepProducts(): Product[] {
    return this.products.filter((product) => this.matchesStep(product, this.currentStep));
  }

  get selectedList(): Product[] {
    return this.steps
      .map((step) => this.selectedProducts[step.key])
      .filter((product): product is Product => Boolean(product));
  }

  get selectedEntries(): SelectedEntry[] {
    return this.steps
      .map((step) => ({ step, product: this.selectedProducts[step.key] }))
      .filter((entry): entry is SelectedEntry => Boolean(entry.product));
  }

  get selectedTotal(): number {
    return this.selectedList.reduce((total, product) => total + product.price, 0);
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productsService.getProducts().pipe(
      retry({ count: 2, delay: 1000 }),
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.products = [];
        this.snackBar.open('No se pudieron cargar los componentes.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  selectProduct(product: Product): void {
    this.selectedProducts = {
      ...this.selectedProducts,
      [this.currentStep.key]: product
    };
  }

  clearSelection(stepKey: string): void {
    const { [stepKey]: _removedProduct, ...selectedProducts } = this.selectedProducts;
    this.selectedProducts = selectedProducts;
  }

  isSelected(product: Product): boolean {
    return this.selectedProducts[this.currentStep.key]?._id === product._id;
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex -= 1;
    }
  }

  nextStep(): void {
    if (!this.selectedProducts[this.currentStep.key]) {
      this.snackBar.open('Elegi un componente para continuar.', 'Cerrar', { duration: 2500 });
      return;
    }

    if (!this.isLastStep) {
      this.currentStepIndex += 1;
      return;
    }

    this.goToPayment();
  }

  goToPayment(): void {
    const missingStep = this.steps.find((step) => !this.selectedProducts[step.key]);

    if (missingStep) {
      this.snackBar.open(`Falta elegir ${missingStep.label}.`, 'Cerrar', { duration: 2500 });
      return;
    }

    for (const product of this.selectedList) {
      const cartItem = this.cartService.getItems().find((item) => item.product._id === product._id);

      if (product.stock <= 0 || (cartItem && cartItem.quantity >= product.stock)) {
        this.snackBar.open(`No hay stock disponible para ${product.name}.`, 'Cerrar', { duration: 3000 });
        return;
      }
    }

    this.selectedList.forEach((product) => this.cartService.addProduct(product));
    this.router.navigate(['/products/cart']);
  }

  getProductImage(product: Product): string {
    if (!product.imageUrl) {
      return this.fallbackProductImage;
    }

    return `${environment.apiUrl}${product.imageUrl}`;
  }

  handleProductImageError(event: Event): void {
    const imageElement = event.target as HTMLImageElement;
    imageElement.src = this.fallbackProductImage;
  }

  private matchesStep(product: Product, step: BuildStep): boolean {
    return this.normalize(product.category) === this.normalize(step.category);
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
