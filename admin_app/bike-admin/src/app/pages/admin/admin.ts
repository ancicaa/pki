import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { AuthService, AppUser } from '../../services/auth.service';
import {
  AdminApiService,
  Bike,
  BikeType,
  Rental,
  Problem,
  BikeStatus,
  User
} from '../../services/admin-api.service';

type MenuKey = 'bicikla' | 'iznajmljivanja' | 'problemi' | 'profil';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class Admin implements OnInit {
  constructor(
    private router: Router,
    private api: AdminApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

   // init

   ngOnInit(): void {
    this.loadAll();
    this.loadProfileFromSession();
  }

  isBikeDetailOpen = false;
  selectedBikeDetail: any = null;
  bikeRentals: any[] = [];
  bikeRentalsLoading = false;


  active: MenuKey = 'bicikla';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isSaving = false;

  editingProblemId: number | null = null;
  problemStatusOptions = ['Novo', 'Slanje bicikla na održavanje', 'Isključen iz sistema'];

  editingStatusId: number | null = null;
  statusOptions: BikeStatus[] = ['Dostupan', 'Iznajmljen', 'Neispravan', 'Na održavanju'];

  isBikeModalOpen = false;
  bikeModalMode: 'add' | 'edit' = 'add';
  bikeForm: Bike = { id: 0, tip: '', cena: 0, status: 'Dostupan', latitude: 0, longitude: 0, baterija: 100 };


  selectedIznajmljivanje: Rental | null = null;
  isIznajmljivanjeOpen = false;

  isEditingProfile = false;
  profile!: User;


  isChangePassOpen = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passError = '';


  bikes: Bike[] = [];
  bikeTypes: BikeType[] = [];
  iznajmljivanja: Rental[] = [];
  prijavljeni_problemi: Problem[] = [];

  // ==================== search, sort  i paginacija ====================

  // --- Bikes ---
  bikeSearch = '';
  bikeSortCol: keyof Bike | '' = '';
  bikeSortDir: SortDir = 'asc';
  bikePage = 1;
  bikePageSize = 10;
  bikeTotalPages = 1;

  get filteredBikes(): Bike[] {
    const q = this.bikeSearch.trim().toLowerCase();
    let list = q
      ? this.bikes.filter(
        b =>
          String(b.id).includes(q) ||
          b.tip.toLowerCase().includes(q) ||
          b.status.toLowerCase().includes(q) ||
          String(b.cena).includes(q)
      )
      : [...this.bikes];

    if (this.bikeSortCol) {
      const col = this.bikeSortCol;
      const dir = this.bikeSortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        const av = a[col] ?? '';
        const bv = b[col] ?? '';
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    this.bikeTotalPages = Math.max(1, Math.ceil(list.length / this.bikePageSize));
    const start = (this.bikePage - 1) * this.bikePageSize;
    return list.slice(start, start + this.bikePageSize);
  }

  setBikeSort(col: keyof Bike) {
    if (this.bikeSortCol === col) {
      this.bikeSortDir = this.bikeSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.bikeSortCol = col;
      this.bikeSortDir = 'asc';
    }
    this.bikePage = 1;
  }

  onBikeSearchChange() { this.bikePage = 1; }

  // --- Rentals ---
  rentalSearch = '';
  rentalSortCol: keyof Rental | '' = '';
  rentalSortDir: SortDir = 'asc';
  rentalPage = 1;
  rentalPageSize = 10;
  rentalTotalPages = 1;

  get filteredRentals(): Rental[] {
    const q = this.rentalSearch.trim().toLowerCase();
    let list = q
      ? this.iznajmljivanja.filter(
        r =>
          String(r.id).toLowerCase().includes(q) ||
          r.korisnik.toLowerCase().includes(q) ||
          r.datum.toLowerCase().includes(q) ||
          r.vreme.toLowerCase().includes(q) ||
          String(r.cena).includes(q)
      )
      : [...this.iznajmljivanja];

    if (this.rentalSortCol) {
      const col = this.rentalSortCol;
      const dir = this.rentalSortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        const av = a[col] ?? '';
        const bv = b[col] ?? '';
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    this.rentalTotalPages = Math.max(1, Math.ceil(list.length / this.rentalPageSize));
    const start = (this.rentalPage - 1) * this.rentalPageSize;
    return list.slice(start, start + this.rentalPageSize);
  }

  setRentalSort(col: keyof Rental) {
    if (this.rentalSortCol === col) {
      this.rentalSortDir = this.rentalSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.rentalSortCol = col;
      this.rentalSortDir = 'asc';
    }
    this.rentalPage = 1;
  }

  onRentalSearchChange() { this.rentalPage = 1; }

  // --- Problems ---
  problemSearch = '';
  problemSortCol: keyof Problem | '' = '';
  problemSortDir: SortDir = 'asc';
  problemPage = 1;
  problemPageSize = 10;
  problemTotalPages = 1;

  get filteredProblems(): Problem[] {
    const q = this.problemSearch.trim().toLowerCase();
    let list = q
      ? this.prijavljeni_problemi.filter(
        p =>
          p.datum.toLowerCase().includes(q) ||
          p.korisnik.toLowerCase().includes(q) ||
          String(p.bikeId).includes(q) ||
          p.opis.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q)
      )
      : [...this.prijavljeni_problemi];

    if (this.problemSortCol) {
      const col = this.problemSortCol;
      const dir = this.problemSortDir === 'asc' ? 1 : -1;
      list.sort((a, b) => {
        const av = a[col] ?? '';
        const bv = b[col] ?? '';
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    this.problemTotalPages = Math.max(1, Math.ceil(list.length / this.problemPageSize));
    const start = (this.problemPage - 1) * this.problemPageSize;
    return list.slice(start, start + this.problemPageSize);
  }

  setProblemSort(col: keyof Problem) {
    if (this.problemSortCol === col) {
      this.problemSortDir = this.problemSortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.problemSortCol = col;
      this.problemSortDir = 'asc';
    }
    this.problemPage = 1;
  }

  onProblemSearchChange() { this.problemPage = 1; }

  sortIcon(currentCol: string, activeCol: string, dir: SortDir): string {
    if (currentCol !== activeCol) return '↕';
    return dir === 'asc' ? '↑' : '↓';
  }

 

  // geteri

  private loadAll() {
    let completed = 0;
    const total = 4;
    const done = () => {
      if (++completed === total) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.api.getBikes().subscribe({
      next: (data) => (this.bikes = data),
      error: () => { this.errorMessage = 'Greška pri učitavanju bicikala.'; done(); },
      complete: done,
    });

    this.api.getBikeTypes().subscribe({
      next: (data) => (this.bikeTypes = data),
      error: () => { this.errorMessage = 'Greška pri učitavanju tipova bicikala.'; done(); },
      complete: done,
    });

    this.api.getRentals().subscribe({
      next: (data) => (this.iznajmljivanja = data),
      error: () => { this.errorMessage = 'Greška pri učitavanju iznajmljivanja.'; done(); },
      complete: done,
    });

    this.api.getProblems().subscribe({
      next: (data) => (this.prijavljeni_problemi = data),
      error: () => { this.errorMessage = 'Greška pri učitavanju prijavljenih problema.'; done(); },
      complete: done,
    });
  }

  private refreshBikes() {
    this.api.getBikes().pipe(take(1)).subscribe({
      next: (data) => (this.bikes = data),
      error: () => (this.errorMessage = 'Greška pri osvežavanju bicikala.'),
    });
  }

  private refreshProblems() {
    this.api.getProblems().pipe(take(1)).subscribe({
      next: (data) => (this.prijavljeni_problemi = data),
      error: () => (this.errorMessage = 'Greška pri osvežavanju problema.'),
    });
  }

  // menu

  setActive(key: MenuKey) {
    this.active = key;
  }

  // status bajs

  editStatus(b: Bike) {
    this.editingStatusId = b.id;
  }

  cancelStatus() {
    this.editingStatusId = null;
    this.refreshBikes();
  }

  saveStatus(b: Bike) {
    this.api.updateBike(b.id, { status: b.status }).pipe(take(1)).subscribe({
      next: () => (this.editingStatusId = null),
      error: () => (this.errorMessage = 'Greška pri čuvanju statusa bicikla.'),
    });
  }

  // ==================== BIKES: UNIFIED MODAL ====================

  onBikeTypeChange(newType: string) {
    if (newType !== 'Električni') {
      this.bikeForm.baterija = 0;
    } else {
      if (!this.bikeForm.baterija) this.bikeForm.baterija = 100;
    }
  }


  openBikeModal(bike?: Bike) {
    this.errorMessage = '';
    this.isSaving = false;
    this.isBikeModalOpen = true;

    if (bike) {
      this.bikeModalMode = 'edit';
      this.bikeForm = { ...bike };
    } else {
      this.bikeModalMode = 'add';
      const maxId = this.bikes.length ? Math.max(...this.bikes.map(x => x.id)) : 0;
      this.bikeForm = {
        id: maxId + 1,
        tip: '',
        cena: 0,
        status: 'Dostupan',
        // adresa: '',
        latitude: 0,
        longitude: 0,
        baterija: 100,
      };
    }
  }

  closeBikeModal() {
    this.isBikeModalOpen = false;
    this.isSaving = false;
    this.errorMessage = '';
  }

  saveBikeModal() {
    if (this.isSaving) return;
    this.errorMessage = '';

   
    if (!this.bikeForm.tip) {
      this.errorMessage = 'Morate izabrati tip bicikla.';
      return;
    }

    const cenaNum = Number(this.bikeForm.cena);
    if (!cenaNum || cenaNum <= 0 || Number.isNaN(cenaNum)) {
      this.errorMessage = 'Cena mora biti broj veći od 0.';
      return;
    }

    this.isSaving = true;

    const isElectric = this.bikeForm.tip === 'Električni';


    const baterijaNum = isElectric
      ? Math.min(100, Math.max(0, Number(this.bikeForm.baterija) || 0))
      : 0;

   
    const payload: Bike = {
      id: Number(this.bikeForm.id),
      tip: this.bikeForm.tip,
      cena: cenaNum,
      status: this.bikeForm.status,
      latitude: Number(this.bikeForm.latitude) || 0,
      longitude: Number(this.bikeForm.longitude) || 0,
      baterija: baterijaNum,
    };

    const patch: Partial<Bike> = {
      tip: payload.tip,
      cena: payload.cena,
      status: payload.status,
      latitude: payload.latitude,
      longitude: payload.longitude,
    };

    if (isElectric) {
      patch.baterija = baterijaNum;
    } else {
      patch.baterija = 0;
    }

    const request$ =
      this.bikeModalMode === 'add'
        ? this.api.createBike(payload)
        : this.api.updateBike(payload.id, patch);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.isSaving = false;
        this.isBikeModalOpen = false;
        this.errorMessage = '';

        this.refreshBikes();

        this.successMessage =
          this.bikeModalMode === 'add'
            ? 'Bicikl je uspešno dodat.'
            : 'Bicikl je uspešno izmenjen.';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.successMessage = '';
          this.cdr.detectChanges();
        }, 2000);
      },
      error: (err) => {
        console.error(err);
        this.isSaving = false;
        this.errorMessage = 'Greška pri čuvanju bicikla.';
      },
    });
  }


  // iznajmljivanja

  openIznajmljivanje(item: Rental) {
    this.selectedIznajmljivanje = item;
    this.isIznajmljivanjeOpen = true;
  }

  closeIznajmljivanje() {
    this.isIznajmljivanjeOpen = false;
    this.selectedIznajmljivanje = null;
  }

  // prijavljeni problemi

  editProblemStatus(p: Problem) {
    this.editingProblemId = p.id;
  }

  cancelProblemStatus() {
    this.editingProblemId = null;
    this.refreshProblems();
  }


  saveProblemStatus(p: Problem) {
    this.api.updateProblem(p.id, { status: p.status }).pipe(take(1)).subscribe({
      next: () => {
        this.editingProblemId = null;

        const bikeId = p.bikeId;
        //console.log('bikeId:', bikeId, '-> status:', p.status);
        //console.log('bicikl string:', p.bicikl, '-> bikeId:', bikeId, '-> status:', p.status);

        if (p.status === 'Slanje bicikla na održavanje') {
          this.api.updateBike(bikeId, { status: 'Na održavanju' }).pipe(take(1)).subscribe({
            next: (res) => { console.log('bike updated:', res); this.refreshBikes(); },
            error: (err) => { console.log('bike update error:', err); },
          });
        } else if (p.status === 'Isključen iz sistema') {
          this.api.updateBike(bikeId, { status: 'Neispravan' }).pipe(take(1)).subscribe({
            next: (res) => { console.log('bike updated:', res); this.refreshBikes(); },
            error: (err) => { console.log('bike update error:', err); },
          });
        }
      },
      error: () => (this.errorMessage = 'Greška pri čuvanju statusa problema.'),
    });
  }

  // profil 

  private loadProfileFromSession() {
    const current = this.auth.getCurrentUser();
    if (!current) return;
    this.profile = current as User;
  }

  toggleEditProfile() {
    this.errorMessage = '';

    if (!this.isEditingProfile) {
      this.isEditingProfile = true;
      return;
    }

    if (!this.profile) {
      this.errorMessage = 'Profil nije učitan.';
      return;
    }

    const patch: Partial<User> = {
      ime: this.profile.ime,
      prezime: this.profile.prezime,
      telefon: this.profile.telefon,
      email: this.profile.email,
    };

    this.api.updateUser(this.profile.id, patch).pipe(take(1)).subscribe({
      next: (updated) => {
        this.isEditingProfile = false;
        const current = this.auth.getCurrentUser();
        if (current) {
          this.auth.setCurrentUser({ ...(current as any), ...updated } as AppUser);
          this.profile = { ...(this.profile as User), ...updated };
        }
        this.cdr.detectChanges();
      },
      error: () => (this.errorMessage = 'Greška pri čuvanju profila.'),
    });
  }

  // password

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
    this.passError = '';

    const current = this.auth.getCurrentUser() as User | null;
    if (!current) { this.passError = 'Niste prijavljeni.'; return; }
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) { this.passError = 'Sva polja su obavezna.'; return; }
    if (this.oldPassword !== current.password) { this.passError = 'Stara lozinka nije tačna.'; return; }
    if (this.newPassword !== this.confirmPassword) { this.passError = 'Nova lozinka i potvrda se ne poklapaju.'; return; }
    if (this.newPassword.length < 6) { this.passError = 'Lozinka mora imati najmanje 6 karaktera.'; return; }

    this.api.updateUser(current.id, { password: this.newPassword }).pipe(take(1)).subscribe({
      next: (updated) => {
        this.auth.setCurrentUser({ ...(current as any), ...updated, password: this.newPassword } as AppUser);
        if (this.profile) {
          this.profile = { ...this.profile, password: this.newPassword };
        }
        this.closeChangePass();
        this.successMessage = 'Lozinka uspešno promenjena!';
        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: () => (this.passError = 'Greška pri čuvanju lozinke.'),
    });
  }


  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }


  // ============ kod spiska bicikla da se vidi i history
  openBikeDetails(bike: any) {
    this.selectedBikeDetail = bike;
    this.isBikeDetailOpen = true;
    this.bikeRentals = [];
    this.bikeRentalsLoading = true;

    this.api.getRentals().pipe(take(1)).subscribe({
      next: (data) => {
        this.bikeRentals = data.filter(r => Number(r.bikeId) === Number(bike.id));
        this.bikeRentalsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.bikeRentalsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeBikeDetails() {
    this.isBikeDetailOpen = false;
    this.selectedBikeDetail = null;
    this.bikeRentals = [];
  }
}