import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  me?: boolean;
}

export interface SingleUserResponse {
  user: UserProfile;
}

export interface UpdateUserData {
  name: string;
  email: string;
}

export interface UpdatePasswordData {
  password: string;
}

export interface UpdateAvatarResponse {
  avatar: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  #http = inject(HttpClient);

  getProfileResource(id: Signal<number>): HttpResourceRef<SingleUserResponse | undefined> {
    return httpResource<SingleUserResponse>(() =>
      id() ? `users/${id()}` : 'users/me'
    );
  }

  updateProfile(data: UpdateUserData): Observable<void> {
    return this.#http.put<void>('users/me', data);
  }

  updatePassword(data: UpdatePasswordData): Observable<void> {
    return this.#http.put<void>('users/me/password', data);
  }

  updateAvatar(avatar: string): Observable<string> {
    return this.#http
      .put<UpdateAvatarResponse>('users/me/avatar', { avatar })
      .pipe(map((resp) => resp.avatar));
  }
}