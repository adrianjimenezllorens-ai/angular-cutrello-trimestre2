import { DatePipe } from '@angular/common';
import {ChangeDetectionStrategy,Component,DestroyRef,effect,inject,input,linkedSignal,numberAttribute,} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TasksService } from '../services/tasks-service';
import { TaskSubtasks } from '../task-subtasks/task-subtasks';
import { TaskComments } from '../task-comments/task-comments';
import { TaskParticipants } from '../task-participants/task-participants';
import { EncodeBase64 } from '../../shared/directives/encode-base64';

@Component({
  selector: 'task-detail',
  imports: [DatePipe, TaskSubtasks, TaskComments, TaskParticipants, EncodeBase64],  
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetail {
  id = input.required<number, string>({ transform: numberAttribute });

  readonly #title = inject(Title);
  readonly #router = inject(Router);
  readonly #tasksService = inject(TasksService);
  readonly #destroyRef = inject(DestroyRef);

  readonly #taskResource = this.#tasksService.getSingleTaskResource(this.id);

  task = linkedSignal(() =>
    this.#taskResource.hasValue() ? this.#taskResource.value()?.task : undefined
  );

  constructor() {
    effect(() => {
      if (this.task()) {
        this.#title.setTitle(`${this.task()!.title} | Angular Cutrello`);
      }
    });

    effect(() => {
      if (this.#taskResource.error()) {
        alert('La tarea no existe');
        this.goBack();
      }
    });
  }

  changeStatus(event: Event) {
    const status = +(event.target as HTMLSelectElement).value;

    this.#tasksService
      .updateStatus(this.id(), status)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((updatedTask) => {
        this.task.set(updatedTask);
      });
  }

  editTask() {
    this.#router.navigate(['/tasks/edit', this.id()]);
  }

  deleteTask() {
    if (!confirm('¿Seguro que quieres eliminar esta tarea?')) {
      return;
    }

    this.#tasksService
      .deleteTask(this.id())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.#router.navigate(['/tasks']);
      });
  }

  goBack() {
    this.#router.navigate(['/tasks']);
  }

  updateSubtasks(subtasks: import('../interfaces/task').Subtask[]) {
    this.task.update((currentTask) =>
      currentTask ? { ...currentTask, subtasks } : currentTask
    );
  }

  updateParticipants(participants: import('../interfaces/task').Participant[]) {
    this.task.update((currentTask) =>
    currentTask ? { ...currentTask, participants } : currentTask
    );
  }

  changeImage(base64: string) {
    if (!base64 || !this.task()) {
      return;
    }

    const updatedTask = {
      ...this.task()!,
      filepath: base64,
    };

    this.#tasksService
      .updateTask(this.id(), updatedTask)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((task) => {
        this.task.set(task);
    });
  }
}