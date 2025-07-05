import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./component/task-component/task-component').then(m => m.TaskComponent)
    },

];
