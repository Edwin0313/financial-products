import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ProductService } from '../../../core/services/product.service';
@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductForm implements OnInit {
  private readonly _fb = inject(NonNullableFormBuilder);
  private readonly _productService = inject(ProductService);
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  isEditMode = signal(false);
  title = signal('Formulario de Registro');

  form = this._fb.group({
    id: ['', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(10)],
      asyncValidators: [this.idValidator.bind(this)],
      updateOn: 'blur'
    }],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', Validators.required],
    date_release: ['', [Validators.required, this.dateReleaseValidator]],
    date_revision: [{ value: '', disabled: true }, Validators.required]
  });

  ngOnInit() {
    const id = this._route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.title.set('Formulario de Edición');
      this.form.controls.id.disable();
      this.loadProductData(id);
    }
  }

  private loadProductData(id: string) {
    this._productService.getProducts().subscribe(res => {
      const product = res.data.find(p => p.id === id);
      if (product) {
        const formattedProduct = {
          ...product,
          date_release: product.date_release.split('T')[0],
          date_revision: product.date_revision.split('T')[0]
        };
        this.form.patchValue(formattedProduct);
      }
    });
  }

  private idValidator(control: AbstractControl) {
    if (this.isEditMode()) return of(null);
    return this._productService.verifyId(control.value).pipe(
      map(exists => (exists ? { idExists: true } : null)),
      catchError(() => of(null))
    );
  }

  private dateReleaseValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today ? null : { invalidDate: true };
  }

  onDateReleaseChange() {
    const releaseValue = this.form.controls.date_release.value;
    if (releaseValue) {
      const date = new Date(releaseValue);
      date.setFullYear(date.getFullYear() + 1);
      this.form.controls.date_revision.setValue(date.toISOString().split('T')[0]);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const productData = this.form.getRawValue() as Product;
      const request$ = this.isEditMode()
        ? this._productService.updateProduct(productData)
        : this._productService.createProduct(productData);

      request$.subscribe({
        next: () => this._router.navigate(['/products']),
        error: (err) => console.error('Error en operación:', err)
      });
    }
  }

  resetForm() {
    if (this.isEditMode()) {
      const currentId = this.form.controls.id.value;
      this.loadProductData(currentId);
    } else {
      this.form.reset();
    }
  }
}
