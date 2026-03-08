import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Subtask } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';
import { SubtaskItem } from '../subtask-item/subtask-item';

interface NewSubtaskData {
  description: string;
}

@Component({
  selector: 'task-subtasks',
  imports: [FormField, SubtaskItem],
  templateUrl: './task-subtasks.html',
  styleUrl: './task-subtasks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskSubtasks {
  taskId = input.required<number>();
  subtasks = model.required<Subtask[]>();

  #tasksService = inject(TasksService);

  newSubtaskData = signal<NewSubtaskData>({
    description: '',
  });

  newSubtaskForm = form(this.newSubtaskData, (schema) => {
    required(schema.description, { message: 'La subtarea es obligatoria' });
  });

  addSubtask(event: Event) {
    event.preventDefault();

    if (this.newSubtaskForm().invalid()) {
      return;
    }

    this.#tasksService
      .addSubtask(this.taskId(), this.newSubtaskData().description)
      .subscribe((subtask) => {
        this.subtasks.update((current) => [...current, subtask]);
        this.newSubtaskData.set({ description: '' });
        this.newSubtaskForm().reset({
          description: '',
        });
      });
  }

  removeSubtask(subtask: Subtask) {
    this.subtasks.update((current) => current.filter((s) => s.id !== subtask.id));
  }
}