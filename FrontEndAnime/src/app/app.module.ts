import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './registration/registration.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './header/header.component';

// ANGULAR MATERIAL importi
import { AngularMaterialModule } from './angular-material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
// krajj angular material

import { RecaptchaModule } from 'ng-recaptcha';

import { ApiAryService } from './api-ary.service';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';

import {
  ExploreanimeComponent,
  DialogOverviewExampleDialogSetTimeShedulde
} from './exploreanime/exploreanime.component';

import {
  MyanimeComponent,
  DialogOverviewExampleDialogAdd,
  DialogOverviewExampleDialogListDelete
} from './myanime/myanime.component';
import { AnimeComponent } from './anime/anime.component';

import { AnimeService } from './anime/anime.service';
import { UserService } from './user.service';

import { ChangepasswordComponent } from './changepassword/changepassword.component';

import {
  ManageUserComponent,
  DialogOverviewExampleDialog,
  DialogOverviewExampleDialogDelete
} from './manage-user/manage-user.component';
import { LoginComponent } from './login/login.component';
import { NotificationService } from './notification.service';
import { AnimesCommunityPageComponent } from './animes-community-page/animes-community-page.component';
import { ChatComponentComponent } from './chat-component/chat-component.component';

import { SortAnimesPipe } from './sort-animes.pipe';
import { FilterAnimesPipe } from './filter-animes.pipe';

import {
  AnimeDetailsComponent,
  DialogAddComment
} from './anime-details/anime-details.component';
import { CommentService } from './comment.service';
import { VoteService } from './vote.service';

import { NgxSocialButtonModule, SocialServiceConfig } from 'ngx-social-button';

import { NgxSpinnerModule } from 'ngx-spinner';

import { JwSocialButtonsModule } from 'jw-angular-social-buttons';

import { SettingsComponent } from './settings/settings.component';

// Configs
export function getAuthServiceConfigs() {
  const config = new SocialServiceConfig().addFacebook('478517526334006');
  return config;
}

import { SimpleNotificationsModule } from 'angular2-notifications';

import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

import { httpInterceptorProviders } from './interceptors';
import { OtherslistComponent } from './otherslist/otherslist.component';

import { EmbedVideo } from 'ngx-embed-video';
import { DemoVideosComponent } from './demo-videos/demo-videos.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    RegistrationComponent,
    ExploreanimeComponent,
    MyanimeComponent,
    AnimeComponent,
    ChangepasswordComponent,
    ManageUserComponent,
    DialogOverviewExampleDialog,
    DialogOverviewExampleDialogDelete,
    DialogOverviewExampleDialogSetTimeShedulde,
    AnimesCommunityPageComponent,
    ChatComponentComponent,
    DialogOverviewExampleDialogListDelete,
    DialogOverviewExampleDialogAdd,
    AnimeDetailsComponent,
    SortAnimesPipe,
    FilterAnimesPipe,
    DialogAddComment,
    SettingsComponent,
    OtherslistComponent,
    DemoVideosComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    // angular materijal se zavrsavaaa,
    BrowserAnimationsModule,
    AngularMaterialModule,
    FlexLayoutModule,
    // kraj angular material
    RecaptchaModule,
    NgxSocialButtonModule,
    NgxSpinnerModule,
    JwSocialButtonsModule,
    SimpleNotificationsModule.forRoot(),

    // za datetime picker
    OwlDateTimeModule,
    OwlNativeDateTimeModule,

    HttpClientModule,
    EmbedVideo.forRoot()
  ],
  entryComponents: [
    DialogOverviewExampleDialog,
    DialogOverviewExampleDialogDelete,
    DialogOverviewExampleDialogSetTimeShedulde,
    DialogOverviewExampleDialogAdd,
    DialogOverviewExampleDialogListDelete,
    DialogAddComment
  ],

  providers: [
    ApiAryService,
    AuthService,
    SocketService,
    AnimeService,
    UserService,
    NotificationService,
    CommentService,
    VoteService,
    {
      provide: SocialServiceConfig,
      useFactory: getAuthServiceConfigs
    },
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}
