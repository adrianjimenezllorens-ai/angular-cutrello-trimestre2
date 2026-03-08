import {ChangeDetectionStrategy,Component,computed,effect,inject,input,linkedSignal,signal,} from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { CommentItem } from '../comment-item/comment-item';
import { TaskComment } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';

interface NewCommentData {
  comment: string;
}

@Component({
  selector: 'task-comments',
  imports: [FormField, CommentItem],
  templateUrl: './task-comments.html',
  styleUrl: './task-comments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskComments {
  taskId = input.required<number>();

  #tasksService = inject(TasksService);

  page = signal(1);

  commentsResource = this.#tasksService.getCommentsResource(this.taskId, this.page);

  comments = linkedSignal<TaskComment[] | undefined, TaskComment[]>({
    source: () => this.commentsResource.value()?.comments,
    computation: (resp, previous) => {
      if (!resp) {
        return previous?.value ?? [];
      }

      return this.page() > 1 && previous ? [...previous.value, ...resp] : resp;
    },
  });

  currentPage = computed(() => this.commentsResource.value()?.currentPage ?? 1);
  hasNextPage = computed(() => this.commentsResource.value()?.hasNextPage ?? false);
  isLoading = computed(() => this.commentsResource.isLoading());

  newCommentData = signal<NewCommentData>({
    comment: '',
  });

  commentForm = form(this.newCommentData, (schema) => {
    required(schema.comment, { message: 'El comentario es obligatorio' });
  });

  constructor() {
    effect(() => {
      const id = this.taskId();
      if (id > 0) {
        this.page.set(1);
      }
    });
  }

  loadMoreComments() {
    if (!this.hasNextPage() || this.isLoading()) {
      return;
    }

    this.page.update((p) => p + 1);
  }

  addComment(event: Event) {
    event.preventDefault();

    if (this.commentForm().invalid()) {
      return;
    }

    this.#tasksService.addComment(this.taskId(), this.newCommentData().comment).subscribe({
      next: () => {
        this.newCommentData.set({ comment: '' });
        this.commentForm().reset({
          comment: '',
        });

        this.page.set(1);
        this.commentsResource.reload();
      },
    });
  }
}