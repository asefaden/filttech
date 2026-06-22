import { Component, inject, input } from '@angular/core';
import { signal, ViewChild, ElementRef } from '@angular/core';
import { Course } from '@app/landing/service/courses';
import { StarRating } from '../star-rating/star-rating';
import { Router } from '@angular/router';
import { CourseCard } from '../course-card/course-card';

@Component({
  selector: 'app-course-slider',
  imports: [CourseCard],
  templateUrl: './course-slider.html',
  styleUrl: './course-slider.css',
})
export class CourseSlider {
  @ViewChild('slider', { static: true }) slider!: ElementRef<HTMLDivElement>;
  router = inject(Router);
  goToCourse(courseId: string) {
    this.router.navigate(['/s/courses', courseId]);
  }
  courses = input.required<Course[]>();
  parseFloat = parseFloat;
  backupImage = '../../../../assets/images/Rectangle 8772.svg';

  autoplayInterval: number | null = null;

  cardWidth = signal(280); // default

  ngAfterViewInit() {
    this.updateCardWidth();
    this.autoplay();
    window.addEventListener('resize', this.updateCardWidth);
  }

  ngOnDestroy() {
    if (this.autoplayInterval !== null) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
    window.removeEventListener('resize', this.updateCardWidth);
  }

  handleLoop() {
    const el = this.slider.nativeElement;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
      el.style.scrollBehavior = 'auto';
      el.scrollLeft = 0; // ⭐ go back to start
      el.style.scrollBehavior = 'smooth';
    }
  }

  // ⭐ Dynamic width based on screen - 1/4 of available space
  updateCardWidth = () => {
    const el = this.slider.nativeElement;
    if (!el) return;

    // Get the container width
    const containerWidth = el.clientWidth;

    // Account for gaps between cards (24px gap * 3 gaps for 4 cards)
    const totalGaps = 24 * 3;

    // Calculate card width as 1/4 of available space minus gaps
    const calculatedWidth = (containerWidth - totalGaps) / 4;

    // Set minimum widths based on screen size for better responsiveness
    const width = window.innerWidth;
    if (width < 640) {
      // Mobile: show 1 card
      this.cardWidth.set(Math.max(240, containerWidth - 48));
    } else if (width < 1024) {
      // Tablet: show 2-3 cards
      const tabletWidth = (containerWidth - 24 * 2) / 3;
      this.cardWidth.set(Math.max(260, tabletWidth));
    } else {
      // Desktop: show 4 cards
      this.cardWidth.set(Math.max(280, calculatedWidth));
    }
  };

  // ⭐ Next Button
  next() {
    const el = this.slider.nativeElement;
    const move = this.cardWidth() + 24;

    // If reaching the end, jump back
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - move) {
      el.style.scrollBehavior = 'auto';
      el.scrollLeft = 0; // ⭐ Reset to first card
      el.style.scrollBehavior = 'smooth';
    } else {
      el.scrollBy({ left: move, behavior: 'smooth' });
    }
  }

  // ⭐ Prev Button
  prev() {
    const el = this.slider.nativeElement;
    el.scrollBy({ left: -(this.cardWidth() + 24), behavior: 'smooth' });
  }

  // ⭐ Autoplay every 3s

  autoplay() {
    // avoid duplicate intervals
    if (this.autoplayInterval) return;

    // ensure any previous interval is cleared
    if (this.autoplayInterval !== null) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }

    // create a new interval and store numeric id
    this.autoplayInterval = window.setInterval(() => {
      this.next();
    }, 3000);
  }

  pauseAutoplay() {
    if (this.autoplayInterval !== null) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  resumeAutoplay() {
    // only start if not already running
    if (this.autoplayInterval === null) {
      this.autoplay();
    }
  }
}
