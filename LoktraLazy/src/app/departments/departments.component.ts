import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { DataStorageService } from '../services/data-storage.service';

@Component({
  	selector: 'app-departments',
  	templateUrl: './departments.component.html',
  	styleUrls: ['./departments.component.css'],
    providers:[DataStorageService]
})
export class DepartmentsComponent implements OnInit {

	headers: Headers = new Headers();
  tree_data=[];
  loading=false;
  suffixUrl='settings/departments/tree';

  constructor(private ds: DataStorageService) { }

  ngOnInit() {
      this.loading=true;

  		this.headers.set("Content-Type","application/json; charset=utf-8");
      this.headers.set("dataType","json");
      this.headers.set('crossDomain','true');
      this.headers.set("Access-Control-Allow-Credentials","true");

      var token="JWT "+localStorage.getItem('jwtToken');
      this.headers.set("Authorization",token);

      let options = new RequestOptions({headers: this.headers, withCredentials: true});

 	  	let apiSuffix=this.suffixUrl;

      this.ds.Get(options,apiSuffix).subscribe(data=>{	
        	this.tree_data=data.json().tree;
          this.loading=false;
  		},error=>
  		{

  		});
  		  
        var getchildren = function(node:any){
          	//console.log();
        }
  	}

    getNodeid(id:any,name:any,event)
    {
        localStorage.setItem('deptId', id);
        localStorage.setItem('deptName', name);
        window.history.back();
    }

    backRegions()
    {
    	  window.history.back();
    }

    public getchildren(node:any)
    {
        //console.log('FEF');
        //console.log(node.id);
    }

}
