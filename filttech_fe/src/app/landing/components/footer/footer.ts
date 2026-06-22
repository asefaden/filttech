import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Category as CategoryService, Category as CategoryType } from '../../service/category';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: '[app-footer]',
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit, OnDestroy {
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  categories = signal<CategoryType[]>([]);
  activeFragment = signal<string>('');
  private routerSubscription?: Subscription;

  constructor() {
    this.loadCategories();
  }

  ngOnInit() {
    this.trackFragment();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data.slice(0, 4));
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      },
    });
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
