import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

type MenuKey = 'bicikla' | 'iznajmljivanja' | 'problemi' | 'profil';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin {

  constructor(private router: Router) { }

  active: MenuKey = 'bicikla';
  editingProblemId: number | null = null;
  problemStatusOptions = ['Novo', 'Slanje bicikla na održavanje', 'Isključen iz sistema'];
  isChangePassOpen = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passError = '';

  isAddBikeOpen = false;

  editingStatusId: number | null = null;
  statusOptions = ['Dostupan', 'Iznajmljen', 'Neispravan', 'Na održavanju'];

  openedProblemId: number | null = null;

  isEditBikeOpen: boolean = false;
  editingBike: any = null;

  selectedIznajmljivanje: any = null;
  isIznajmljivanjeOpen = false;
  isEditingProfile = false;
 
  newBike = {
    id: '',
    tip: '',
    cena: null as number | null,
    status: 'Dostupan'
  };

  profile = {
    username: 'admin',
    ime: 'Ana',
    prezime: 'Vraneš',
    telefon: '+381 69 10 10 10',
    email: 'admin@test.com',
  };

  bikes = [
    { id: 23241, tip: 'Električni', cena: 12, status: 'Dostupan' },
    { id: 26733, tip: 'Gradski', cena: 7, status: 'Iznajmljen' },
    { id: 12937, tip: 'Hibridni', cena: 11, status: 'Dostupan' },
    { id: 11722, tip: 'Električni', cena: 18, status: 'Neispravan' },
    { id: 11249, tip: 'Električni', cena: 14, status: 'Na održavanju' },
  ];

  bikeTypes = [
    'Električni',
    'Gradski',
    'Hibridni',
    'Brdski (MTB)',
    'Dečiji'
  ];


  iznajmljivanja = [
    {
      id: '#11111',
      korisnik: 'anavranes',
      datum: '12.01.2026.',
      vreme: '12:34 - 12:55',
      minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike.png'
    },
    {
      id: '#12111',
      korisnik: 'ana',
      datum: '12.01.2026.',
      vreme: ' 12:24-12:31 ',
      minuta: 7,
      tip: 'Električni',
      cenaPoMinutu: 31,
      slika: '/images/bike2.png',
      cena: '220'
    },
    {
      id: '#13111', korisnik: 'anjapantovic', datum: '13.01.2026.', vreme: '12:34-12:55', minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike3.png'
    },
    {
      id: '#14111', korisnik: 'anavranes', datum: '14.01.2026.', vreme: '12:34-12:55', minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike2.png'
    },
    {
      id: '#15111', korisnik: 'anaaa', datum: '15.01.2026.', vreme: '12:34-12:55', minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike3.png'
    },
    {
      id: '#16111', korisnik: 'anavranes', datum: '16.01.2026.', vreme: '12:34-12:55', minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike.png'
    },
    {
      id: '#17111', korisnik: 'anatest3', datum: '17.01.2026.', vreme: '12:34-12:55', minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike.png'
    },
    {
      id: '#18111', korisnik: 'anatest', datum: '18.01.2026.', vreme: '12:34-12:55', minuta: 21,
      tip: 'Električni',
      cenaPoMinutu: 12,
      cena: 252,
      slika: '/images/bike2.png'
    },

  ]
  prijavljeni_problemi = [
    {
      id: 1,
      datum: '18.01.2026.',
      korisnik: 'test',
      bicikl: '#11111',
      opis: 'pukla guma',
      fotografija: '/images/problem1.png',
      status: 'Novo',
    },
    {
      id: 2,
      datum: '18.01.2026.',
      korisnik: 'anaa',
      bicikl: '#12171',
      opis: 'polomljeno prednje svetlo',
      fotografija: '/images/problem2.png',
      status: 'Novo',
    },
    {
      id: 3,
      datum: '18.01.2026.',
      korisnik: 'pera',
      bicikl: '#118134',
      opis: 'pao lanac',
      fotografija: '/images/problem3.png',
      status: 'Novo',
    },
  ];

  setActive(key: MenuKey) {
    this.active = key;
  }

  editProblemStatus(p: any) {
    this.editingProblemId = p.id;
  }

  saveProblemStatus(p: any) {
    this.editingProblemId = null;
  }

  editStatus(b: any) {
    this.editingStatusId = b.id;
  }

  saveStatus(b: any) {
    this.editingStatusId = null;
  }
  openAddBike() {
    this.isAddBikeOpen = true;

    const next = Math.floor(10000 + Math.random() * 90000);
    this.newBike = {
      id: `#${next}`,
      tip: '',                 
      cena: null,
      status: 'Dostupan'
    };
  }

  closeAddBike() {
    this.isAddBikeOpen = false;
  }
  saveBike() {
    if (!this.newBike.tip || this.newBike.cena === null) return;

    const cleanId = Number(String(this.newBike.id).replace('#', ''));
  
    this.bikes = [
      ...this.bikes,
      {
        id: cleanId,
        tip: this.newBike.tip,
        cena: Number(this.newBike.cena),
        status: this.newBike.status
      }
    ];
  
    this.closeAddBike();
  }
  editBike(b: any) {
    console.log('editingBike:', b);
    this.editingBike = { ...b };
    this.isEditBikeOpen = true;
  }

  closeEditBike() {
    this.isEditBikeOpen = false;
    this.editingBike = null;
  }

  saveEditBike() {
    if (!this.editingBike.tip || this.editingBike.cena === null) return;

    const index = this.bikes.findIndex(b => b.id === this.editingBike.id);
    if (index !== -1) {
      this.bikes[index] = { ...this.editingBike };
      this.bikes = [...this.bikes]; 
    }

    this.closeEditBike();
  }


  logout() {
    localStorage.clear()
    this.router.navigate(['/login']);
  }

  openIznajmljivanje(item: any) {
    this.selectedIznajmljivanje = item;
    this.isIznajmljivanjeOpen = true;
  }

  closeIznajmljivanje() {
    this.isIznajmljivanjeOpen = false;
    this.selectedIznajmljivanje = null;
  }

 

  toggleStatusDropdown(id: number) {
    if (this.openedProblemId === id) {
      this.openedProblemId = null;
    } else {
      this.openedProblemId = id;
    }
  }

  changeProblemStatus(problem: any, newStatus: string) {
    problem.status = newStatus;
    this.openedProblemId = null;
  }

  onProblemStatusChange(p: any) {
    console.log('Status promenjen:', p.id, p.status);
  }


  toggleEditProfile() {
    this.isEditingProfile = !this.isEditingProfile;
  }

  changePassword() {
    this.isChangePassOpen = true;
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passError = '';
  }

  closeChangePass() {
    this.isChangePassOpen = false;
    this.passError = '';
  }

  savePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passError = 'Sva polja su obavezna.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passError = 'Nova lozinka i potvrda se ne poklapaju.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passError = 'Lozinka mora imati najmanje 6 karaktera.';
      return;
    }
    alert("Lozinka uspesno promenjena!")
    this.closeChangePass();
  }

}
