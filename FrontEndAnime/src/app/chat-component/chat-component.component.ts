import { Component, OnInit } from '@angular/core';
import { ChatService } from './chat.service';
import { Subscription, from } from 'rxjs';
import { AuthService } from '../auth.service';
import { MatTableDataSource } from '@angular/material/table';
import { element } from 'protractor';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ngAnime-chat-component',
  templateUrl: './chat-component.component.html',
  styleUrls: ['./chat-component.component.scss']
})
export class ChatComponentComponent implements OnInit {
  displayedColumns: string[] = ['User', 'Me'];

  userSubscription: Subscription;
  userLogOutSubscription: Subscription;
  newMessage: Subscription;

  dataSource: MatTableDataSource<any>;

  userList = [];
  userEmail = '';

  messages = [];
  selecedUser = { email: '', messages: [] };

  showInput = false;

  public chatingWith: any;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const mail = params.get('email');

          // sve funckijee
          this.authService.getCurrentUser().subscribe(user => {
            this.userEmail = user.email;
            this.userList = [];

            this.chatService.getOnlineUsers().subscribe((userList: any) => {
              userList.forEach(userItem => {
                const indx = this.userList.findIndex(
                  x => x.email === userItem.email
                );
                if (indx === -1 && userItem.email !== this.userEmail) {
                  this.userList.push({ email: userItem.email, messages: [] });
                }

                // podesavanje trenutnog usera ako je kliknuo na notifikaciju poruke od tog usera --> da prikaze konverzaciju sa njim
                if (userItem.email === mail) {
                  const indx2 = this.userList.findIndex(
                    x => x.email === userItem.email
                  );
                  this.selecedUser = this.userList[indx2];

                  this.showConversation(this.selecedUser);
                }
              });
            });

            // ako se user ulogovao da se doda na liste online usera
            this.userSubscription = this.chatService.addOnlineUserList.subscribe(
              element3 => {
                const indx = this.userList.findIndex(x => x.email === element3);

                if (indx === -1 && element3 !== this.userEmail) {
                  this.userList.push({ email: element3, messages: [] });
                }
              }
            );

            // ako se user izlogovao da se obrise sa liste online usera
            this.userLogOutSubscription = this.chatService.removeOnlineUserList.subscribe(
              element2 => {
                const indx = this.userList.findIndex(x => x.email === element2);

                if (indx !== -1) {
                  this.userList.splice(indx, 1);
                }
                // proveriti da li je to user sa kojim smo mi chatovali.. ---> da onda ispise

                if (this.selecedUser.email === element2) {
                  this.selecedUser = { email: '', messages: [] };
                  alert('user is offline');
                  this.showInput = false;
                }
              }
            );

            // treba da ubaci u odgovarajucu listu sa porukama
            this.newMessage = this.chatService.newMessageArived.subscribe(
              message => {
                const indx = this.userList.findIndex(
                  x => x.email === message.from
                );

                if (indx !== -1) {
                  const newMessage = { meSay: '', heSay: message.message };

                  this.userList[indx].messages.push(newMessage);

                  this.selecedUser = this.userList[indx];

                  this.dataSource = new MatTableDataSource(
                    this.userList[indx].messages
                  );
                }
                //alert(`message: ${message.message} from: ${message.from}`);
              }
            );
          });
          // kraj
          return mail;
        })
      )
      .subscribe(res => {});
  }

  sendMessage(message: string, inputPolje: any) {
    // da se u konverzaciji kod tebe vidi da si poslao poruku

    inputPolje.value = '';

    const indx = this.userList.findIndex(
      x => x.email === this.selecedUser.email
    );

    this.userList[indx].messages.push({ meSay: message, heSay: '' });

    // da se osvezi view
    this.dataSource = new MatTableDataSource(this.userList[indx].messages);

    this.chatService.sendMessage(
      this.selecedUser.email,
      message,
      this.userEmail
    );
  }

  /// da posalje zahtev na backEnd da dobavi ceo razgovor....
  showConversation(user: any) {
    this.chatingWith = user.email;

    const indx = this.userList.findIndex(x => x.email === user.email);

    this.selecedUser = this.userList[indx];
    this.showInput = true;

    this.chatService
      .getConversition(this.authService.getUserId(), user.email)
      .subscribe(conversation => {
        this.messages = conversation as [];

        const myMail = this.authService.getEmail();

        this.messages = this.messages.map(x => {
          // objekat koji sadrzi polja meSay, heSay
          return {
            heSay: x.from === this.selecedUser.email ? x.message : '',
            meSay: x.from === myMail ? x.message : ''
          };
        });

        this.selecedUser.messages = this.messages; // podesi poruke sa tim userom da bi posle mogao da dodajes u taj array poruke da se nadovezu

        this.dataSource = new MatTableDataSource(this.messages);
      });
  }
}
