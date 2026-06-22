import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { HeroSection } from './components/hero-section/hero-section';
import { Whychooseus } from './components/whychooseus/whychooseus';
import { Category } from './components/category/category';
import { PopularCourses } from './components/popular-courses/popular-courses';
import { Instructors } from './components/instructors/instructors';
import { StudentFeedbacks } from './components/student-feedbacks/student-feedbacks';
import { NewsandResources } from './components/newsand-resources/newsand-resources';
import { Faq } from './components/faq/faq';
import { ContactUs } from './components/contact-us/contact-us';

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,
    Header,
    Footer,
    HeroSection,
    Whychooseus,
    Category,
    PopularCourses,
    Instructors,
    StudentFeedbacks,
    NewsandResources,
    Faq,
    ContactUs,
    RouterLink,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  standalone: true,
})
export class Landing {
  constructor(private router: Router) {}

  openLogin() {
    this.router.navigate([{ outlets: { modal: ['login'] } }]);
  }
}
