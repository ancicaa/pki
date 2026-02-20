import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type UserRole = 'admin' | 'user';

export interface AppUser {
    id: number;
    username: string;
    password: string;
    role: UserRole;
    ime?: string;
    prezime?: string;
    telefon?: string;
    email?: string;
  }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

//   login(username: string, password: string): Observable<AppUser | null> {
//     const params = new HttpParams()
//       .set('username', username.trim())
//       .set('password', password);

//     return this.http.get<AppUser[]>(`${this.baseUrl}/users`, { params }).pipe(
//       map(users => (users.length ? users[0] : null))
//     );
//   }

login(username: string, password: string): Observable<AppUser | null> {
    const params = new HttpParams().set('username', username.trim());
  
    return this.http.get<AppUser[]>(`${this.baseUrl}/users`, { params }).pipe(
      map(users => {
        if (users.length === 0) return null;
        const user = users[0];
        if (user.password !== password) return null;
        return user;
      })
    );
  }

  setCurrentUser(user: AppUser) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  getCurrentUser(): AppUser | null {
    const raw = sessionStorage.getItem('currentUser');
    return raw ? (JSON.parse(raw) as AppUser) : null;
  }

  logout() {
    sessionStorage.removeItem('currentUser');
  }
}
