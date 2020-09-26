import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket;

  constructor() {
    //this.socket = io('https://blooming-dusk-56996.herokuapp.com');
    this.socket = io('https://anime-ws-server.herokuapp.com', {
      'sync disconnect on unload': true
    });
  }

  public onNewNotification(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('shedulde notification', (data: any) =>
        observer.next(data)
      );
    });
  }

  // kad user hoce da prijavi komentar se poziva ova fija
  public reportComment(comment: any) {
    this.socket.emit('reportedComment', comment);
  }

  public onCommentReported(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('ReviewRepotedComment', (data: any) =>
        observer.next(data)
      );
    });
  }

  public sendMessage(userEmail, message, sender: string) {
    this.socket.emit('sendMessage', {
      email: userEmail,
      NewMessage: message,
      Sender: sender
    });
  }

  public onNewMessage(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('OnNewMessage', (data: any) => observer.next(data));
    });
  }

  public onNewUserLogedIn(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('neWuser', (data: any) => observer.next(data));
    });
  }

  public onUserLogOut(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('userLogOut', (data: any) => observer.next(data));
    });
  }

  public addComment(notification: any) {
    this.socket.emit('comment', notification);
  }

  public onAnimeCommented(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('animaCommented', (data: any) => observer.next(data));
    });
  }

  public removeComment(commentId: any) {
    this.socket.emit('commentRemove', commentId);
  }

  public onAnimeCommentRemoved(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('animaCommentRemoved', (data: any) => observer.next(data));
    });
  }

  public onNewAnimeComment(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('newComment', (data: any) => observer.next(data));
    });
  }

  // svima se poveca broj like/dislike ---> ovo se registruje tamo u animeDetails komponenti
  public onAnimeRated(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('OnAnimeRated', (data: any) => observer.next(data));
    });
  }
  // ovo je za usera cija je anima da dobije notifikaciju
  public onMyAnimeRated(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('OnMyAnimeRated', (data: any) => observer.next(data));
    });
  }

  userRateAnime(notification: any) {
    this.socket.emit('rateAnime', notification);
  }

  loginSocket(user: any) {
    this.socket.emit('login', { email: user.email, role: user.role });
  }

  logOutSocket(token: string) {
    this.socket.emit('disconect', token);
  }
}
