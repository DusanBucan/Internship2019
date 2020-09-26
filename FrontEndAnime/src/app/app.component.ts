import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
@Component({
  selector: 'ngAnime-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ng-myAnime';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.autoLogin();
  }
}
