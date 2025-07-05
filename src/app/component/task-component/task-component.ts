import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
    MatInputModule, MatButtonModule, MatCardModule, MatListModule,
  ],
  providers: [TaskService],
  templateUrl: './task-component.html',
  styleUrl: './task-component.css'
})
export class TaskComponent implements OnInit {
  taskForm!: FormGroup;
  pendingTasks: Task[] = [];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.fetchPendingTasks();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
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
        if (response && response.status === 'OK') {
          this.toastr.success(response.message, 'Success');
          this.taskForm.reset();
          this.fetchPendingTasks();
          this.cdr.detectChanges();
          return;
        } else {
          this.toastr.info(response.message, 'Info');
          return;
        }
      },
      error: () => {
        this.toastr.error('Failed to create task', 'Error');
      },
    });
  }

  fetchPendingTasks(): void {
    this.taskService.getAllPendingTodos().subscribe({
      next: (response: CommonResponse) => {
        if (response && response.data) {
          this.pendingTasks = Array.isArray(response.data) ? response.data : [];
          this.cdr.detectChanges();
          return;
        } else {
          this.toastr.info(response.message, 'Info');
          return;
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
        if (response && response.status === 'OK') {
          this.toastr.success(response.message, 'Success');
          this.fetchPendingTasks();
          this.cdr.detectChanges();
          return;
        } else {
          this.toastr.info(response.message, 'Info');
          return;
        }
      },
      error: () => {
        this.toastr.error('Failed to mark task as completed', 'Error');
      },
    });
  }
}