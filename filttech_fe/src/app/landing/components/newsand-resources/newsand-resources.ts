import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Post {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  is_featured: boolean;
}

export interface PostsResponse {
  message: string;
  data: Post[];
}

@Component({
  selector: '[app-newsand-resources]',
  imports: [CommonModule, RouterLink],
  templateUrl: './newsand-resources.html',
  styleUrl: './newsand-resources.css',
})
export class NewsandResources implements OnInit {
  private http = inject(HttpClient);

  featuredPost = signal<Post | null>(null);
  otherPosts = signal<Post[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.http.get<PostsResponse>('/latest-posts').subscribe({
      next: (response) => {
        const featured = response.data.find((post) => post.is_featured);
        const others = response.data.filter((post) => !post.is_featured);

        this.featuredPost.set(featured || null);
        this.otherPosts.set(others);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load posts:', error);
        this.isLoading.set(false);
      },
    });
  }

  stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}
