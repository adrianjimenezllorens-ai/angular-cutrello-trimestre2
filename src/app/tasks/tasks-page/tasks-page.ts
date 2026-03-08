import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { Task } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';
import { TaskCard } from '../task-card/task-card';

@Component({
  selector: 'tasks-page',
  imports: [TaskCard],
  templateUrl: './tasks-page.html',
  styleUrl: './tasks-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  #tasksService = inject(TasksService);
  tasksResource = this.#tasksService.getTasksResource();

  tasks = linkedSignal(() => this.tasksResource.hasValue() ? this.tasksResource.value()?.tasks : []);

  pending = computed(() => this.tasks().filter((task) => task.status === 0));
  inProgress = computed(() => this.tasks().filter((task) => task.status === 1));
  finished = computed(() => this.tasks().filter((task) => task.status === 2));

  changeStatus(task: Task, status: number) {
    this.tasks.update((tasks) => tasks.map((t) => (t === task ? { ...t, status } : t)));
  }

  deleteTask(task: Task) {
    this.tasks.update((tasks) => tasks.filter((t) => t !== task));
  }
}
