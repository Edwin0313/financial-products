import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../../core/models/product.model';

@Component({
  selector: 'app-product-actions',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-actions.html',
  styleUrl: './product-actions.scss',
})
export class ProductActions {
  private readonly _elementRef = inject(ElementRef);

  product = input.required<Product>();
  delete = output<void>();

  isOpen = signal(false);

  toggleMenu(): void {
    this.isOpen.update(v => !v);
  }

  onDelete(): void {
    this.delete.emit();
    this.isOpen.set(false);
  }

  // Escucha clics en todo el documento para cerrar el menú si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
