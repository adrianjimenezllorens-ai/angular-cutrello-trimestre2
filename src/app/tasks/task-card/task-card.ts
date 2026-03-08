import { DatePipe } from '@angular/common';
import {ChangeDetectionStrategy,Component,DestroyRef,inject,input,linkedSignal,output,} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Task } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';

@Component({
  selector: 'task-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCard {
  task = input.required<Task>();

  status = linkedSignal(() => String(this.task().status));

  statusChange = output<number>();
  deleted = output<void>();

  #tasksService = inject(TasksService);
  #destroyRef = inject(DestroyRef);

  onStatusSelectChange(event: Event) {
    const newStatus = +(event.target as HTMLSelectElement).value;
    this.status.set(String(newStatus));
    this.changeStatus();
  }

  changeStatus() {
    this.#tasksService
      .updateStatus(this.task().id, +this.status())
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.statusChange.emit(+this.status()));
  }

  deleteTask() {
    this.#tasksService
      .deleteTask(this.task().id)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => this.deleted.emit());
  }
}