import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable,tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private adminUrl = 'http://localhost:3000/api/admin';

  private loggedIn$ = new BehaviorSubject<boolean>(!!sessionStorage.getItem('token'));

  private userSubject = new BehaviorSubject<any>(this.getUser());
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private get headers() {
    return { headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}` }) };
  }

  login(email: string, password: string): Observable<{ token: string; user: any }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/login`, {
      email,
      password,
    });
  }

  register(
    name: string,
    email: string,
    password: string,
  ): Observable<{ token: string; user: any }> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/register`, {
      name,
      email,
      password,
    });
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string }> {
    return this.http.post<{ message: string; resetToken?: string }>(
      `${this.apiUrl}/forgot-password`,
      { email },
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  logout(): void {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.loggedIn$.next(false);
    this.userSubject.next(null); 
    this.router.navigate(['/login']);
  }

  setLoggedIn(token: string, user: any): void {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    this.loggedIn$.next(true);
    this.userSubject.next(user);
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }
  getToken(): string | null {
    return sessionStorage.getItem('token');
  }
  getUser(): any {
    const u = sessionStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
  getRole(): string {
    return this.getUser()?.role || '';
  }
  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
  isDeveloper(): boolean {
    return this.getRole() === 'developer';
  }
  isUser(): boolean {
    return this.getRole() === 'user';
  }
  isReadOnly(): boolean {
    return this.getRole() === 'user';
  }

  canView(section: string): boolean {
    if (this.isAdmin()) return true;
    if (this.isUser()) return true;
    return this.getUser()?.permissions?.[section]?.view === true;
  }

  canAdd(section: string): boolean {
    if (this.isAdmin()) return true;
    if (this.isUser()) return false;
    return this.getUser()?.permissions?.[section]?.add === true;
  }

  canEdit(section: string): boolean {
    if (this.isAdmin()) return true;
    if (this.isUser()) return false;
    return this.getUser()?.permissions?.[section]?.edit === true;
  }

  canDelete(section: string): boolean {
    if (this.isAdmin()) return true;
    if (this.isUser()) return false;
    return this.getUser()?.permissions?.[section]?.delete === true;
  }

  hasPermission(section: string): boolean {
    return this.canView(section);
  }

  getAllUsers(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.adminUrl}/users`, this.headers);
  }

  createUser(
    name: string,
    email: string,
    password: string,
  ): Observable<{ message: string; user: any }> {
    return this.http.post<{ message: string; user: any }>(
      `${this.adminUrl}/users`,
      { name, email, password },
      this.headers,
    );
  }

  updateUser(
    userId: string,
    data: { name?: string; email?: string; role?: string },
  ): Observable<{ message: string; user: any }> {
    return this.http.put<{ message: string; user: any }>(
      `${this.adminUrl}/users/${userId}`,
      data,
      this.headers,
    );
  }

  deleteUser(userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminUrl}/users/${userId}`, this.headers);
  }
  
  getDevelopers(): Observable<{ users: any[] }> {
    return this.http.get<{ users: any[] }>(`${this.adminUrl}/developers`, this.headers);
  }

  createDeveloper(data: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/developers`, data, this.headers);
  }

  updateDeveloper(userId: string, data: any): Observable<{ message: string; user: any }> {
    return this.http.put<{ message: string; user: any }>(
      `${this.adminUrl}/developers/${userId}`,
      data,
      this.headers,
    );
  }

  deleteDeveloper(userId: string): Observable<any> {
    return this.http.delete(`${this.adminUrl}/developers/${userId}`, this.headers);
  }

   updateUserProfile(name: string, email: string): Observable<{ message: string; user: any }> {
    return this.http.put<{ message: string; user: any }>(
      `${this.apiUrl}/user/me`,
      { name, email },
      this.headers
    ).pipe(
      tap(response => {

        const currentUser = this.getUser();
        const updatedUser = { ...currentUser, name, email };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        this.userSubject.next(updatedUser);   
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/user/change-password`,
      { currentPassword, newPassword },
      this.headers,
    );
  }
}
