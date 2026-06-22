import { Component, input, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CourseSection } from '../../../services/courses';

@Component({
  selector: 'app-about-tab',
  imports: [],
  templateUrl: './about-tab.html',
  styleUrl: './about-tab.css',
})
export class AboutTab {
  private sanitizer = inject(DomSanitizer);

  section = input.required<CourseSection>();

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
