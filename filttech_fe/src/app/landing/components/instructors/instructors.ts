import { Component, inject, signal } from '@angular/core';
import { Expert as ExpertService, Expert as ExpertType } from '../../service/expert';

@Component({
  selector: '[app-instructors]',
  imports: [],
  templateUrl: './instructors.html',
  styleUrl: './instructors.css',
})
export class Instructors {
  private expertService = inject(ExpertService);

  experts = signal<ExpertType[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  defaultImage = '../../../assets/images/Image.svg';

  constructor() {
    this.loadExperts();
  }

  loadExperts() {
    this.loading.set(true);
    this.expertService.getPopularExports().subscribe({
      next: (response) => {
        this.experts.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load experts');
        this.loading.set(false);
        console.error('Error loading experts:', err);
      },
    });
  }

  getProfileImage(expert: ExpertType): string {
    return expert.profile_image || this.defaultImage;
  }

  parseFloat = parseFloat;
}
