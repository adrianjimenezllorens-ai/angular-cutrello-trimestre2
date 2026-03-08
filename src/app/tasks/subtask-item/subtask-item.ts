import { ChangeDetectionStrategy, Component, inject, input, model, output } from '@angular/core';
import { Subtask } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';

@Component({
  selector: 'subtask-item',
  imports: [],
  templateUrl: './subtask-item.html',
  styleUrl: './subtask-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubtaskItem {
  taskId = input.required<number>();
  subtask = model.required<Subtask>();

  deleted = output<void>();

  #tasksService = inject(TasksService);

  toggleCompleted(event: Event) {
    const completed = (event.target as HTMLInputElement).checked;

    this.#tasksService
      .updateSubtask(this.subtask().id, completed)
      .subscribe((updatedSubtask) => {
        this.subtask.set(updatedSubtask);
      });
  }

  deleteSubtask() {
    this.#tasksService.deleteSubtask(this.subtask().id).subscribe(() => {
      this.deleted.emit();
    });
  }
}