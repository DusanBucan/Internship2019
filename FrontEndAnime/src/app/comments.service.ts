import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  //API = 'http://localhost:5000/api/comments';
  API = 'https://anime-back-end.herokuapp.com/api/comments';
  private authenticated = false;
  private headers: HttpHeaders;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  addStoryComment(
    animeID: number,
    commentContent: string,
    creatorID: number,
    playlist: string,
    playlistOwner: number
  ) {
    const payload = {
      content: commentContent,
      creator: this.authService.getUserId(),
      playList: playlist,
      playListOwner: playlistOwner
    };

    return this.httpClient.post(this.API, payload, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
