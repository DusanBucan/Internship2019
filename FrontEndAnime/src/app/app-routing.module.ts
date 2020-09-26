import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegistrationComponent } from './registration/registration.component';
import { LoginComponent } from './login/login.component';

import { ExploreanimeComponent } from './exploreanime/exploreanime.component';
import { MyanimeComponent } from './myanime/myanime.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';
import { ManageUserComponent } from './manage-user/manage-user.component';
import { AnimesCommunityPageComponent } from './animes-community-page/animes-community-page.component';
import { ChatComponentComponent } from './chat-component/chat-component.component';
import { AnimeDetailsComponent } from './anime-details/anime-details.component';
import { SettingsComponent } from './settings/settings.component';

import { AuthGuard } from './auth.guard';
import { OtherslistComponent } from './otherslist/otherslist.component';
import { DemoVideosComponent } from './demo-videos/demo-videos.component';

const routes: Routes = [
  { path: '', redirectTo: '/myAnime', pathMatch: 'full' },
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'exploreAnime',
    component: ExploreanimeComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'myAnime',
    component: MyanimeComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'changepassword',
    component: ChangepasswordComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'members',
    component: ManageUserComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },

  {
    path: 'animes',
    component: AnimesCommunityPageComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },

  {
    path: 'chat/:email',
    component: ChatComponentComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'animeDetails/:user_email/:lista_name/:id', //'animeDetails/:id'
    component: AnimeDetailsComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'settings/:user_email',
    component: SettingsComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'userList/:user_email/:play_list',
    component: OtherslistComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },
  {
    path: 'demo',
    component: DemoVideosComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'user' }
  },

  { path: '**', redirectTo: '/myAnime' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
