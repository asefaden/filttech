import { Component, signal, computed, inject, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Section, CommentDetail } from '../../../services/section';
import { Auth } from 'src/app/core/services/auth';

@Component({
  selector: 'app-comments-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollingModule],
  templateUrl: './comments-tab.html',
})
export class CommentsTab implements OnInit {
  private sectionService = inject(Section);
  private authService = inject(Auth);

  // Input to receive the current section ID
  sectionId = input.required<string>();

  comments = signal<CommentDetail[]>([]);
  newText = signal('');
  isCommentShow = signal(false);
  loading = signal(false);
  submitting = signal(false);
  currentPage = signal(1);
  hasMoreComments = signal(true);

  profileImage = computed(() => {
    const profile = this.authService.profile();
    if (!profile) return '../../../../../../assets/images/image 60.svg';

    const profilePhotoUrl = profile['profile_photo_url'];
    const profileImage = profile['profile_image'];

    if (profileImage && typeof profileImage === 'string') {
      return profileImage;
    }
    if (profilePhotoUrl && typeof profilePhotoUrl === 'string') {
      return profilePhotoUrl;
    }

    return '../../../../../../assets/images/image 60.svg';
  });

  ngOnInit() {
    this.loadComments();
  }

  loadComments(page: number = 1) {
    this.loading.set(true);
    this.sectionService.getSectionComments(this.sectionId(), page).subscribe({
      next: (response) => {
        if (page === 1) {
          this.comments.set(response.data.data);
        } else {
          this.comments.update((current) => [...current, ...response.data.data]);
        }
        this.currentPage.set(response.data.current_page);
        this.hasMoreComments.set(
          response.data.data.length > 0 && this.comments().length < response.data.total
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.loading.set(false);
      },
    });
  }

  addComment() {
    if (!this.newText().trim() || this.submitting()) return;

    this.submitting.set(true);
    this.sectionService.addSectionComment(this.sectionId(), this.newText().trim()).subscribe({
      next: (response) => {
        // Reload comments after adding
        this.newText.set('');
        this.isCommentShow.set(false);
        this.submitting.set(false);
        this.loadComments(1); // Reload from first page
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.submitting.set(false);
      },
    });
  }

  loadMoreComments() {
    if (!this.hasMoreComments() || this.loading()) return;
    this.loadComments(this.currentPage() + 1);
  }

  trackByCommentId(index: number, comment: CommentDetail): string {
    return comment.id;
  }

  onScrolledIndexChange(index: number) {
    // Load more comments when user scrolls near the end
    const threshold = 5; // Load more when 5 items from the end
    if (index >= this.comments().length - threshold && this.hasMoreComments() && !this.loading()) {
      this.loadMoreComments();
    }
  }
}
