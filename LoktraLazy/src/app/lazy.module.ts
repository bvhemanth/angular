import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { Daterangepicker, DaterangepickerConfig } from 'ng2-daterangepicker';
import { MemberDetailsComponent } from './member-details/member-details.component';
import { FormsModule } from '@angular/forms';
import { AttendanceComponent } from './attendance/attendance.component';
import { LeavemanagementComponent } from './leavemanagement/leavemanagement.component';
import { AgentDetailsComponent } from './member-details/agent-details/agent-details.component';

const routes: Routes = [
    { path: 'memberdetails', component: MemberDetailsComponent },
    { path: 'leaves', component: LeavemanagementComponent },
    { path: 'attendance', component: AttendanceComponent },
    {
        path: 'agentdetails',
        component: AgentDetailsComponent  
      }
];

@NgModule({
  imports: [
    CommonModule,
    Daterangepicker,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ MemberDetailsComponent, AttendanceComponent, LeavemanagementComponent,AgentDetailsComponent]
})
export class LazyModule { }
