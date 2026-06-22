import { Component, signal, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Blog, BlogItem } from '../services/blog';
import { Location } from '@angular/common';

@Component({
  selector: 'app-blog-detail',
  imports: [CommonModule],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
})
export class BlogDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private blogService = inject(Blog);
  private router = inject(Router);
  private location = inject(Location);

  blog = signal<BlogItem | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      this.loadBlog(blogId);
    }
  }

  loadBlog(blogId: string) {
    this.loading.set(true);
    this.blogService.getBlogById(blogId).subscribe({
      next: (response) => {
        this.blog.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load blog details');
        this.loading.set(false);
        console.error('Error loading blog:', err);
      },
    });
  }

  goBack() {
    this.router.navigate(['/s/blogs']);
  }
}
