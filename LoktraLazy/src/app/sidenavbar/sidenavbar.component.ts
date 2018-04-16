import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../environments/environment';
import { DataStorageService } from '../services/data-storage.service';

@Component({
  	selector: 'app-sidenavbar',
  	templateUrl: './sidenavbar.component.html',
  	styleUrls: ['./sidenavbar.component.css'],
  	providers:[DataStorageService]
})

export class SidenavbarComponent implements OnInit {
	
	API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;

  	headers: Headers = new Headers();

  	constructor(private http:Http, private router: Router,private ds: DataStorageService) { }

  	ngOnInit() {
  	}

  	closeNav(router) {
  	    document.getElementById("mySidenav").style.width = "0";
  	    this.router.navigate(['/'+router]);
  	}
    
  	logOut()
    { 
        this.ds.logOut();
	  }

    
}
