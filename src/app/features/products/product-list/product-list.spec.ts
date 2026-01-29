import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ProductService } from '../../../core/services/product.service';
import { ProductList } from './product-list';

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;
  let service: any;

  beforeEach(async () => {
    service = {
      getProducts: jest.fn().mockReturnValue(of({ data: [{ id: '1', name: 'Visa' }] })),
      deleteProduct: jest.fn().mockReturnValue(of({}))
    };

    await TestBed.configureTestingModule({
      imports: [ProductList],
      providers: [
        { provide: ProductService, useValue: service },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe filtrar los productos cuando el usuario escribe en el buscador', () => {
    component.products.set([
      { id: '1', name: 'Visa', description: 'Visa card' } as any,
      { id: '2', name: 'Master', description: 'Master card' } as any
    ]);
    component.searchTerm.set('Visa');
    fixture.detectChanges();
    expect(component.filteredProducts().length).toBe(1);
  });

  it('debe abrir el modal al intentar eliminar un producto', () => {
    const mockProd = { id: '1', name: 'Visa' } as any;
    component.confirmDelete(mockProd);
    expect(component.productToDelete()).toEqual(mockProd);
  });

  it('debe ejecutar la eliminación al confirmar', () => {
    const mockProd = { id: '1' } as any;
    component.productToDelete.set(mockProd);
    component.executeDelete();
    expect(service.deleteProduct).toHaveBeenCalledWith('1');
    expect(component.productToDelete()).toBeNull();
  });
  it('debe cambiar la cantidad de items por página y resetear a la primera página', () => {
    const event = { target: { value: '10' } } as any;
    component.onItemsPerPageChange(event);

    expect(component.itemsPerPage()).toBe(10);
    expect(component.currentPage()).toBe(1);
  });

  it('debe retornar todos los productos si el término de búsqueda está vacío', () => {
    component.products.set([{ id: '1', name: 'A' } as any]);
    component.searchTerm.set('');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(1);
  });
  it('debe mostrar lista vacía si no hay coincidencias en la búsqueda', () => {
    component.products.set([{ name: 'Visa', description: 'Visa card' } as any]);
    component.searchTerm.set('Mastercard');
    fixture.detectChanges();

    expect(component.filteredProducts().length).toBe(0);
    const emptyMsg = fixture.nativeElement.querySelector('td[colspan="6"]');
    expect(emptyMsg.textContent).toContain('No se encontraron resultados');
  });
  it('debe mostrar el skeleton mientras isLoading es true', () => {
    component.isLoading.set(true);
    fixture.detectChanges();

    const skeletons = fixture.debugElement.queryAll(By.css('[app-skeleton-row]'));
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('debe ocultar el skeleton y mostrar la tabla cuando isLoading es false', () => {
    component.isLoading.set(false);
    component.products.set([{ id: '1', name: 'Test' } as any]);
    fixture.detectChanges();

    const skeletons = fixture.debugElement.queryAll(By.css('[app-skeleton-row]'));
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));

    expect(skeletons.length).toBe(0);
    expect(rows.length).toBe(1);
  });

  it('no debe hacer nada en executeDelete si no hay un producto seleccionado (else path)', () => {
    component.productToDelete.set(null);
    component.executeDelete();
    expect(service.deleteProduct).not.toHaveBeenCalled();
  });

  it('debe manejar errores del servidor al intentar eliminar un producto', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockProd = { id: '123' } as any;

    service.deleteProduct.mockReturnValue(throwError(() => new Error('Error al eliminar')));

    component.productToDelete.set(mockProd);
    component.executeDelete();

    expect(consoleSpy).toHaveBeenCalledWith('Error al eliminar', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('debe cargar productos y apagar el loading al iniciar', () => {
    const spy = jest.spyOn(service, 'getProducts');
    component.loadProducts();

    expect(spy).toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
  });

  it('debe manejar error al cargar productos y apagar el loading', () => {
    service.getProducts.mockReturnValue(throwError(() => new Error('API Error')));
    component.loadProducts();

    expect(component.isLoading()).toBe(false);
  });
});