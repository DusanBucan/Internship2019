import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { SocketService } from './socket.service';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //API = '/api/user';
  //API = 'http://localhost:5000/api/user';
  API = 'https://anime-back-end.herokuapp.com/api/user';
  private authenticated = false;
  private headers: HttpHeaders;
  private user: any;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private socketService: SocketService
  ) {}

  register(name: string, email: string, password: string, password2: string) {
    return this.httpClient.post<any>(this.API + '/register', {
      name,
      email,
      password,
      password2
    });
  }

  login(email: string, password: string) {
    return this.httpClient
      .post<any>(this.API + '/login', { email, password })
      .pipe(
        tap(resData => {
          localStorage.setItem('token', resData.token);
          this.setAuthHeaders(resData.token);
          this.getCurrentUser().subscribe(user => {
            this.socketService.loginSocket(user); // da otvori socket konekciju

            this.user = user;
            this.authenticated = true;
            this.router.navigate(['/myAnime']);
          });
        })
      );
  }

  changePassword(
    password: string,
    password2: string,
    password3: string,
    email: string
  ) {
    return this.httpClient.post<any>(
      this.API + '/changepassword',
      {
        password,
        password2,
        password3,
        email
      },
      { headers: this.headers }
    );
  }

  getCurrentUser() {
    return this.httpClient.get<any>(this.API + '/current', {
      headers: this.headers
    });
  }

  isAuthenticated() {
    return this.authenticated;
  }

  getAuthHeaders() {
    return this.headers;
  }

  setAuthHeaders(token: string) {
    if (token == null) {
      const existingToken = localStorage.getItem('token');
      this.headers = new HttpHeaders({
        Authorization: existingToken
      });
    } else {
      this.headers = new HttpHeaders({
        Authorization: token
      });
    }
  }

  getUsername() {
    if (this.user) {
      return this.user.name;
    }
  }

  getEmail() {
    if (this.user) {
      return this.user.email;
    }
  }

  getUserId() {
    if (this.user) {
      return this.user.id;
    }
    return null;
  }

  getUser() {
    if (this.user) {
      return this.user;
    }
    return null;
  }

  getId() {
    this.setAuthHeaders(null);
    return this.getCurrentUser();
  }

  hasRoleAdmin() {
    if (this.user) {
      return this.user.role.toString() === '4';
    }
    return false;
  }

  logout() {
    this.socketService.logOutSocket(this.user.email); ///

    this.authenticated = false;
    this.user = null;
    this.headers = null;
    this.router.navigate(['/login']);
    localStorage.removeItem('token');
  }

  autoLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    this.setAuthHeaders(token);
    this.getCurrentUser().subscribe(user => {
      this.socketService.loginSocket(user); // da otvori socket konekciju
      this.user = user;
      this.authenticated = true;
    });
  }

  captcha(token: string) {
    return this.httpClient.post(this.API + '/captcha', { captcha: token });
  }

  // kad ga blokira da moze da mu obrise sve...
  invalidateUser() {
    this.authenticated = false;
    this.user = null;
    this.headers = new HttpHeaders();
    localStorage.removeItem('token');
  }
}
