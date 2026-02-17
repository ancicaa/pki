import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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


  private users = [
    { username: 'admin', password: 'admin123', role: 'admin' },
    { username: 'ana', password: '1234', role: 'admin' },
  ];

  constructor(private router: Router) {}

  goToHome() {
    // Proveri hardkodovane
    const hardcoded = this.users.find(
      u => u.username === this.username && u.password === this.password
    );
  
    // Proveri registrovane iz sessionStorage
    const registered = JSON.parse(sessionStorage.getItem('users') || '[]');
    const found = hardcoded || registered.find(
      (u: any) => u.username === this.username && u.password === this.password
    );
  
    if (found) {
      this.errorMessage = '';
      sessionStorage.setItem('currentUser', JSON.stringify(found));
      this.router.navigate(['/admin']);
    } else {
      this.errorMessage = 'Pogrešno korisničko ime ili lozinka.';
    }
  }
}