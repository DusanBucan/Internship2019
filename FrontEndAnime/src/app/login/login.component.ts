import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'ngAnime-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  error = null;
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {}
  onLogin(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.authService.login(email, password).subscribe(
      res => {
        this.error = null;
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error.msg;
      }
    );
  }

  isNotVerified() {
    if (this.error) {
      if (this.error.error.msg === 'User not verified') {
        return true;
      }
    }
    return false;
  }
}
