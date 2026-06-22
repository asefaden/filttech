import { Routes } from '@angular/router';
import { StudentLayout } from 'src/app/layouts/student-layout/student-layout';
import { Courses } from './courses/courses';
import { Experts } from './experts/experts';
import { Books } from './books/books';
import { Blogs } from './blogs/blogs';
import { BlogDetail } from './blog-detail/blog-detail';
import { CourseDetail } from './course-detail/course-detail';
import { Profile } from './profile/profile';
import { ExpertDetail } from './expert-detail/expert-detail';
import { AcceptedPage } from './accepted-page/accepted-page';
import { FeedbackForm } from '@shared/components/feedback-form/feedback-form';

export const student: Routes = [
  {
    path: '',
    component: StudentLayout,
    children: [
      {
        path: 'courses',
        component: Courses,
      },
      {
        path: 'courses/:id',
        component: CourseDetail,
      },

      {
        path: 'experts',
        component: Experts,
      },
      { path: 'experts/:id', component: ExpertDetail },

      {
        path: 'blogs',
        component: Blogs,
      },
      {
        path: 'blogs/:id',
        component: BlogDetail,
      },

      {
        path: 'books',
        component: Books,
      },
      { path: 'profile', component: Profile },
      { path: 'accepted-page/:id', component: AcceptedPage },
      { path: 'feedback', component: FeedbackForm },

      { path: '**', redirectTo: 'courses', pathMatch: 'full' },
    ],
  },
];
