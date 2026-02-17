import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { Registracija } from './pages/registracija/registracija';


export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },
  {
    path: 'admin',
    component: Admin
  },
  {
    path: 'registracija',
    component: Registracija
  }
];
