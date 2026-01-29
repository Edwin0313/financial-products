import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ProductService } from './product.service';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ProductService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ]
        });
        service = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('debe obtener productos y retornar la data (GET)', () => {
        const mockData = { data: [{ id: '1', name: 'Test' }] };
        service.getProducts().subscribe(res => {
            expect(res.data.length).toBe(1);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/products`);
        expect(req.request.method).toBe('GET');
        req.flush(mockData);
    });

    it('debe verificar un ID existente (GET)', () => {
        service.verifyId('abc').subscribe(val => expect(val).toBe(true));
        const req = httpMock.expectOne(`${environment.apiUrl}/products/verification/abc`);
        req.flush(true);
    });

    it('debe crear un producto (POST)', () => {
        const newProd = { id: '2' } as any;
        service.createProduct(newProd).subscribe();
        const req = httpMock.expectOne(`${environment.apiUrl}/products`);
        expect(req.request.method).toBe('POST');
        req.flush({ message: 'Success' });
    });
    it('debe manejar error 404 al intentar eliminar un producto inexistente', () => {
        const productId = 'no-existe';

        service.deleteProduct(productId).subscribe({
            error: (err) => {
                expect(err.status).toBe(404);
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/products/${productId}`);
        req.flush('Error', { status: 404, statusText: 'Not Found' });
    });
    it('debe manejar error al verificar ID', () => {
        service.verifyId('123').subscribe({
            next: () => fail('debería haber fallado'),
            error: (error) => {
                expect(error.status).toBe(500);
            }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/products/verification/123`);
        req.flush('Error de servidor', { status: 500, statusText: 'Server Error' });
    });
});