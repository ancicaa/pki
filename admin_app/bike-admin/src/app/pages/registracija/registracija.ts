import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registracija',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './registracija.html',
  styleUrl: './registracija.css',
})
export class Registracija {

  username = '';
  ime = '';
  prezime = '';
  password = '';
  telefon = '';
  email = '';
  errorMessage = '';
  isLoading = false;

  private baseUrl = 'http://localhost:3000';

  constructor(
    private router: Router,
    private http: HttpClient,
    private auth: AuthService
  ) {}

  registruj() {
    this.errorMessage = '';

    if (!this.username || !this.ime || !this.prezime ||
        !this.password || !this.telefon || !this.email) {
      this.errorMessage = 'Sva polja su obavezna.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Lozinka mora imati najmanje 6 karaktera.';
      return;
    }

    this.isLoading = true;

    // Proveri da li username već postoji
    this.http.get<any[]>(`${this.baseUrl}/users?username=${this.username}`)
      .pipe(take(1))
      .subscribe({
        next: (existing) => {
          if (existing.length > 0) {
            this.errorMessage = 'Korisničko ime već postoji.';
            this.isLoading = false;
            return;
          }

          const newUser = {
            username: this.username,
            ime: this.ime,
            prezime: this.prezime,
            password: this.password,
            telefon: this.telefon,
            email: this.email,
            role: 'admin'
          };

          this.http.post<any>(`${this.baseUrl}/users`, newUser)
            .pipe(take(1))
            .subscribe({
              next: (created) => {
                this.auth.setCurrentUser(created);
                this.router.navigate(['/admin']);
              },
              error: () => {
                this.errorMessage = 'Greška pri registraciji. Pokušajte ponovo.';
                this.isLoading = false;
              }
            });
        },
        error: () => {
          this.errorMessage = 'Greška pri proveri korisničkog imena.';
          this.isLoading = false;
        }
      });
  }
}