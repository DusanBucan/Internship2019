import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { SocketService } from '../socket.service';
import { Subject } from 'rxjs';
import { NotificationService } from '../notification.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  //API_WS = ' http://localhost:3000';
  //API = 'http://localhost:5000/api/notification';
  API = 'https://anime-back-end.herokuapp.com/api/notification';

  API_WS = 'https://anime-ws-server.herokuapp.com';
  // API_WS = 'https://blooming-dusk-56996.herokuapp.com';
  // API = '/api/notification';

  public onlineUsers = [];
  addOnlineUserList = new Subject<any>();
  removeOnlineUserList = new Subject<any>();
  newMessageArived = new Subject<any>();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private socketService: SocketService,
    private notifcationService: NotificationService
  ) {
    // kad se neko novi loginuje da se vidi da se loginovao
    socketService.onNewUserLogedIn().subscribe(res => {
      this.addOnlineUserList.next(res);
    });

    socketService.onUserLogOut().subscribe(res => {
      this.removeOnlineUserList.next(res);
    });

    socketService.onNewMessage().subscribe(res => {
      this.newMessageArived.next(res);
    });
  }

  sendMessage(userEmail: string, message: string, sender: string) {
    // oznaci poruke od tog usera kao procitane

    const myID = this.authService.getUserId();

    this.httpClient
      .post(
        this.API + '/markMessageAsSeen',
        {
          myId: myID,
          hisMail: userEmail
        },
        {
          headers: this.authService.getAuthHeaders()
        }
      )
      .subscribe(res => {
        console.log('oznacene kao procitaneee');
        console.log(res);
        // ponovo da ucita tvoje notifikacije ----> mozda je neppotrebno ovoliko saobracaja --> popravljacu posle
        this.notifcationService.getUserNotifications();
      });
    this.socketService.sendMessage(userEmail, message, sender);
  }

  getOnlineUsers() {
    return this.httpClient.get(this.API_WS + '/users');
  }

  getConversition(MyId: string, WithId: string) {
    return this.httpClient.get(
      this.API + '/conversation/' + MyId + '/' + WithId,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}
