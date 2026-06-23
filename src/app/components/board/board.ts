import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, timeout } from 'rxjs/operators';
import { of } from 'rxjs';
import { Task } from '../../models/task';

const MOCK_TASKS: Task[] = [
  { id: 1, title: 'Set up CI/CD pipeline',        description: 'Configure GitHub Actions for build, test, deploy',  status: 'done',        createdAt: '2025-04-01T09:00:00Z' },
  { id: 2, title: 'Design task board UI',          description: 'Kanban-style board with three columns',             status: 'done',        createdAt: '2025-04-02T10:00:00Z' },
  { id: 3, title: 'Implement REST API',            description: 'Node.js backend with CRUD endpoints for tasks',    status: 'done',        createdAt: '2025-04-03T11:00:00Z' },
  { id: 4, title: 'Add drag-and-drop support',     description: 'Move tasks between columns via drag and drop',     status: 'in-progress', createdAt: '2025-04-10T09:00:00Z' },
  { id: 5, title: 'Write unit tests',              description: 'Angular component tests and API endpoint tests',   status: 'in-progress', createdAt: '2025-04-12T14:00:00Z' },
  { id: 6, title: 'Deploy to cloud host',          description: 'Zero-downtime deploy via GitHub Actions workflow',  status: 'in-progress', createdAt: '2025-04-15T10:00:00Z' },
  { id: 7, title: 'Add sprint planning view',      description: 'Group tasks by sprint with start/end dates',       status: 'todo',        createdAt: '2025-05-01T09:00:00Z' },
  { id: 8, title: 'User authentication',           description: 'Login/logout with JWT token support',              status: 'todo',        createdAt: '2025-05-03T11:00:00Z' },
  { id: 9, title: 'Email notifications',           description: 'Notify team on task status changes',               status: 'todo',        createdAt: '2025-05-05T09:00:00Z' },
];

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.css'
})
export class Board implements OnInit {

  tasks: Task[] = [];
  newTaskTitle: string = '';
  newTaskDescription: string = '';

  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.http.get<Task[]>(this.apiUrl).pipe(
      timeout(3000),
      catchError(() => of(MOCK_TASKS))
    ).subscribe((data) => {
      this.tasks = data && data.length > 0 ? data : MOCK_TASKS;
      this.cdr.detectChanges();
    });
  }

  get todoTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'todo');
  }

  get inProgressTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'in-progress');
  }

  get doneTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'done');
  }

  addTask(): void {
    if (!this.newTaskTitle.trim()) return;
    const newTask = {
      title: this.newTaskTitle,
      description: this.newTaskDescription,
      status: 'todo' as const,
      createdAt: new Date().toISOString()
    };
    this.http.post<Task>(this.apiUrl, newTask).pipe(
      catchError(() => of({ ...newTask, id: Date.now() } as Task))
    ).subscribe((saved) => {
      this.tasks = [...this.tasks, saved];
      this.newTaskTitle = '';
      this.newTaskDescription = '';
      this.cdr.detectChanges();
    });
  }

  moveTask(task: Task, newStatus: 'todo' | 'in-progress' | 'done'): void {
    const updated = { ...task, status: newStatus };
    this.http.put<Task>(`${this.apiUrl}/${task.id}`, updated).pipe(
      catchError(() => of(updated))
    ).subscribe(() => {
      this.tasks = this.tasks.map(t => t.id === task.id ? updated : t);
      this.cdr.detectChanges();
    });
  }

  deleteTask(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => of(undefined))
    ).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.cdr.detectChanges();
    });
  }
}