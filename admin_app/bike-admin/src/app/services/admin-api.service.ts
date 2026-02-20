import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type BikeStatus = 'Dostupan' | 'Iznajmljen' | 'Neispravan' | 'Na održavanju';

export interface User {
  id: number;
  username: string;
  password: string; 
  role: string;     
  ime?: string;
  prezime?: string;
  telefon?: string;
  email?: string;
}

export interface Bike {
    id: number;
    tip: string;
    cena: number;
    status: BikeStatus | string;
    //adresa?: string;
    latitude?: number;
    longitude?: number;
    baterija?: number;
  }

export interface BikeType {
  id: number;
  name: string;
}

export interface Rental {
  id: number;
  korisnik: string;
  datum: string;
  vreme: string;
  minuta: number;
  tip: string;
  cenaPoMinutu: number;
  cena: number;
  slika: string;
  bikeId: number | string;
}

export interface Problem {
  id: number;
  datum: string;
  korisnik: string;
  bikeId: number;
  opis: string;
  fotografija: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // -------- USERS --------
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: Omit<User, 'id'> | User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: number, patch: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, patch);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // (opciono) login query (ako želiš da AuthService koristi ovaj servis)
  findUserByCredentials(username: string, password: string): Observable<User[]> {
    const params = new HttpParams().set('username', username).set('password', password);
    return this.http.get<User[]>(`${this.baseUrl}/users`, { params });
  }

  // -------- BIKES --------
  getBikes(): Observable<Bike[]> {
    return this.http.get<Bike[]>(`${this.baseUrl}/bikes`);
  }

  getBike(id: number): Observable<Bike> {
    return this.http.get<Bike>(`${this.baseUrl}/bikes/${id}`);
  }

  createBike(bike: Bike): Observable<Bike> {
    return this.http.post<Bike>(`${this.baseUrl}/bikes`, bike);
  }

  updateBike(id: number, patch: Partial<Bike>): Observable<Bike> {
    return this.http.patch<Bike>(`${this.baseUrl}/bikes/${id}`, patch);
  }

  deleteBike(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bikes/${id}`);
  }

  // -------- BIKE TYPES --------
  getBikeTypes(): Observable<BikeType[]> {
    return this.http.get<BikeType[]>(`${this.baseUrl}/bikeTypes`);
  }

  // (opciono) CRUD za tipove, ako ti zatreba kasnije
  createBikeType(t: Omit<BikeType, 'id'> | BikeType): Observable<BikeType> {
    return this.http.post<BikeType>(`${this.baseUrl}/bikeTypes`, t);
  }

  updateBikeType(id: number, patch: Partial<BikeType>): Observable<BikeType> {
    return this.http.patch<BikeType>(`${this.baseUrl}/bikeTypes/${id}`, patch);
  }

  deleteBikeType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bikeTypes/${id}`);
  }

  // -------- RENTALS --------
  getRentals(): Observable<Rental[]> {
    return this.http.get<Rental[]>(`${this.baseUrl}/iznajmljivanja`);
  }

  getRental(id: number): Observable<Rental> {
    return this.http.get<Rental>(`${this.baseUrl}/iznajmljivanja/${id}`);
  }

  createRental(r: Rental): Observable<Rental> {
    return this.http.post<Rental>(`${this.baseUrl}/iznajmljivanja`, r);
  }

  updateRental(id: number, patch: Partial<Rental>): Observable<Rental> {
    return this.http.patch<Rental>(`${this.baseUrl}/iznajmljivanja/${id}`, patch);
  }

  deleteRental(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/iznajmljivanja/${id}`);
  }

  // -------- PROBLEMS --------
  getProblems(): Observable<Problem[]> {
    return this.http.get<Problem[]>(`${this.baseUrl}/prijavljeni_problemi`);
  }

  updateProblem(id: number, patch: Partial<Problem>): Observable<Problem> {
    return this.http.patch<Problem>(`${this.baseUrl}/prijavljeni_problemi/${id}`, patch);
  }

  deleteProblem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/prijavljeni_problemi/${id}`);
  }
}
