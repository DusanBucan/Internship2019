import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NotificationsService } from 'angular2-notifications';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notifPopUpSvc: NotificationsService,
    private router: Router
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry(2),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // 401 handled in auth.interceptor
          //this.notifPopUpSvc.error('Unauthorized user');

          if (
            !(this.router.url === '/login' || this.router.url === '/register')
          ) {
            this.router.navigate(['/login']);
          }
        }
        return throwError(error);
      })
    );
  }
}
