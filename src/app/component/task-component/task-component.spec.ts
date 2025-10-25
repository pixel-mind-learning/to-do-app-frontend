import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { TaskComponent } from './task-component';
import { TaskService } from '../../service/task-service';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { Task } from '../../model/Task';
import { CommonResponse } from '../../model/CommonResponse';
import { of, throwError } from 'rxjs';

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'createTask',
      'getAllPendingTodos',
      'makeToDoCompleted'
    ]);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, TaskComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: ToastrService, useValue: mockToastr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // -----------------should create the component
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // -----------------should initialize form on ngOnInit
  it('should initialize form on ngOnInit', () => {
    expect(component.taskForm).toBeDefined();
    expect(component.taskForm.get('title')).toBeTruthy();
  });

  // -----------------should call service and update pendingTasks when fetching todos
  it('should call service and update pendingTasks when fetching todos', () => {
    const mockTasks: Task[] = [{
      id: 1, title: 'Task 1', description: 'desc', completed: false,
      dueDate: ''
    }];
    const response: CommonResponse = { status: 'OK', message: 'Fetched', data: mockTasks };

    mockTaskService.getAllPendingTodos.and.returnValue(of(response));

    component.fetchPendingTasks();

    expect(mockTaskService.getAllPendingTodos).toHaveBeenCalled();
    expect(component.pendingTasks.length).toBe(1);
    expect(component.pendingTasks[0].title).toBe('Task 1');
  });

  // -----------------should show toastr error if fetching todos fails
  it('should show toastr error if fetching todos fails', () => {
    mockTaskService.getAllPendingTodos.and.returnValue(throwError(() => new Error('Network error')));

    component.fetchPendingTasks();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to fetch pending tasks', 'Error');
  });

  // -----------------should show warning if form invalid when creating task
  it('should show warning if form invalid when creating task', () => {
    component.taskForm.patchValue({ title: '', description: '', dueDate: '' });

    component.createTask();

    expect(mockToastr.warning).toHaveBeenCalledWith('Please fill in required fields', 'Validation');
    expect(mockTaskService.createTask).not.toHaveBeenCalled();
  });

  // -----------------should call service and show success when task created
  it('should call service and show success when task created', fakeAsync(() => {
    component.taskForm.patchValue({ title: 'Task 1', description: 'Desc', dueDate: '2025-10-20' });

    const response: CommonResponse = { status: 'OK', message: 'Task created', data: null };
    mockTaskService.createTask.and.returnValue(of(response));
    spyOn(component, 'fetchPendingTasks');

    component.createTask();
    tick();

    expect(mockTaskService.createTask).toHaveBeenCalled();
    expect(mockToastr.success).toHaveBeenCalledWith('Task created', 'Success');
    expect(component.fetchPendingTasks).toHaveBeenCalled();
  }));

  // -----------------should show error if task creation fails
  it('should show error if task creation fails', () => {
    component.taskForm.patchValue({ title: 'Task 1', description: 'Desc', dueDate: '2025-10-20' });
    mockTaskService.createTask.and.returnValue(throwError(() => new Error('Network error')));

    component.createTask();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to create task', 'Error');
  });

  // -----------------should call service and show success when marking task complete
  it('should call service and show success when marking task complete', () => {
    const response: CommonResponse = { status: 'OK', message: 'Task completed', data: null };
    mockTaskService.makeToDoCompleted.and.returnValue(of(response));
    spyOn(component, 'fetchPendingTasks');

    component.completeTask(1);

    expect(mockTaskService.makeToDoCompleted).toHaveBeenCalledWith(1);
    expect(mockToastr.success).toHaveBeenCalledWith('Task completed', 'Success');
    expect(component.fetchPendingTasks).toHaveBeenCalled();
  });

  // -----------------should show error when marking task complete fails
  it('should show error when marking task complete fails', () => {
    mockTaskService.makeToDoCompleted.and.returnValue(throwError(() => new Error('Network error')));

    component.completeTask(1);

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to mark task as completed', 'Error');
  });
});
