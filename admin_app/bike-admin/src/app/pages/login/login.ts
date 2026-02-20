import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service.js';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading = false;

  constructor(private router: Router, private auth: AuthService, private cdr: ChangeDetectorRef) {}

  goToHome() {
    this.errorMessage = '';

    const username = this.username.trim();
    const password = this.password;

    if (!username || !password) {
      this.errorMessage = 'Unesite korisničko ime i lozinku.';
      return;
    }

    this.isLoading = true;

    this.auth.login(username, password).subscribe({
      next: (user) => {
        this.isLoading = false;
        console.log('user:', user);

        if (!user) {
          this.errorMessage = 'Pogrešno korisničko ime ili lozinka.';
          this.cdr.detectChanges();
        return;
        }

        this.auth.setCurrentUser(user);
        this.router.navigate(['/admin']);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Greška pri konekciji na server';
      }
    });
  }
}
