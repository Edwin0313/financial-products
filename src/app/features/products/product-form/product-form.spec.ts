import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { ProductForm } from './product-form';

describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;
  let service: any;

  beforeEach(async () => {
    service = {
      verifyId: jest.fn().mockReturnValue(of(false)),
      createProduct: jest.fn().mockReturnValue(of({})),
      updateProduct: jest.fn().mockReturnValue(of({})),
      getProducts: jest.fn().mockReturnValue(of({ data: [] }))
    };

    await TestBed.configureTestingModule({
      imports: [ProductForm, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: service },
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe validar que el nombre tenga al menos 5 caracteres', () => {
    const name = component.form.controls.name;
    name.setValue('abc');
    expect(name.invalid).toBeTruthy();
    name.setValue('Nombre Largo');
    expect(name.valid).toBeTruthy();
  });

  it('debe calcular la fecha de revisión sumando un año a la de liberación', () => {
    component.form.controls.date_release.setValue('2025-01-01');
    component.onDateReleaseChange();
    expect(component.form.controls.date_revision.value).toBe('2026-01-01');
  });

  it('debe llamar a createProduct en modo creación', () => {
    component.isEditMode.set(false);
    component.form.patchValue({
      id: 'id-123', name: 'Producto', description: 'Desc muy larga', logo: 'l.png', date_release: '2025-01-01'
    });
    component.onSubmit();
    expect(service.createProduct).toHaveBeenCalled();
  });
  it('debe llamar a updateProduct cuando el formulario está en modo edición', async () => {
    component.isEditMode.set(true);

    component.form.patchValue({
      id: 'test-edit',
      name: 'Producto Editado',
      description: 'Descripción válida y suficientemente larga',
      logo: 'logo.png',
      date_release: '2025-10-10',
      date_revision: '2026-10-10'
    });

    component.form.updateValueAndValidity();
    await fixture.whenStable();

    component.onSubmit();

    expect(service.updateProduct).toHaveBeenCalled();
  });
  it('debe recargar los datos originales al resetear en modo edición', () => {
    component.isEditMode.set(true);
    const spyLoad = jest.spyOn(component as any, 'loadProductData');

    component.resetForm();

    expect(spyLoad).toHaveBeenCalled();
  });
  it('debe manejar errores del servidor al intentar crear un producto', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    service.createProduct.mockReturnValue(throwError(() => new Error('Error de Servidor')));

    component.isEditMode.set(false);
    component.form.patchValue({ id: '1', name: 'Test', description: 'Desc...', logo: 'l.png', date_release: '2025-01-01' });

    component.onSubmit();

    expect(consoleSpy).toHaveBeenCalledWith('Error en operación:', expect.any(Error));
    consoleSpy.mockRestore();
  });
  it('debe retornar null en dateReleaseValidator si no hay valor', () => {
    const control = { value: '' } as any;
    const result = (component as any).dateReleaseValidator(control);
    expect(result).toBeNull();
  });

  it('no debe actualizar la fecha de revisión si releaseValue es nulo en onDateReleaseChange', () => {
    const revisionControl = component.form.controls.date_revision;
    revisionControl.setValue('2025-01-01');

    component.form.controls.date_release.setValue('');
    component.onDateReleaseChange();

    expect(revisionControl.value).toBe('2025-01-01');
  });

  it('no debe hacer nada en loadProductData si el producto no existe en la respuesta', () => {
    const patchSpy = jest.spyOn(component.form, 'patchValue');
    service.getProducts.mockReturnValue(of({ data: [] }));

    (component as any).loadProductData('id-inexistente');

    expect(patchSpy).not.toHaveBeenCalled();
  });

  it('debe retornar null en idValidator si el servicio falla (rama catchError)', (done) => {
    service.verifyId.mockReturnValue(throwError(() => new Error('Error')));
    component.isEditMode.set(false);

    const control = { value: 'test' } as any;
    const result$ = (component as any).idValidator(control);

    result$.subscribe((res: any) => {
      expect(res).toBeNull();
      done();
    });
  });
  it('no debe llamar al servicio en onSubmit si el formulario es inválido', () => {
    component.form.patchValue({ name: 'abc' });
    component.onSubmit();

    expect(service.createProduct).not.toHaveBeenCalled();
    expect(service.updateProduct).not.toHaveBeenCalled();
  });

  it('debe resetear el formulario completamente en modo creación (rama else de resetForm)', () => {
    component.isEditMode.set(false);
    const resetSpy = jest.spyOn(component.form, 'reset');

    component.resetForm();

    expect(resetSpy).toHaveBeenCalled();
  });

  it('no debe intentar cargar datos en ngOnInit si no hay ID en la ruta (rama else)', () => {
    (component as any)._route.snapshot.paramMap.get = () => null;
    const loadSpy = jest.spyOn(component as any, 'loadProductData');

    component.ngOnInit();

    expect(component.isEditMode()).toBe(false);
    expect(loadSpy).not.toHaveBeenCalled();
  });
  it('debe ejecutar la lógica de edición en ngOnInit cuando existe un ID', async () => {
    const route = TestBed.inject(ActivatedRoute);
    jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue('un-id-de-prueba');
    await component.ngOnInit();
    expect(component.isEditMode()).toBe(true);
    expect(component.title()).toBe('Formulario de Edición');
    expect(component.form.controls.id.disabled).toBe(true);
  });
  it('debe cargar los datos del producto en el formulario si el ID existe en la lista', async () => {
    const route = TestBed.inject(ActivatedRoute);
    jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue('prod-123');
    service.getProducts.mockReturnValue(of({
      data: [{
        id: 'prod-123',
        name: 'Tarjeta Oro',
        description: 'Desc',
        logo: 'l.png',
        date_release: '2025-01-01',
        date_revision: '2026-01-01'
      }]
    }));
    await component.ngOnInit();
    fixture.detectChanges();
    expect(component.form.value.name).toBe('Tarjeta Oro');
  });
  it('debe navegar a /products cuando el formulario se envía con éxito', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');
    service.createProduct.mockReturnValue(of({ data: {} }));

    component.isEditMode.set(false);

    component.form.patchValue({
      id: 'test-123',
      name: 'Producto Valido',
      description: 'Descripción con más de diez caracteres',
      logo: 'assets/logo.png',
      date_release: '2025-12-01',
      date_revision: '2026-12-01'
    });

    component.form.controls.id.updateValueAndValidity();
    fixture.detectChanges();
    await fixture.whenStable();
    component.onSubmit();
    expect(service.createProduct).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/products']);
  });

  it('debe mostrar un error en consola cuando el servicio falla', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const errorResponse = new Error('Error de conexión');
    service.createProduct.mockReturnValue(throwError(() => errorResponse));

    component.isEditMode.set(false);
    component.form.patchValue({
      id: 'test-123',
      name: 'Producto Valido',
      description: 'Descripción con más de diez caracteres',
      logo: 'assets/logo.png',
      date_release: '2025-12-01',
      date_revision: '2026-12-01'
    });

    component.form.controls.id.updateValueAndValidity();
    await fixture.whenStable();

    component.onSubmit();

    expect(consoleSpy).toHaveBeenCalledWith('Error en operación:', errorResponse);
    consoleSpy.mockRestore();
  });

  it('debe retornar of(null) en idValidator si está en modo edición', (done) => {
    component.isEditMode.set(true);
    const control = { value: 'cualquiera' } as any;

    const result$ = (component as any).idValidator(control);

    result$.subscribe((res: any) => {
      expect(res).toBeNull();
      done();
    });
  });
  it('debe resetear el formulario completamente en modo creación (rama else de resetForm)', () => {
    component.isEditMode.set(false);
    const resetSpy = jest.spyOn(component.form, 'reset');

    component.resetForm();

    expect(resetSpy).toHaveBeenCalled();
  });
});