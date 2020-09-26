import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../auth.service';

@Component({
  selector: 'ngAnime-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.scss']
})
export class ChangepasswordComponent implements OnInit {
  error = null;
  success = false;

  password = '';
  password2 = '';
  password3 = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {}
  onPasswordChange(form: NgForm) {
    const password = form.value.password;
    const password2 = form.value.password2;
    const password3 = form.value.password3;

    this.authService.getCurrentUser().subscribe(user => {
      this.authService
        .changePassword(password, password2, password3, user.email)
        .subscribe(
          () => {
            this.error = null;
            this.success = true;
          },
          (httpErrorResponse: HttpErrorResponse) => {
            this.error = httpErrorResponse.error;
            this.success = false;
          }
        );
    });
  }
}
