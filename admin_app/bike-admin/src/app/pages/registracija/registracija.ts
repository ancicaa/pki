import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registracija',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './registracija.html',
  styleUrl: './registracija.css',
})
export class Registracija {

  username: string = '';
  ime: string = '';
  prezime: string = '';
  password: string = '';
  telefon: string = '';
  email: string = '';
  errorMessage: string = '';

  constructor(private router: Router) {}

  registruj() {
    if (!this.username || !this.ime || !this.prezime || 
        !this.password || !this.telefon || !this.email) {
      this.errorMessage = 'Sva polja su obavezna.';
      return;
    }

    const existing = JSON.parse(sessionStorage.getItem('users') || '[]');

    const userExists = existing.find((u: any) => u.username === this.username);
    if (userExists) {
      this.errorMessage = 'Korisničko ime već postoji.';
      return;
    }

    const newUser = {
      username: this.username,
      ime: this.ime,
      prezime: this.prezime,
      password: this.password,
      telefon: this.telefon,
      email: this.email,
      role: 'user'
    };

    existing.push(newUser);
    sessionStorage.setItem('users', JSON.stringify(existing));
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));

    this.router.navigate(['/admin']);
  }
}