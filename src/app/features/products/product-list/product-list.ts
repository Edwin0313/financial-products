import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
import { Modal } from '../../../shared/components/modal/modal';
import { SkeletonTable } from '../../../shared/components/skeleton-table/skeleton-table';
import { ProductActions } from './components/product-actions/product-actions';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [DatePipe, RouterLink, Modal, ProductActions, SkeletonTable],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductList {
  private readonly _productService = inject(ProductService);
  products = signal<Product[]>([]);
  searchTerm = signal<string>('');
  itemsPerPage = signal<number>(5);
  currentPage = signal<number>(1);
  filteredProducts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const all = this.products();
    if (!term) return all;
    return all.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  });
  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProducts().slice(start, end);
  });
  totalResults = computed(() => this.filteredProducts().length);
  productToDelete = signal<Product | null>(null);
  isLoading = signal(true);

  constructor() {
    this.loadProducts();
  }
  loadProducts() {
    this.isLoading.set(true);
    this._productService.getProducts().subscribe({
      next: (res) => {
        this.products.set(res.data);
        setTimeout(() => {
          this.isLoading.set(false);
        }, 1000);
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.isLoading.set(false);
      }
    });
  }
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
  }
  onItemsPerPageChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage.set(Number(select.value));
    this.currentPage.set(1);
  }
  confirmDelete(product: Product) {
    this.productToDelete.set(product);
  }

  cancelDelete() {
    this.productToDelete.set(null);
  }

  executeDelete() {
    const product = this.productToDelete();
    if (product) {
      this._productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products.update(list => list.filter(p => p.id !== product.id));
          this.cancelDelete();
        },
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }
}