import {ChangeDetectionStrategy,Component,effect,inject,input,signal,} from '@angular/core';
import {form,FormField,minLength,pattern,required,validate,} from '@angular/forms/signals';
import { Router } from '@angular/router';
import { CanComponentDeactivate } from '../../shared/guards/leave-page-guard';
import { TaskInsert } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';

@Component({
  selector: 'task-form',
  imports: [FormField],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm implements CanComponentDeactivate {
  id = input(0, {
    transform: (value: string | undefined) => Number(value ?? 0),
  });

  #tasksService = inject(TasksService);
  #router = inject(Router);

  saved = false;
  today = new Date();

  newTask = signal<TaskInsert>({
    title: '',
    description: '',
    deadLine: '',
    filepath: '',
  });

  taskResource = this.#tasksService.getSingleTaskResource(this.id);

  newTaskForm = form(this.newTask, (schema) => {
    required(schema.title, { message: 'El titulo es obligatorio' });
    required(schema.description, { message: 'La descripcion es obligatoria' });
    required(schema.deadLine, { message: 'La fecha es obligatoria' });

    minLength(schema.title, 5, {
      message: (context) => `Faltan al menos ${5 - context.value().length} caracteres`,
    });

    pattern(schema.title, /^[a-zA-Z0-9\s]+$/, {
      message: 'El titulo solo puede contener letras y numeros',
    });

    validate(schema.deadLine, ({ value }) => {
      if (value() && value() < this.today.toISOString().slice(0, 10)) {
        return {
          kind: 'minDate',
          message: `La fecha no puede ser anterior a ${new Intl.DateTimeFormat('es-ES', {
            dateStyle: 'full',
          }).format(this.today)}`,
        };
      }
      return null;
    });
  });

  constructor() {
    effect(() => {
      if (this.id() <= 0 || !this.taskResource.hasValue()) {
        return;
      }

      const task = this.taskResource.value()?.task;
      if (!task) {
        return;
      }

      this.newTask.set({
        title: task.title,
        description: task.description,
        deadLine: task.deadLine.slice(0, 10),
        filepath: task.filepath ?? '',
      });
    });
  }

  addTask(event: Event) {
    event.preventDefault();

    if (this.newTaskForm().invalid()) {
      return;
    }

    const request$ =
      this.id() > 0
        ? this.#tasksService.updateTask(this.id(), this.newTask())
        : this.#tasksService.addTask(this.newTask());

    request$.subscribe((task) => {
      this.saved = true;
      this.#router.navigate(['/tasks', task.id]);
    });
  }

  canDeactivate() {
    return this.saved || !this.newTaskForm().dirty() || confirm('¿Quieres salir sin guardar?');
  }

  isEditing() {
    return this.id() > 0;
  }
}