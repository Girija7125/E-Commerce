import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Products } from '../products/products';
import { Orders } from '../orders/orders';
import { Customers } from '../customers/customers';
import { AuthService } from './auth';

export interface PaginatedOrders {
  data: Orders[];
  total: number;
  page: number;
  totalPages: number;
}
export interface PaginatedProducts {
  data: Products[];
  total: number;
  page: number;
  totalPages: number;
}
export interface PaginatedCustomers {
  data: Customers[];
  total: number;
  page: number;
  totalPages: number;
}
export interface Theme {
  headerBg: string;
  headerText: string;
  sidebarBg: string;
  sidebarText: string;
}

@Injectable({ providedIn: 'root' })
export class Data {
  private apiUrl = 'http://localhost:3000';


  constructor(private http: HttpClient,private auth: AuthService) {}

   private get options() {
    const token = this.auth.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }


  getTheme() {
  return this.http.get<Theme>(`${this.apiUrl}/api/theme`);
}

setTheme(theme: Theme) {
  return this.http.put<Theme>(`${this.apiUrl}/api/theme`, theme);
}

  // Customer Section
  getCustomers(page: number = 1, limit: number = 5) {
    return this.http.get<PaginatedCustomers>(
      `${this.apiUrl}/api/customers?page=${page}&limit=${limit}`,
       this.options
    );
  }

  addCustomer(customer: any) {
    return this.http.post<Customers>(
      `${this.apiUrl}/api/customers`,
      customer,
      this.options
    );
  }

  searchCustomers(query: string, page: number = 1, limit: number = 5) {
    return this.http.post<PaginatedCustomers>(
      `${this.apiUrl}/api/customers/search`,
      { q: query, page, limit },
      this.options   
    );
  }

  searchCustomersByField(
    name?: string, email?: string, joined?: string,
    active?: string, from?: string, to?: string,
    page: number = 1, limit: number = 5,
  ) {
    const body: any = { page, limit };
    if (name)   body.name   = name;
    if (email)  body.email  = email;
    if (joined) body.joined = joined;
    if (active) body.active = active;
    if (from)   body.from   = from;
    if (to)     body.to     = to;
    return this.http.post<PaginatedCustomers>(
      `${this.apiUrl}/api/customers/search`,
      body,
      this.options   
    );
  }

  updateCustomer(id: string, customer: any) {
    return this.http.put<Customers>(
      `${this.apiUrl}/api/customers/${id}`,
      customer,
       this.options  
    );
  }

  deleteCustomer(id: string) {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/customers/${id}`,
        this.options 
    );
  }

  // Order Section
  getOrders(page: number = 1, limit: number = 5) {
    return this.http.get<PaginatedOrders>(
      `${this.apiUrl}/api/orders?page=${page}&limit=${limit}`,
         this.options
    );
  }

  addOrder(order: any) {
    return this.http.post<Orders>(
      `${this.apiUrl}/api/orders`,
      order,
       this.options  
    );
  }

  searchOrders(query: string, page: number = 1, limit: number = 5) {
    return this.http.post<PaginatedOrders>(
      `${this.apiUrl}/api/orders/search`,
      { q: query, page, limit },
        this.options 
    );
  }

  searchOrdersByField(
    q?: string, date?: string, from?: string, to?: string,
    status?: string, page: number = 1, limit: number = 5,
  ) {
    const body: any = { page, limit };
    if (q)      body.q      = q.trim();
    if (date)   body.date   = date;
    if (from)   body.from   = from;
    if (to)     body.to     = to;
    if (status) body.status = status.trim();
    return this.http.post<PaginatedOrders>(
      `${this.apiUrl}/api/orders/search`,
      body,
       this.options  
    );
  }

  updateOrder(id: string, order: any) {
    return this.http.put<Orders>(
      `${this.apiUrl}/api/orders/${id}`,
      order,
       this.options  
    );
  }

  deleteOrder(id: string) {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/orders/${id}`,
       this.options  
    );
  }

  // Product Section
  getProducts(page: number = 1, limit: number = 5) {
    return this.http.get<PaginatedProducts>(
      `${this.apiUrl}/api/products?page=${page}&limit=${limit}`,
       this.options  
    );
  }

  addProduct(product: any) {
    return this.http.post<Products>(
      `${this.apiUrl}/api/products`,
      product,
      this.options
    );
  }

  searchProducts(query: string, page: number = 1, limit: number = 5) {
    return this.http.post<PaginatedProducts>(
      `${this.apiUrl}/api/products/search`,
      { q: query, page, limit },
       this.options  
    );
  }

  searchProductsByField(
    name?: string, price?: string, stock?: string,
    minPrice?: string, maxPrice?: string,
    page: number = 1, limit: number = 5,
  ) {
    const body: any = { page, limit };
    if (name)     body.name     = name;
    if (price)    body.price    = price;
    if (stock)    body.stock    = stock;
    if (minPrice) body.minPrice = minPrice;
    if (maxPrice) body.maxPrice = maxPrice;
    return this.http.post<PaginatedProducts>(
      `${this.apiUrl}/api/products/search`,
      body,
       this.options  
    );
  }

  updateProduct(id: string, product: any) {
    return this.http.put<Products>(
      `${this.apiUrl}/api/products/${id}`,
      product, 
      this.options 
    );
  }

  deleteProduct(id: string) {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/api/products/${id}`,  
      this.options
    );
  }
}