import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@core/services/auth';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  standalone: true,
})
export class AdminDashboard {
  auth = inject(Auth);
  router = inject(Router);
  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
