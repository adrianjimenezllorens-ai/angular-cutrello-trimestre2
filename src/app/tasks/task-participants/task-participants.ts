import {ChangeDetectionStrategy,Component,computed,inject,input,model,signal,} from '@angular/core';
import {debounce,form,FormField,} from '@angular/forms/signals';
import { Participant, UserSearchResult } from '../interfaces/task';
import { TasksService } from '../services/tasks-service';
import { RouterLink } from '@angular/router';

interface SearchData {
  search: string;
}

@Component({
  selector: 'task-participants',
  imports: [FormField, RouterLink],
  templateUrl: './task-participants.html',
  styleUrl: './task-participants.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskParticipants {
  taskId = input.required<number>();
  creator = input.required<number>();
  mine = input.required<boolean>();

  participants = model.required<Participant[]>();

  #tasksService = inject(TasksService);

  searchData = signal<SearchData>({
    search: '',
  });

  searchForm = form(this.searchData, (schema) => {
    debounce(schema.search, 600);
  });

  searchText = computed(() => this.searchData().search.trim());

  usersResource = this.#tasksService.searchUsersResource(this.searchText);

  results = computed(() => {
    if (!this.usersResource.hasValue()) {
      return [];
    }

    const users = this.usersResource.value()?.users ?? [];

    return users.filter(
      (user) => !this.participants().some((participant) => participant.id === user.id)
    );
  });

  showResults = computed(() => this.searchText() !== '' || this.results().length > 0);

  addParticipant(user: UserSearchResult) {
    this.#tasksService.addParticipant(this.taskId(), user.id).subscribe((addedUser) => {
      this.participants.update((current) => [...current, addedUser]);
      this.searchData.set({ search: '' });
      this.searchForm().reset({
        search: '',
      });
    });
  }

  removeParticipant(userId: number) {
    this.#tasksService.removeParticipant(this.taskId(), userId).subscribe(() => {
      this.participants.update((current) =>
        current.filter((participant) => participant.id !== userId)
      );
    });
  }

  isCreator(userId: number) {
    return userId === this.creator();
  }
}