import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const expectedRole = next.data.expectedRole;

    return this.authService.getCurrentUser().pipe(
      map(user => {
        if (
          (expectedRole === 'user' && (user.role === 4 || user.role === 2)) ||
          (expectedRole === 'admin' && user.role === 4)
        ) {
          return true;
        }
        // da iz authServisa obrise currentUser-a...
        this.authService.invalidateUser();
        return this.router.createUrlTree(['/login']);
      }),
      catchError(() => {
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
