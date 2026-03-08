export interface TaskInsert {
  title: string;
  description: string;
  deadLine: string;
  filepath?: string | null;
}

export interface Subtask {
  id: number;
  description: string;
  completed: boolean;
}

export interface Participant {
  id: number;
  name: string;
  email: string;
  avatar: string;
  lat: number;
  lng: number;
}

export interface Task extends TaskInsert {
  id: number;
  status: number;
  creator: number;
  createdAt: string;
  lat: number;
  lng: number;
  address: string | null;
  position: number;
  participants: Participant[];
  subtasks: Subtask[];
  mine: boolean;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface SingleTaskResponse {
  task: Task;
}

export interface TaskCommentUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

export interface TaskComment {
  id: number;
  comment: string;
  createdAt: string;
  user: TaskCommentUser;
}

export interface UserSearchResult {
  id: number;
  name: string;
  email: string;
  avatar: string;
  lat: number;
  lng: number;
}