import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Component, OnInit, ViewChild, EventEmitter, Output, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import {NgbModule,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { environment } from '../../environments/environment';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DataStorageService } from '../services/data-storage.service';
import { FormsModule } from '@angular/forms';

declare var moment:any;
declare var jquery:any;


@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css'],
  providers:[DataStorageService]
})
export class MembersComponent implements OnInit {
  	
    @ViewChild('successErrorModal') successErrorModal: any;

    public daterange: any = {};
  	
  	API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;
  	headers: Headers = new Headers();

  	//author data
  	agentName:string='';
    loginId;
  	orgName:string='org';
  	roles:any=[];
  	firstLetter:string='';
  	secondLetter:string='';

	  //dash board data
  	regionName:string='';
  	functionName:string='';
  	loading = false;
  	DaytoDisplay:any;

  	params:any={};

  	selectNames=['All','Agents','Managers','Admines'];

  	memberData = []; // array to store members data
    memberDataRole=[];
  	totalOnlineNumber:any=0;
    totalOfflineNumber:any=0;
    totalInactiveNumber:any=0;
    on:any=0;
  	off:any=0;
  	in:any=0;

  	currentUserId:any='';
     
    //local
    localRegId=localStorage.getItem("regionId");
    localRegName=localStorage.getItem("regionName");

    //modal
    taskDesc='';
    custAutoComplete
    customersData=[];
    showCustomerList:any;
    taskDateToDisplay='';

    agentAutoComplete
    agentsData=[];
    showAgentList:any;
    //showAgentList:any;

    allAgentsData=[];
    agentDataTofunction=[];

    taskAgentId="";
    customerAddressId="";
    customerId='';

    addtask=false;

    constructor(private http:Http, private router: Router,private ds: DataStorageService) { }

    public options: any = {
        locale: { format: 'YYYY-MM-DD' },
        alwaysShowCalendars: false,
        singleDatePicker: true,
        maxDate: new Date()
    };

    public selectedDate(value: any) {
        this.loading=true;
       	
        $("#selectRole").val('all');  
        $('#onlinenumber').removeClass('onlineButton_wb');
        $('#offlinenumber').removeClass('offlineButton_wb');
        $('#inactivenumber').removeClass('inactiveButton_wb');
        $('#onlinenumber').addClass('onlineButton');
        $('#offlinenumber').addClass('offlineButton');
        $('#inactivenumber').addClass('inactiveButton');
        $('#onlinenumber').show();
        $('#offlinenumber').show();
        $('#inactivenumber').show();

        this.daterange.start = value.start;
        this.daterange.end = value.end;
        this.daterange.label = value.label;
        var dateA=moment(value.start).add(0,'days').format("YYYY-MM-DD");
  		  
        $('#mainDate').data('maindate',dateA);
  		
  		  this.daterange.start =moment(dateA).add(0, 'days');
        this.daterange.end = moment(dateA).add(0, 'days');
        this.daterange.label ='';

        $("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
  		  $("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));

        var currentDay=moment().format('YYYY-MM-DD');
  		  this.DaytoDisplay=dateA;
  		  var a=new Date(dateA);
  		  a.setHours(0,0,0,0);
  		  var utc=new Date(a).toISOString();//Date.UTC(2012, 02, 30);

        localStorage.setItem('dateFromLocal',utc);

  		  //this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:''}

          var RegionId=localStorage.getItem('regionId');
          var DeptId=localStorage.getItem('deptId');
          var DeptName=localStorage.getItem('deptName');

          if((!RegionId)&&(!DeptId))
          {
              this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:''}        
          } 
          if((RegionId)&&(DeptId))
          {
              this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:DeptId,region_id:RegionId} 
          }

          if((RegionId)&&(!DeptId))
          {
              this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:RegionId}
          }

          if((!RegionId)&&(DeptId))
          {
              this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:DeptId,region_id:''}
          }

       	this.headers.set("Content-Type","application/json; charset=utf-8");
  	    this.headers.set("dataType","json");
  	    this.headers.set('crossDomain','true');
  	    this.headers.set('method','GET');
  	    this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

  	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

  	    this.http.get(this.API_URL+this.BASE_URL+'home',options).subscribe(data=>
  	    {		
  	    	  this.on=0;
  	      	this.off=0;
  	      	this.in=0;

  	    	  //this.memberData=data.json().members;
            var sorting;
            sorting=data.json().members;
            if(sorting.length!=null)
            {
                sorting.sort((a,b)=> a.name.localeCompare(b.name))
                this.memberData=sorting;
            }

  	    	  for(var i:any=0;i<this.memberData.length;i++)
  	      	{	
    	      		if(this.memberData[i].status==="ONLINE")
    	      		{	
                    this.on++;
    	      			  this.totalOnlineNumber=this.on;
    	      		}
    	      		if(this.memberData[i].status==="OFFLINE")
    	      		{
    	      			  this.off++;
    	      			  this.totalOfflineNumber=this.off;
          			}
          			if(this.memberData[i].status==="INACTIVE")
          			{
          				  this.in++;
          				  this.totalInactiveNumber=this.in;
          			}
        		}
        		if((this.off===0)||(this.off===''))
        		{
        			  this.totalOfflineNumber=0;
        		}     		
  	    	  this.loading=false;
  	    },error=>{
            if(error.json().status===401)
            {
                this.router.navigate(['/login']);
            }
  	    	  console.log(error);
	      });
    }

    public optionsTask:any={
      locale: { format: 'YYYY-MM-DD hh:mm a' },
        alwaysShowCalendars: false,
        singleDatePicker: true,
        minDate: new Date(),
        timePicker: true,
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        opens: "right",
        //datePicker: false,
        // eventHandlers : {
        //    'apply.daterangepicker' : function(start, end, label) {  
        //        console.log(start);          
        //    }
        //}
    }
    public selectedTaskDate(value:any)
    {
      console.log(value);
      this.daterange.start = value.start;
      this.daterange.end = value.end;
      this.daterange.label = value.label;
      this.taskDateToDisplay=moment(value.end._d).format("YYYY-MM-DD hh:mm a");
      console.log(this.taskDateToDisplay);
    }

  	ngOnInit() {

  		  this.loading=true;
  		  this.DaytoDisplay='Today';
        //console.log(this.successErrorModal);

  		  //$('#mainDate').attr('data-mainDate','');
        var dateA;
        var a;
        var utc;
        var dateFL=localStorage.getItem('dateFromLocal');
        if(dateFL)
        {
            dateA=moment(dateFL).format("YYYY-MM-DD");
            this.DaytoDisplay=dateA;
            $('#mainDate').attr('data-mainDate',dateA); 
            a=new Date();
            a.setHours(0,0,0,0);
            utc=dateFL;
        }
        if(!dateFL)
        {
            dateA=moment(new Date()).format("YYYY-MM-DD");
  		      $('#mainDate').attr('data-mainDate',dateA);
            a=new Date();
            a.setHours(0,0,0,0);
            utc=new Date(a).toISOString();
        }
		     
        this.taskDateToDisplay=moment(new Date()).format("YYYY-MM-DD hh:mm a"); 
        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');

        if((!RegionId)&&(!DeptId))
        {
            this.params={id:'',date:utc,department_id:'',region_id:''}        
        } 
        if((RegionId)&&(DeptId))
        {
            this.params={id:'',date:utc,department_id:DeptId,region_id:RegionId} 
        }

        if((RegionId)&&(!DeptId))
        {
            this.params={id:'',date:utc,department_id:'',region_id:RegionId}
        }

        if((!RegionId)&&(DeptId))
        {
            this.params={id:'',date:utc,department_id:DeptId,region_id:''}
        }

        this.headers.set("Content-Type","application/json; charset=utf-8");
  	    this.headers.set("dataType","json");
  	    this.headers.set('crossDomain','true');
  	    this.headers.set('method','GET');
  	    this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

  	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

        this.http.get(this.API_URL+this.BASE_URL+'home',options).subscribe(data=>
        {	
        		this.on=0;
        		this.off=0;
        		this.in=0;
            var sorting;
            sorting=data.json().members;
            this.memberDataRole=data.json().members;

            var cloneData=data.json().members;

            //if(cloneData[i].user_roles[0].roles.indexOf('agent')>-1)
            //{
                for(var j=0;j<cloneData.length;j++)
                {
                    if(cloneData[j].user_roles[0].roles.indexOf('agent')>-1)
                    {
                        this.agentDataTofunction.push(cloneData[j]);
                    }
                }
                
                //this.memberData=selectedOptionArray;
            //}  
            
            if(sorting.length!=null)
            {
              sorting.sort((a,b)=> a.name.localeCompare(b.name))
              this.memberData=sorting;
       		  }
       	  	this.agentName=data.json().current_user.name;
  		      let split=this.agentName.split(' ');
            if(split.length>=2)
            {
              this.firstLetter=split[0][0];
              this.secondLetter=split[1][0];
            }
            if(split.length==1)
            {
              this.firstLetter=split[0][0];
            }
    		    this.orgName=data.json().organization_details.organization_name;

  	      	this.roles = data.json().current_user.roles.join('|');

            this.loginId=data.json().current_user.id;

        		this.functionName=data.json().navigation_details.default_path.department_path.name;
        		this.regionName=data.json().navigation_details.default_path.region_path.name;
        		
            if(this.localRegName)
            {
                this.regionName=this.localRegName;
            }
            else
            {
              this.regionName=data.json().navigation_details.default_path.region_path.name;
            }

            localStorage.setItem('regionId', data.json().navigation_details.default_path.region_path.id);
            localStorage.setItem('regionName', data.json().navigation_details.default_path.region_path.name);

            localStorage.setItem('deptId', data.json().navigation_details.default_path.department_path.id);
            localStorage.setItem('deptName', data.json().navigation_details.default_path.department_path.name);

        		this.currentUserId=data.json().current_user.id;
        		for(var i:any=0;i<this.memberData.length;i++)
        		{	
          			if(this.memberData[i].status==="ONLINE")
          			{	this.on++;
          				this.totalOnlineNumber=this.on;
          			}
         			  if(this.memberData[i].status==="OFFLINE")
          			{
          				this.off++;
          				this.totalOfflineNumber=this.off;
          			}
          			if(this.memberData[i].status==="INACTIVE")
          			{
          				this.in++;
          				this.totalInactiveNumber=this.in;
          			}
        		}
        		if((this.off===0)||(this.off===''))
        		{
        			  this.totalOfflineNumber=0;
        		}
        		this.loading=false;
       	}, error=>{
  	        var display=error.json();
  	        console.log(display);
  	        this.loading=false;
     		});
	  }

    offlinenumber(event)
    {
        var dataId=$(event.target).attr('class');//$(event.target).attr("data-id");
   
        if(dataId=='offlineButton')
        {
            $('.offline').hide('slow');
            $(event.target).removeClass('offlineButton');
            $(event.target).addClass('offlineButton_wb');
            $(event.target).attr("data-id","offlinenumbershow");
        }
        if(dataId=='offlineButton_wb')
        {
            $('.offline').show('slow');
            $(event.target).removeClass('offlineButton_wb');
            $(event.target).addClass('offlineButton');
            $(event.target).attr("data-id","offlinenumber");
        }
    }

    onlinenumber(event)
    {
        //var dataId=$(event.target).attr("data-id")
        var dataId=$(event.target).attr('class');

        if(dataId=='onlineButton')
        {
            $('.online').hide('slow');
            $(event.target).removeClass('onlineButton');
            $(event.target).addClass('onlineButton_wb');
            $(event.target).attr("data-id","onlinenumbershow");
        }
        if(dataId=='onlineButton_wb')
        {
            $('.online').show('slow');
            $(event.target).removeClass('onlineButton_wb');
            $(event.target).addClass('onlineButton');
            $(event.target).attr("data-id","onlinenumber");
        }
    }
    inactivenumber(event)
    {
        //var dataId=$(event.target).attr("data-id");

        var dataId=$(event.target).attr('class');

        if(dataId=='inactiveButton')
        {
            $('.inactive').hide('slow');
            $(event.target).removeClass('inactiveButton');
            $(event.target).addClass('inactiveButton_wb');
            $(event.target).attr("data-id","inactivenumbershow");
        }
        if(dataId=='inactiveButton_wb')
        {
            $('.inactive').show('slow');
            $(event.target).removeClass('inactiveButton_wb');
            $(event.target).addClass('inactiveButton');
            $(event.target).attr("data-id","inactivenumber");
        }
    }

  	openNav() {
    	  document.getElementById("mySidenav").style.width = "250px";
	  }

  	closeNav() {
  	    document.getElementById("mySidenav").style.width = "0";
  	}

  	next()
  	{
    		this.loading=true;

        $("#selectRole").val('all');  
        $('#onlinenumber').removeClass('onlineButton_wb');
        $('#offlinenumber').removeClass('offlineButton_wb');
        $('#inactivenumber').removeClass('inactiveButton_wb');
        $('#onlinenumber').addClass('onlineButton');
        $('#offlinenumber').addClass('offlineButton');
        $('#inactivenumber').addClass('inactiveButton');
        $('#onlinenumber').show();
        $('#offlinenumber').show();
        $('#inactivenumber').show();

    		var date_from_ip=$('#mainDate').data('maindate');
    		var dateA=moment(date_from_ip).add(1,'days').format("YYYY-MM-DD");
         var currentDay=moment().format('YYYY-MM-DD');
        
        if(currentDay<dateA)
        {   
            this.loading=false;
            return false;
        }
        
    		$('#mainDate').data('maindate',dateA);
    		
    		this.daterange.start =moment(dateA).add(0, 'days');
        this.daterange.end = moment(dateA).add(0, 'days');
        this.daterange.label ='';


        $("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
    		$("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));

    		this.DaytoDisplay=dateA;
        if(currentDay===dateA)
        {   
            this.DaytoDisplay='Today';
        }
    		var a=new Date(dateA);
    		a.setHours(0,0,0,0);
    		var utc=new Date(a).toISOString();//Date.UTC(2012, 02, 30);

        localStorage.setItem('dateFromLocal',utc);

        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');

        if((!RegionId)&&(!DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:''}        
        } 
        if((RegionId)&&(DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:DeptId,region_id:RegionId} 
        }

        if((RegionId)&&(!DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:RegionId}
        }

        if((!RegionId)&&(DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:DeptId,region_id:''}
        }

        this.headers.set("Content-Type","application/json; charset=utf-8");
  	    this.headers.set("dataType","json");
  	    this.headers.set('crossDomain','true');
  	    this.headers.set('method','GET');
  	    this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

  	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

  	    this.http.get(this.API_URL+this.BASE_URL+'home',options).subscribe(data=>
  	    {		
  	    	  this.on=0;
  	      	this.off=0;
  	      	this.in=0;

  	    	  //this.memberData=data.json().members;
  	    	  var sorting;
            sorting=data.json().members;

            this.memberDataRole=data.json().members;

            if(sorting.length!=null)
            {
                sorting.sort((a,b)=> a.name.localeCompare(b.name))
                this.memberData=sorting;
            }

            for(var i:any=0;i<this.memberData.length;i++)
  	      	{	
    	      		if(this.memberData[i].status==="ONLINE")
    	      		{	
                    this.on++;
    	      			  this.totalOnlineNumber=this.on;
    	      		}
    	      		if(this.memberData[i].status==="OFFLINE")
    	      		{
    	      			  this.off++;
    	      			  this.totalOfflineNumber=this.off;
          			}
          			if(this.memberData[i].status==="INACTIVE")
          			{
          				  this.in++;
          				  this.totalInactiveNumber=this.in;
          			}
        		}
        		if((this.off===0)||(this.off===''))
        		{
        			  this.totalOfflineNumber=0;
        		}     		
  	    	  this.loading=false;
  	    },error=>{
            this.loading=false;
  	    	  console.log(error);
  	    });
  	}

  	previous()
  	{	
    		this.loading=true;

        $("#selectRole").val('all');  
        $('#onlinenumber').removeClass('onlineButton_wb');
        $('#offlinenumber').removeClass('offlineButton_wb');
        $('#inactivenumber').removeClass('inactiveButton_wb');
        $('#onlinenumber').addClass('onlineButton');
        $('#offlinenumber').addClass('offlineButton');
        $('#inactivenumber').addClass('inactiveButton');
        $('#onlinenumber').show();
        $('#offlinenumber').show();
        $('#inactivenumber').show();

    		var date_from_ip=$('#mainDate').data('maindate');
    		var dateA=moment(date_from_ip).subtract(1,'days').format("YYYY-MM-DD");
    		
        var currentDay=moment().format('YYYY-MM-DD');
        if(currentDay<dateA)
        {
            this.loading=false; 
            return false;
        }

        $('#mainDate').data('maindate',dateA);
    		
    		this.daterange.start =moment(dateA).subtract(0, 'days');
        this.daterange.end = moment(dateA).subtract(0, 'days');
        this.daterange.label ='';
        $("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
  		  $("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));
  			
    		this.DaytoDisplay=dateA;

        if(currentDay===dateA)
        {   
            this.DaytoDisplay='Today';
        }

    		var a=new Date(dateA);
    		a.setHours(0,0,0,0);
    		var utc=new Date(a).toISOString();

        localStorage.setItem('dateFromLocal',utc);

        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');

        if((!RegionId)&&(!DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:''}        
        } 
        if((RegionId)&&(DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:DeptId,region_id:RegionId} 
        }

        if((RegionId)&&(!DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:'',region_id:RegionId}
        }

        if((!RegionId)&&(DeptId))
        {
            this.params={page_reload:'no',refresh:'no',id:this.currentUserId,date:utc,department_id:DeptId,region_id:''}
        }
                   
        this.headers.set("Content-Type","application/json; charset=utf-8");
  	    this.headers.set("dataType","json");
  	    this.headers.set('crossDomain','true');
  	    this.headers.set('method','GET');
  	    this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);
  	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

  	    this.http.get(this.API_URL+this.BASE_URL+'home',options).subscribe(data=>
  	    {	
  	    	  this.on=0;
  	    	  this.off=0;
  	    	  this.in=0;

    	    	//this.memberData=data.json().members;

            this.memberDataRole=data.json().members;
    	    	var sorting;
            sorting=data.json().members;
            if(sorting.length!=null)
            {
                sorting.sort((a,b)=> a.name.localeCompare(b.name))
                this.memberData=sorting;
            }

            for(var i:any=0;i<this.memberData.length;i++)
    	   		{	
      	   			if(this.memberData[i].status==="ONLINE")
      	   			{	
                    this.on++;
      	   				  this.totalOnlineNumber=this.on;
      	   			}
      	   			if(this.memberData[i].status==="OFFLINE")
      	   			{
             				this.off++;
            				this.totalOfflineNumber=this.off;
          			}
          			if(this.memberData[i].status==="INACTIVE")
          			{
          				  this.in++;
          				  this.totalInactiveNumber=this.in;
          			}
        		}
        		if((this.off===0)||(this.off===''))
        		{	      			
  	      		  this.totalOfflineNumber=0;
  	      	}
  	      	this.loading=false;
  	    },error=>{
            this.loading=false;
            this.ds.error(error.json());
  	    });
  	}

    
    sectedOption()
    {
        var x = $("#selectRole").val();
        $('.online').show();
        $('.offline').show();
        $('.inactive').show(); 

        if((x==='all')||(x==='manager')||(x==='admin'))
        {
            $('#onlinenumber').hide();
            $('#offlinenumber').hide();
            $('#inactivenumber').hide();
        }
        if(x==='agent')
        {   
            $('#onlinenumber').show();
            $('#offlinenumber').show();
            $('#inactivenumber').show();
            $('#onlinenumber').removeClass('onlineButton_wb');
            $('#offlinenumber').removeClass('offlineButton_wb');
            $('#inactivenumber').removeClass('inactiveButton_wb');
            $('#onlinenumber').addClass('onlineButton');
            $('#offlinenumber').addClass('offlineButton');
            $('#inactivenumber').addClass('inactiveButton');
        }
        var cloneData=this.memberDataRole;
        var selectedOptionArray=[]; 
        if(x!='all')
        {
            for(var i=0;i<cloneData.length;i++)
            {
                if(cloneData[i].user_roles[0].roles.indexOf(x)>-1)
                {
                    selectedOptionArray.push(cloneData[i]);
                }
            }
             var sorting;
            sorting=selectedOptionArray;
            if(sorting.length!=null)
            {
                sorting.sort((a,b)=> a.name.localeCompare(b.name))
                this.memberData=sorting;
            }

            //this.memberData=selectedOptionArray;
        }  

        if(x==='all')
        {   
            var sorting;
            sorting=this.memberDataRole;
            if(sorting.length!=null)
            {
                sorting.sort((a,b)=> a.name.localeCompare(b.name))
                this.memberData=sorting;
            }    
            
        }
        this.on=0;
        this.off=0;
        this.in=0;
        for(var j:any=0;j<this.memberData.length;j++)
        { 
            if(this.memberData[j].status==="ONLINE")
            {   this.on++;
                this.totalOnlineNumber=this.on;
            }
            if(this.memberData[j].status==="OFFLINE")
            {
                this.off++;
                this.totalOfflineNumber=this.off;
            }
            if(this.memberData[j].status==="INACTIVE")
            {
                this.in++;
                this.totalInactiveNumber=this.in;
            }
        }
        if((this.off===0)||(this.off===''))
        {
            this.totalOfflineNumber=0;
        }
    } 


    hidedate()
    {
      //$('.modal-open').css('overflow','scroll');
    } 

    custmerNameAuto()
    {
        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');

            
          let dashboard_data = new URLSearchParams();

        if((!RegionId)&&(!DeptId))
        {    
            dashboard_data.set('page_number','1');
            dashboard_data.set('per_page','20');
            dashboard_data.set('department_id','');
            dashboard_data.set('region_id','');
            dashboard_data.set('query',this.custAutoComplete);     
        } 
        if((RegionId)&&(DeptId))
        {
            dashboard_data.set('page_number','1');
            dashboard_data.set('per_page','20');
            dashboard_data.set('department_id','');
            dashboard_data.set('region_id','');
            dashboard_data.set('query',this.custAutoComplete); 
        }

        if((RegionId)&&(!DeptId))
        {
            dashboard_data.set('page_number','1');
            dashboard_data.set('per_page','20');
            dashboard_data.set('department_id','');
        dashboard_data.set('region_id','');
            dashboard_data.set('query',this.custAutoComplete);
        }

        if((!RegionId)&&(DeptId))
        {
            dashboard_data.set('page_number','1');
            dashboard_data.set('per_page','20');
            dashboard_data.set('department_id','');
        dashboard_data.set('region_id','');
            dashboard_data.set('query',this.custAutoComplete); 
        }  


        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");
        
        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: dashboard_data});

        this.http.get(this.API_URL+this.BASE_URL+'customers/search',options).subscribe(data=>
        {
            console.log(data.json());
            this.customersData=data.json().customers;
            this.showCustomerList = true;
        },error=>
        {
            this.ds.error(error.json());
        })
    }

    agentNameAuto($event)
    {
        var cloneData=this.agentDataTofunction;
        var selectedOptionArray=[];
        for(var i=0;i<cloneData.length;i++)
        {
            if(cloneData[i].name.toLowerCase().search(this.agentAutoComplete)>-1)
            {
                selectedOptionArray.push(cloneData[i]);
            }
        }
        this.showAgentList=true;
        
        this.allAgentsData=selectedOptionArray;
        console.log(this.allAgentsData);
    }

    addToCustomer($event,id)
    { 
        this.custAutoComplete=$event.target.innerText;
        this.customerAddressId=$event.target.id;
        console.log($event.target.innerText);
        this.customerId=id;
        this.showCustomerList=false;
        console.log(this.customerId)
    }

    addToAgent($event)
    {
        this.agentAutoComplete=$event.target.innerText;
        this.taskAgentId=$event.target.id;
        this.showAgentList=false;
    }

    doneTask()
    {
        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');
      
        let dashboard_data:any ={} //new URLSearchParams();
        
        var utc;

        var a=this.taskDateToDisplay;
        console.log(this.taskDesc);
        if((this.taskDesc==='')&&(this.customerId))
        {
          $('#addtask').show();
          return false;
        }
        else
        {
          //$('#addtask').modal('hide');
        } 

         utc=new Date(a).toISOString();
         console.log(utc);

        dashboard_data={
          agent_id:this.taskAgentId,
          created_by:this.loginId,
          customer_address_id:this.customerAddressId,
          customer_id:this.customerId,
          department_id:DeptId,
          due_date:utc,
          region_id:RegionId,
          title:this.taskDesc} 
  
         var headers = new Headers();
        headers.set("Content-Type","application/json; charset=utf-8");

        var token="JWT "+localStorage.getItem('jwtToken');
        headers.append("Authorization",token);
        var body = JSON.stringify(dashboard_data);
        
        headers.set("dataType","json");
        headers.set('crossDomain','true');
        headers.set("dataType","json");
        headers.append('crossDomain','true');
        headers.append("Access-Control-Allow-Credentials","true");
        
        let options = new RequestOptions({headers: headers, params: dashboard_data});

        console.log(this.headers);
        this.http.post(this.API_URL+this.BASE_URL+'tasks',body, { headers: headers })
        .map((response: Response) => {
          var result = response.json();
          return result;
        }).subscribe(
      
          status => console.log(status),
          error => console.log(error),
          () => console.log()
          );
       
    }

    addTask()
    {
      //this.addtask=true;
      //this.successErrorModal.show();
      $('successErrorModal').show();
    }
    closeTask()
    {
        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');
      
        let dashboard_data:any ={} //new URLSearchParams();
        
        var a:any=$('#taskDate').val();
       
        if((this.taskDesc==='')&&(this.customerId===''))
        {
            //this.successErrorModal.show();
            $('successErrorModal').show();
            return false;
        }

        if((this.taskDesc!='')&&(this.customerId!=''))
        {
            //this.successErrorModal.hide(); 
            $('successErrorModal').hide();
            var utc:string=new Date(a).toISOString();
            
            dashboard_data={
              agent_id:this.taskAgentId,
              created_by:this.loginId,
              customer_address_id:this.customerAddressId,
              customer_id:this.customerId,
              department_id:DeptId,
              due_date:utc,
              region_id:RegionId,
              title:this.taskDesc} 
  
            var headers = new Headers();
            headers.set("Content-Type","application/json; charset=utf-8");

            var token="JWT "+localStorage.getItem('jwtToken');
            headers.append("Authorization",token);
            var body = JSON.stringify(dashboard_data);
          
            headers.set("dataType","json");
            headers.set('crossDomain','true');
            headers.set("dataType","json");
            headers.append('crossDomain','true');
            headers.append("Access-Control-Allow-Credentials","true");
            
            let options = new RequestOptions({headers: headers, params: dashboard_data});

            this.http.post(this.API_URL+this.BASE_URL+'tasks',body, { headers: headers })
            .map((response: Response) => {
              var result = response.json();

                return result;
              }).subscribe(
          
              status => console.log(status),
              error => console.log(error),
              () => console.log()
              );
        } 
    }    
    openModal()
    {
        $('#successErrorModal').show();
    }
    closeModal()
    {
        $('#successErrorModal').hide();
    }
    swipe(action) {
        this.ds.swipe(action);
    }
}
