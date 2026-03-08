import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskComment } from '../interfaces/task';

@Component({
  selector: 'comment-item',
  imports: [DatePipe, RouterLink],
  templateUrl: './comment-item.html',
  styleUrl: './comment-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentItem {
  comment = input.required<TaskComment>();
}