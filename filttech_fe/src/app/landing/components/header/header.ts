import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ClickOutsideDirective } from '@shared/directive/click-outside.directive';
import { filter, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: '[app-header]',
  imports: [ClickOutsideDirective, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  mobileSidebar = signal(false);
  activeFragment = signal<string>('');
  private routerSubscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.trackFragment();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  toggle() {
    this.mobileSidebar.set(!this.mobileSidebar());
  }

  openLogin() {
    // Navigate to courses page - auth guard will redirect to login with returnUrl
    this.router.navigate(['/s/courses']);
  }

  private trackFragment() {
    // Set initial fragment
    this.activeFragment.set(this.router.parseUrl(this.router.url).fragment || '');

    // Track fragment changes
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.activeFragment.set(this.router.parseUrl(this.router.url).fragment || '');
      });
  }

  isActive(fragment: string): boolean {
    return this.activeFragment() === fragment;
  }
}
