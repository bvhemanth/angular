
import * as Raven from 'raven-js';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule,ErrorHandler } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { Daterangepicker, DaterangepickerConfig } from 'ng2-daterangepicker';
import { NgbModule, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

import { LoginComponent } from './login/login.component';
import { MembersComponent } from './members/members.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DepartmentsComponent } from './departments/departments.component';
import { SidenavbarComponent } from './sidenavbar/sidenavbar.component';


Raven
  .config('https://3ac0e39f7dba4f5584f783768528f38a@sentry.io/240567')
  .install();

export class RavenErrorHandler implements ErrorHandler {
  handleError(err:any) : void {
    Raven.captureException(err);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent, DepartmentsComponent, SidenavbarComponent, MembersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    Daterangepicker,
    RouterModule.forRoot([{
        path: '',
        component: LoginComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'departments', component: DepartmentsComponent },
      { path: 'members', component: MembersComponent },
      ]),
      HttpModule
  ],
  providers: [ { provide: ErrorHandler, useClass: RavenErrorHandler } ],
  bootstrap: [AppComponent]
})
export class AppModule { }
