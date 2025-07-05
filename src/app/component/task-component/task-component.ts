import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { CommonResponse } from '../../model/CommonResponse';
import { Task } from '../../model/Task';
import { TaskRequestDTO } from '../../model/TaskRequestDTO';
import { TaskService } from '../../service/task-service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';

@Component({
  standalone: true,
  selector: 'app-task-component',
  imports: [
    ReactiveFormsModule, CommonModule, HttpClientModule, ToastrModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatCardModule, MatListModule],
  providers: [TaskService],
  templateUrl: './task-component.html',
  styleUrl: './task-component.css'
})
export class TaskComponent implements OnInit {
  taskForm!: FormGroup;
  pendingTasks: Task[] = [
    { id: 0, title: 'Sample Task 1', description: 'This is a sample task1', completed: false },
    { id: 1, title: 'Sample Task 2', description: 'This is a sample task2', completed: false },
    { id: 3, title: 'Sample Task 3', description: 'This is another sample task', completed: false },
    { id: 4, title: 'Sample Task 4', description: 'This is another sample task', completed: false }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchPendingTasks();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      dueDate: ['', Validators.required],
    });
  }

  createTask(): void {
    if (this.taskForm.invalid) {
      this.toastr.warning('Please fill in required fields', 'Validation');
      return;
    }

    const taskRequest: TaskRequestDTO = this.taskForm.value;

    this.taskService.createTask(taskRequest).subscribe({
      next: (response: CommonResponse) => {
        this.toastr.success(response.message, 'Success');
        this.taskForm.reset();
        this.fetchPendingTasks();
      },
      error: () => {
        this.toastr.error('Failed to create task', 'Error');
      },
    });
  }

  fetchPendingTasks(): void {
    this.taskService.getAllPendingTodos().subscribe({
      next: (response: CommonResponse) => {
        this.pendingTasks = Array.isArray(response.data) ? response.data : [];
        if (this.pendingTasks.length === 0) {
          this.toastr.info('No pending tasks found', 'Info');
        } else {
          this.toastr.success(response.message, 'Loaded');
        }
      },
      error: () => {
        this.toastr.error('Failed to fetch pending tasks', 'Error');
      },
    });
  }

  completeTask(taskId: number): void {
    this.taskService.makeToDoCompleted(taskId).subscribe({
      next: (response: CommonResponse) => {
        this.toastr.success(response.message, 'Success');
        this.fetchPendingTasks();
      },
      error: () => {
        this.toastr.error('Failed to mark task as completed', 'Error');
      },
    });
  }
}