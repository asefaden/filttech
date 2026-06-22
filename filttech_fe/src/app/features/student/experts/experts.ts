import { Component, signal, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ExpertsService, Expert } from '../services/experts';

@Component({
  selector: 'app-experts',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './experts.html',
  styleUrl: './experts.css',
})
export class Experts implements OnInit {
  experts = signal<Expert[]>([]);
  loading = signal(false);
  searchQuery = signal('');
  private searchTimeout: any;

  constructor(private expertsService: ExpertsService) {
    // Watch for search query changes and trigger search with debounce
    effect(() => {
      const query = this.searchQuery();

      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Set new timeout for debounced search
      this.searchTimeout = setTimeout(() => {
        this.loadExperts();
      }, 300); // 300ms debounce
    });
  }

  ngOnInit() {
    this.loadExperts();
  }

  loadExperts() {
    this.loading.set(true);
    const params = this.searchQuery() ? { search: this.searchQuery() } : undefined;

    this.expertsService.getExperts(params).subscribe({
      next: (response) => {
        this.experts.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading experts:', error);
        this.loading.set(false);
      },
    });
  }

  getRatingNumber(rating: string): number {
    return parseFloat(rating) || 0;
  }
}
