import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Http, Response,URLSearchParams,RequestOptions,Headers,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import { AuthenticationService } from '../services/authentication.service';
import { DataStorageService } from '../services/data-storage.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [DataStorageService]
})

export class LoginComponent implements OnInit {

API_URL: string = environment.apiMainPoint;//global declaration for hostname
  BASE_URL:string=environment.apiBasePoint;

  login_success_redirect_url:string='/';
  after_password_reset_redirect_url:string='';
  error='';
  dynEmail='';
  dynPass:any='';
  authToken1:any=null;
  authToken2
  loginID:string='';
  orgName:string='';
  secEmail='';
  secOTP:any='';
  otpDevice:any='';
  newPassword:any='';
  rePassword:any='';
  loading = false;
  headers: Headers = new Headers();

  constructor(private http:Http, private router: Router, private ds: DataStorageService) { }

  ngOnInit() {

      var sessionHandle=localStorage.getItem('jwtToken');
      if(sessionHandle)
      {     
          this.router.navigate(['/dashboard']);
      }

      let apiSuffix='auth/org-name';
      let options='';
      this.ds.Get(options,apiSuffix).subscribe(data=>{
        //console.log(data.json());
        this.orgName=data.json().organization_name;
      },
      error=>{
        var display=error.json();
        this.error='* '+display.error;
      });

      this.http.get(this.API_URL+this.BASE_URL+'auth/org-name').map(
      (response)=>response.json()).subscribe((data)=>
      {   
         
      },
      error=>{
        var display=error.json();
        this.error='* '+display.error;
      });
  }

  login(){
      this.loading = true;
      if((this.dynEmail!='')&&(this.dynPass!=''))
      {
          let data = new URLSearchParams();
          data.append('login_id', this.dynEmail);
          data.append('password', this.dynPass);
          data.append('source', 'mobile_dashboard');

          this.headers.set('withCredentials','boolean = true');

          let options = new RequestOptions({headers:this.headers,withCredentials: true,params:data});

          let headers = new Headers();
          this.headers.set("Content-Type","application/json");
          this.headers.set("Access-Control-Allow-Credentials","true");
          this.headers.set('crossDomain','true');

          this.http.post(this.API_URL+this.BASE_URL+'auth/login/',data,{
            headers: headers
          }).subscribe(data => {
              localStorage.setItem('jwtToken',data.json().auth_token);          
              this.router.navigate(['/dashboard']);
          }, error => {
            var display=error.json();
            this.loading = false;
            this.error='* '+display.error;
          });
      }
      else
      {
          this.error='* Email or Password is empty'
      }
  }

  forget_pass(){
      this.error='';
      $('.login-card').addClass('hide');
      $('.forget-card ').removeClass('hide');
      $('.logo-head').html('<img id="back" src="./../assets/login-arrow-back.png" /> Forgot Password');
      $('#back').on('click',function(){
        $('.login-card ').removeClass('hide');
        $('.logo-head').html('Loktra');
        $('.forget-card ').addClass('hide');
        $('.changePassword-card').addClass('hide');
      });
  }

  getOTP(){

    this.error='';
    $('#back').on('click',function(){
      $('.login-card ').removeClass('hide');
      $('.logo-head').html('Loktra');
      $('.getOtp-card').addClass('hide');
    });

    if(this.secEmail!='')
    {
      let request = new URLSearchParams();
      request.append('login_id', this.secEmail);

      this.http.post(this.API_URL+this.BASE_URL+'auth/login/otp/',request).subscribe(data=>
      {
        $('.forget-card ').addClass('hide');
        $('.getOtp-card ').removeClass('hide');
        this.otpDevice=this.secEmail[0]+this.secEmail[1]+this.secEmail[2]+'******'+'.com';
        this.authToken1=data.json().auth_token;
      }, error=>{
        var display=error.json();
        this.error='* '+display.message;
      });
    } 
    else
    {
      this.error='* Email should not be empty';
    }
  }

  dintGetOTP(){
    this.error='';
    let request = new URLSearchParams();
    request.append('login_id', this.secEmail);
    request.append('auth_token', this.authToken1);
    this.loading = true;

    this.http.post(this.API_URL+this.BASE_URL+'auth/login/otp/call',request).subscribe(data=>
    {
      this.loading = false;
    }, error=>{
        var display=error.json();
        this.loading = false;
        this.error='* '+display.message;
    });
  }

  enterOTP()
  {
      let dataString=new URLSearchParams();
      dataString.append('login_id',this.secEmail);
      dataString.append('otp',this.secOTP);
      dataString.append('auth_token',this.authToken1);

      this.http.post(this.API_URL+this.BASE_URL+'auth/login/otp/validate/',dataString).subscribe(data=>{
            $('.getOtp-card ').addClass('hide');
            $('.changePassword-card').removeClass('hide');
            this.authToken2=data.json().auth_token;
      },error=>{
          var display=error.json();
          this.error='* '+display.message;
      });
  }

  confirmPass()
  {

      $('#back').on('click',function(){
          $('.login-card ').removeClass('hide');
          $('.logo-head').html('Loktra');
          $('.changePassword-card').addClass('hide');
      });

      if((this.newPassword!='')&&(this.rePassword!=''))
      { 
          if(this.newPassword===this.rePassword)
          {
              let dataString=new URLSearchParams();
              dataString.append('login_id',this.secEmail);
              dataString.append('new_password',this.newPassword);
              dataString.append('auth_token',this.authToken2);
              dataString.append('source','dashboard');
              this.http.post(this.API_URL+this.BASE_URL+'auth/login/otp/reset/',dataString).subscribe(data=>
              {
                  $('.changePassword-card').addClass('hide');
                  $('.success-card').removeClass('hide');
                  $('.logo-head').addClass('hide');
                  this.error='';
              },error=>{
                  var display=error.json();
                  this.error=display.message;
              });
          }
          else
          {
              this.error='* Both should be equal';
          }  
      }
      else
      {
          this.error='* Fill both the fileds';
      }  
  }

  success()
  {   
      this.error='';
      $('.success-card').addClass('hide');
      $('.login-card ').removeClass('hide');
      $('.logo-head').removeClass('hide');
  }
  forceLower(strInput) 
  {
      strInput.value=strInput.value.toLowerCase();
  }​


}
