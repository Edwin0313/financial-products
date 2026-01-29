import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { ProductActions } from './product-actions';

describe('ProductActions', () => {
  let component: ProductActions;
  let fixture: ComponentFixture<ProductActions>;

  const mockProduct = { id: 'test-1', name: 'Product' } as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductActions],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductActions);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
    fixture.detectChanges();
  });

  it('debe iniciar con el menú cerrado', () => {
    expect(component.isOpen()).toBe(false);
    const menu = fixture.debugElement.query(By.css('.dropdown-menu'));
    expect(menu).toBeNull();
  });

  it('debe alternar (toggle) el estado del menú al hacer clic en el botón', () => {
    const button = fixture.debugElement.query(By.css('.trigger-btn'));

    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    button.nativeElement.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('debe emitir el evento de eliminación y cerrar el menú', () => {
    const spy = jest.spyOn(component.delete, 'emit');
    component.isOpen.set(true);
    fixture.detectChanges();

    const deleteBtn = fixture.debugElement.query(By.css('.delete-btn'));
    deleteBtn.nativeElement.click();

    expect(spy).toHaveBeenCalled();
    expect(component.isOpen()).toBe(false);
  });

  it('debe cerrar el menú al hacer clic fuera del componente', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.isOpen()).toBe(false);
  });
  it('debe alternar el estado de isOpen al llamar a toggleMenu()', () => {
    expect(component.isOpen()).toBe(false);
    component.toggleMenu();
    expect(component.isOpen()).toBe(true);
    component.toggleMenu();
    expect(component.isOpen()).toBe(false);
  });
  it('debe emitir el evento delete y cerrar el menú al llamar a onDelete()', () => {
    const emitSpy = jest.spyOn(component.delete, 'emit');
    component.isOpen.set(true);
    component.onDelete();
    expect(emitSpy).toHaveBeenCalled();
    expect(component.isOpen()).toBe(false);
  });
  it('debe llamar a toggleMenu() cuando se hace clic en el botón principal', () => {
    const spy = jest.spyOn(component, 'toggleMenu');
    const button = fixture.nativeElement.querySelector('.menu-button');

    button.click();

    expect(spy).toHaveBeenCalled();
  });

  it('debe llamar a onDelete() cuando se hace clic en la opción Eliminar', () => {
    component.isOpen.set(true);
    fixture.detectChanges();

    const spy = jest.spyOn(component, 'onDelete');
    const deleteBtn = fixture.nativeElement.querySelector('.delete');

    deleteBtn.click();

    expect(spy).toHaveBeenCalled();
  });
  it('no debe cerrar el menú si se hace clic DENTRO del componente', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.menu-button');
    button.click();
    const event = { target: button } as any;
    component.onClickOutside(event);
    expect(component.isOpen()).toBe(true);
  });
  it('no debe cerrar el menú si se hace clic DENTRO del componente (rama else)', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.trigger-btn')).nativeElement;
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: button, enumerable: true });
    component.onClickOutside(event);
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
  });
});