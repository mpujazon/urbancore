import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { httpResource } from '@angular/common/http';

interface JsonPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const POSTS_API_URL = 'https://jsonplaceholder.typicode.com/posts';
const FIRST_POST_ID = 1;
const LAST_POST_ID = 100;

@Component({
  selector: 'app-http-resource-lab',
  imports: [JsonPipe],
  templateUrl: './http-resource-lab.html',
  styleUrl: './http-resource-lab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HttpResourceLab {
  protected readonly firstPostId = FIRST_POST_ID;
  protected readonly lastPostId = LAST_POST_ID;

  protected readonly postId = signal<number | null>(FIRST_POST_ID);
  protected readonly draftId = signal(String(FIRST_POST_ID));

  protected readonly postResource = httpResource<JsonPlaceholderPost>(() => {
    const id = this.postId();
    return id === null || id < FIRST_POST_ID ? undefined : `${POSTS_API_URL}/${id}`;
  });

  protected readonly statusLabel = computed(() => {
    switch (this.postResource.status()) {
      case 'idle':
        return 'Idle';
      case 'loading':
        return 'Loading';
      case 'reloading':
        return 'Reloading';
      case 'resolved':
        return 'Resolved';
      case 'error':
        return 'Error';
      case 'local':
        return 'Local';
    }
  });

  protected goToPreviousPost(): void {
    this.selectPost((this.postId() ?? FIRST_POST_ID) - 1);
  }

  protected goToNextPost(): void {
    this.selectPost((this.postId() ?? FIRST_POST_ID - 1) + 1);
  }

  protected loadDraft(): void {
    const parsed = Math.trunc(Number(this.draftId()));
    this.postId.set(Number.isFinite(parsed) ? parsed : null);
  }

  protected reloadPost(): void {
    this.postResource.reload();
  }

  protected onDraftInput(event: Event): void {
    this.draftId.set((event.target as HTMLInputElement).value);
  }

  private selectPost(id: number): void {
    const clamped = Math.min(Math.max(Math.trunc(id), FIRST_POST_ID), LAST_POST_ID);
    this.draftId.set(String(clamped));
    this.postId.set(clamped);
  }
}
