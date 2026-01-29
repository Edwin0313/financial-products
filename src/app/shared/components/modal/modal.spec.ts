import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modal } from './modal';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('debe emitir el evento closed al hacer clic en el botón de cerrar', () => {
    const spy = jest.spyOn(component.closed, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.close-btn');

    closeBtn.click();

    expect(spy).toHaveBeenCalled();
  });

  it('debe emitir el evento closed al hacer clic en el overlay', () => {
    const spy = jest.spyOn(component.closed, 'emit');
    const overlay = fixture.nativeElement.querySelector('.modal-overlay');

    overlay.click();

    expect(spy).toHaveBeenCalled();
  });
});
