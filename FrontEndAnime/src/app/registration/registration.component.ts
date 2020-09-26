import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'ngAnime-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  error = null;
  success = false;
  responseCode = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.responseCode = false;
  }

  onRegister(form: NgForm) {
    const name = form.value.name;
    const email = form.value.email;
    const password = form.value.password;
    const password2 = form.value.password2;

    this.authService.register(name, email, password, password2).subscribe(
      () => {
        this.error = null;
        this.success = true; //uspesno registrovan
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
        this.success = false;
        this.responseCode = false;
      }
    );
  }

  // treba da ga posaljem na backend i da koristim onaj drugi key
  resolved(captchaResponse: string) {
    this.authService.captcha(captchaResponse).subscribe((res: any) => {
      if (res.responseCode === 0) {
        this.responseCode = true;
      }
    });
  }
}
