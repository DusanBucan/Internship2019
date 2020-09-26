import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { List } from './list.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //API = '/api/user';

  API = 'https://anime-back-end.herokuapp.com/api/user';
  //API = 'http://localhost:5000/api/user';

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) {}

  getUserPlayLists(user: any) {
    return this.httpClient.get(this.API + '/myAnimePlaylists/' + user.id, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getAllUsers(event: PageEvent, searchValue: string): Observable<any> {
    const UrlParams = {
      pageIndex: event.pageIndex.toString(),
      pageSize: event.pageSize.toString(),
      length: event.length.toString(),
      searchParam: searchValue
    };

    return this.httpClient.get<any>(this.API + '/getAll', {
      params: UrlParams,
      headers: this.authService.getAuthHeaders()
    });
  }

  saveUser(user: any): Observable<any> {
    return this.httpClient.post(this.API, user, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteUser(userID: number) {
    return this.httpClient.delete(this.API + '/' + userID, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deleteList(userId: number, namee: string) {
    return this.httpClient.delete(
      this.API + '/deleteList/' + userId + '/' + namee,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  deleteAnimeFromList(userId: any, listName: string, animeTitle: string) {
    return this.httpClient.delete(
      this.API + '/animeFromList/' + userId + '/' + listName + '/' + animeTitle,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  getUserByID(userID: string) {
    return this.httpClient.get(this.API + '/findByID/' + userID, {
      headers: this.authService.getAuthHeaders()
    });
  }

  suspendUser(userId: number, dueDate: Date) {
    const payload = {
      id: userId,
      date: dueDate
    };

    return this.httpClient.post(this.API + '/suspendUser', payload, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getListDetails(userID: number, listName: string) {
    return this.httpClient.get(
      this.API + '/myPlaylistDetails/' + userID + '/' + listName,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }
  saveList(userID: number, access: boolean, listName: string) {
    const payload = {
      name: listName,
      accessibility: access,
      _id: userID
    };

    return this.httpClient.post(this.API + '/createList', payload, {
      headers: this.authService.getAuthHeaders()
    });
  }

  unblockUser(userID: any) {
    return this.httpClient.post(
      this.API + '/unblockUser',
      { id: userID },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  getUserByEmail(Email: string) {
    return this.httpClient.post(
      this.API + '/getByEmail',
      { email: Email },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  changeProfileImage(file: any) {
    const fb = new FormData();
    fb.append('image', file, file.name);
    fb.append('userID', this.authService.getUserId());
    return this.httpClient.post(this.API + '/uploadImages', fb, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getUserImage(userId: any) {
    return this.httpClient.get(this.API + '/userImage/' + userId, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
