import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import { environment } from '../../environments/environment';

@Injectable()
export class DataStorageService {

    API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;
    headers: Headers = new Headers();
    info:any;

  	constructor(private http:Http,private router: Router) { }
    
    Get(options,apiSuffix)
    { 
      return this.http.get(this.API_URL+this.BASE_URL+apiSuffix, options);
    }
    
    error(err) {
      let a = JSON.parse(err.status);
      if (err.status === 401) {
        localStorage.clear();
        this.router.navigate(['/login']);
      } else if (err.status === 504) {
          return err.message;
      } else if (err.status === 400) {
          return err.message;
      } else if (err.status === 404) {
          return err.message
      }else if (err.status === 500) {
          return err.message;
      } else {
        
      }
    }

    getInfo() {
        return this.info;
    }

    setInfo(value) {
        this.info = value;
    }

    swipe(direction)
    {
        console.log(direction);
        if(direction==='right')
        {
          document.getElementById("mySidenav").style.width = "250px";
        }
        if(direction==='left')
        {
          document.getElementById("mySidenav").style.width = "0px";
        }
    }
    logOut()
    {
        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");
        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        let options = new RequestOptions({headers: this.headers});
        this.http.post(this.API_URL+this.BASE_URL+'auth/logout',options).subscribe(data=>
        {
          localStorage.clear();
          this.router.navigate(['/login']);
        },error=>{
        })
    }
}
