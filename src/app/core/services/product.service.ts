import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private readonly _http = inject(HttpClient);
    private readonly _apiUrl = environment.apiUrl;

    /**
     * Obtiene el listado de productos [F1].
     * Endpoint: GET /bp/products
     */
    getProducts(): Observable<{ data: Product[] }> {
        return this._http.get<{ data: Product[] }>(`${this._apiUrl}/products`);
    }

    /**
     * Verifica si un ID ya existe [F4 - Validación].
     * Endpoint: GET /bp/products/verification/:id
     * Retorna true si existe, false si no.
     */
    verifyId(id: string): Observable<boolean> {
        return this._http.get<boolean>(`${this._apiUrl}/products/verification/${id}`);
    }

    /**
     * Crea un nuevo producto [F4].
     * Endpoint: POST /bp/products
     */
    createProduct(product: Product): Observable<{ message: string; data: Product }> {
        return this._http.post<{ message: string; data: Product }>(
            `${this._apiUrl}/products`,
            product
        );
    }

    /**
     * Actualiza un producto existente [F5].
     * Endpoint: PUT /bp/products/:id
     */
    updateProduct(product: Product): Observable<{ message: string; data: Product }> {
        return this._http.put<{ message: string; data: Product }>(
            `${this._apiUrl}/products/${product.id}`,
            product
        );
    }

    /**
     * Elimina un producto [F6].
     * Endpoint: DELETE /bp/products/:id
     */
    deleteProduct(id: string): Observable<{ message: string }> {
        return this._http.delete<{ message: string }>(`${this._apiUrl}/products/${id}`);
    }
}