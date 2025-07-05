import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment.prod';
import { ToastrService } from 'ngx-toastr';
import { TaskRequestDTO } from '../model/TaskRequestDTO';
import { Observable, catchError, throwError } from 'rxjs';
import { CommonResponse } from '../model/CommonResponse';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private taskBaseUrl = environment.baseUrl + '/task';

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }

  createTask(task: TaskRequestDTO): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.taskBaseUrl}/create`, task)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  getAllPendingTodos(): Observable<CommonResponse> {
    return this.http.get<CommonResponse>(`${this.taskBaseUrl}/get-all-pending-todos`)
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }

  makeToDoCompleted(id: number): Observable<CommonResponse> {
    const params = new HttpParams().set('id', id);
    return this.http.post<CommonResponse>(`${this.taskBaseUrl}/make-todo-completed`, { params })
      .pipe(
        catchError(error => {
          return throwError(() => error);
        })
      );
  }
}
