import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class AuthenticationService {
	
	API_URL: string = "https://loktra.loktra.com/";//global declaration for hostname
  	BASE_URL:string="api/v2/";

  	authData:any={};

  	constructor(private http:Http) { }

  	login(username: string, password: string) {
  			
        return this.http.post(this.API_URL+this.BASE_URL+'auth/login/', JSON.stringify({ login_id: username, password: password,source:'dashboard' }))
            .map((response: Response) => {
            	
            	return response; 
            	
                // login successful if there's a jwt token in the response
                //let user = response.json();
                //if (user && user.token) {
                //    // store user details and jwt token in local storage to keep user logged in between //page refreshes
                //    localStorage.setItem('currentUser', JSON.stringify(user));
               // }
        });
    }
}
