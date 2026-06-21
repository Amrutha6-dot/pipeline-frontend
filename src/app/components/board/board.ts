import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Task } from '../../models/task';

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
    this.http.get<Task[]>(this.apiUrl).subscribe((data) => {
      this.tasks = data;
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

    this.http.post<Task>(this.apiUrl, newTask).subscribe((saved) => {
      this.tasks = [...this.tasks, saved];
      this.newTaskTitle = '';
      this.newTaskDescription = '';
      this.cdr.detectChanges();
    });
  }

  moveTask(task: Task, newStatus: 'todo' | 'in-progress' | 'done'): void {
    const updated = { ...task, status: newStatus };
    this.http.put<Task>(`${this.apiUrl}/${task.id}`, updated).subscribe(() => {
      this.tasks = this.tasks.map(t => t.id === task.id ? updated : t);
      this.cdr.detectChanges();
    });
  }

  deleteTask(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      this.cdr.detectChanges();
    });
  }
}