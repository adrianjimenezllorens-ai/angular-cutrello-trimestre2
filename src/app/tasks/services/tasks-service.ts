import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import {SingleTaskResponse,Subtask,Task,TaskComment,TaskInsert,TasksResponse,UserSearchResult,} from '../interfaces/task';
import { map, Observable } from 'rxjs';

interface SingleSubtaskResponse {
  subtask: Subtask;
}

interface SingleCommentResponse {
  comment: TaskComment;
}

export interface TaskCommentsResponse {
  comments: TaskComment[];
  count: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface SingleUserResponse {
  user: UserSearchResult;
}

interface UsersResponse {
  users: UserSearchResult[];
}

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  #tasksUrl = 'tasks';
  #http = inject(HttpClient);

  getTasksResource(): HttpResourceRef<TasksResponse | undefined> {
    return httpResource<TasksResponse>(() => this.#tasksUrl);
  }

  getSingleTaskResource(id: Signal<number>): HttpResourceRef<SingleTaskResponse | undefined> {
    return httpResource<SingleTaskResponse>(() =>
      id() > 0 ? `${this.#tasksUrl}/${id()}` : undefined
    );
  }

  getCommentsResource(
    taskId: Signal<number>,
    page: Signal<number>
  ): HttpResourceRef<TaskCommentsResponse | undefined> {
    return httpResource<TaskCommentsResponse>(() =>
      taskId() > 0 ? `${this.#tasksUrl}/${taskId()}/comments?page=${page()}` : undefined
    );
  }

  addTask(task: TaskInsert): Observable<Task> {
    return this.#http
      .post<SingleTaskResponse>(this.#tasksUrl, task)
      .pipe(map((res) => res.task));
  }

  updateTask(id: number, task: TaskInsert): Observable<Task> {
    return this.#http
      .put<SingleTaskResponse>(`${this.#tasksUrl}/${id}`, task)
      .pipe(map((res) => res.task));
  }

  updateStatus(id: number, status: number): Observable<Task> {
    return this.#http
      .put<SingleTaskResponse>(`${this.#tasksUrl}/${id}/status`, { status })
      .pipe(map((res) => res.task));
  }

  deleteTask(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.#tasksUrl}/${id}`);
  }

  addSubtask(taskId: number, description: string): Observable<Subtask> {
    return this.#http
      .post<SingleSubtaskResponse>(`${this.#tasksUrl}/${taskId}/subtasks`, {
        description,
      })
      .pipe(map((res) => res.subtask));
  }

  updateSubtask(subtaskId: number, completed: boolean): Observable<Subtask> {
    return this.#http
      .put<SingleSubtaskResponse>(`${this.#tasksUrl}/subtasks/${subtaskId}`, {
        completed,
      })
      .pipe(map((res) => res.subtask));
  }

  deleteSubtask(subtaskId: number): Observable<void> {
    return this.#http.delete<void>(`${this.#tasksUrl}/subtasks/${subtaskId}`);
  }

  addComment(taskId: number, comment: string): Observable<TaskComment> {
    return this.#http
      .post<SingleCommentResponse>(`${this.#tasksUrl}/${taskId}/comments`, {
        comment,
      })
      .pipe(map((res) => res.comment));
  }

  searchUsersResource(name: Signal<string>): HttpResourceRef<UsersResponse | undefined> {
    return httpResource<UsersResponse>(() =>
      name().trim() ? `users/name/${encodeURIComponent(name().trim())}` : undefined
    );
  }

  addParticipant(taskId: number, userId: number): Observable<UserSearchResult> {
    return this.#http
      .post<SingleUserResponse>(`${this.#tasksUrl}/${taskId}/participants/${userId}`, {})
      .pipe(map((res) => res.user));
  }

  removeParticipant(taskId: number, userId: number): Observable<void> {
    return this.#http.delete<void>(`${this.#tasksUrl}/${taskId}/participants/${userId}`);
  }
}