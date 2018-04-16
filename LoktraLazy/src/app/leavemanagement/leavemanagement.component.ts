import { Component, OnInit,ViewChild, EventEmitter, Output, ElementRef ,
Input} from '@angular/core';
import { Router } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import {NgbModule,NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { environment } from '../../environments/environment';
import { DataStorageService } from '../services/data-storage.service';

declare var moment:any;

@Component({
  	selector: 'app-leavemanagement',
  	templateUrl: './leavemanagement.component.html',
  	styleUrls: ['./leavemanagement.component.css'],
  	providers:[DataStorageService]
})
export class LeavemanagementComponent implements OnInit {
	 
    @ViewChild('successErrorModal') successErrorModal: any;

    @Input() closable = true;
  	@Input() visible: boolean;
  	@Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

	API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;
    headers: Headers = new Headers();
    suffixUrl="member/dashboard/leaves";

    firstLetter
    secondLetter
    agentName
    orgName
    roles=[];

    public daterange: any = {};
    DaytoDisplay:any;

    regionName:string='';
	functionName:string='';

  	leaveIds=[];
  	leaveReqStatusIds=[];

  	leavesData=[];
	pendingList=[];
    doneList=[];
    currentDate:any='';

	loading=false;
	search=false;
	searchResultsInLeaves=false;
	managerDecision='';
	mangerRemrks='';
    leaveIdfromBtn;
    error;
    noData='';	

    leavesSearch='';
    searchResults=[];
    inputValueId='';
    searchResultsLength=false;

  	constructor(private http:Http, private router: Router,private ds: DataStorageService) { }

  	public options: any = {
        locale: { format: 'YYYY-MM-DD' },
        alwaysShowCalendars: false,
        singleDatePicker: true,
        maxDate: new Date()
    };
    public selectedDate(value:any)
    {
        this.loading=true;
      	this.daterange.start = value.start;
  		this.daterange.end = value.end;
  		this.daterange.label = value.label;
  		this.DaytoDisplay=moment(value.start).add(0,'days').format("YYYY-MM-DD");
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
        
        var activebutton=$('.activeBtn').html();
        this.getData(activebutton);
    }

  	swipe(action) {
       	this.ds.swipe(action);
   	}

  	ngOnInit() {
        this.loading=true;
        this.currentDate=new Date();
        var activebutton=$('.activeBtn').html();
        this.getData(activebutton);  
  	}

   	openNav() {
    	document.getElementById("mySidenav").style.width = "250px";
	}

	close() {
    	this.visible = false;
    	this.visibleChange.emit(this.visible);
  	}

	next()
	{
		this.loading=true;
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
      	var activebutton=$('.activeBtn').html();
      	this.getData(activebutton);

	}    

	previous()
	{	
		this.loading=true;
      	var date_from_ip=$('#mainDate').data('maindate');
  		var dateA=moment(date_from_ip).subtract(1,'days').format("YYYY-MM-DD");
      	var currentDay=moment().format('YYYY-MM-DD');

     	if(currentDay<dateA)
     	{
          	this.loading=true;  
        	return false;
      	}

  		$('#mainDate').data('maindate',dateA);
		
		this.daterange.start =moment(dateA).subtract(0, 'days');
      	this.daterange.end = moment(dateA).subtract(0, 'days');
      	this.daterange.label ='';
      	$("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
		$("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));
  			
      	if(currentDay===dateA)
      	{   
          	this.DaytoDisplay='Today';
      	}
		this.DaytoDisplay=dateA;

      	var a=new Date(dateA);
      	a.setHours(0,0,0,0);
      	var utc=new Date(a).toISOString();//Date.UTC(2012, 02, 30);

      	localStorage.setItem('dateFromLocal',utc);

      	var activebutton=$('.activeBtn').html();
      	this.getData(activebutton);

	}	

	allReq($event)
	{	
    	this.loading=true;
    	$('#All').show();
    	//$('#Pending').hide();
    	//$('#Done').hide();
        this.loading=true;

        $('.activeBtn').removeClass('activeBtn');
        $(event.target).addClass('activeBtn');
        var activebutton=$('.activeBtn').html();
        this.getData(activebutton);
	}

	pendingReq($event)
	{	 
      	this.loading=true;

      	$('.activeBtn').removeClass('activeBtn');
      	$(event.target).addClass('activeBtn');
      	var activebutton=$('.activeBtn').html();
      	this.getData(activebutton);
 	} 

	doneReq($event)
	{	
		this.loading=true;
    	$('.activeBtn').removeClass('activeBtn');
    	$(event.target).addClass('activeBtn');
		//$('#All').hide();
		//$('#Pending').hide();
		//$('#Done').show();

    	this.loading=true;
       	var activebutton=$('.activeBtn').html();
        this.getData(activebutton);
	}
	
	toggleMoreInfo($event)
	{	
  		$(event.target).siblings().show();	
  		//$('#arrow').toggleClass('fa fa-chevron-down');
  		$(event.target).parent().parent().next().slideToggle();
  		$(event.target).children().toggleClass('fa-chevron-down');
      	$(event.target).children().toggleClass('fa-chevron-up');
	}

	toggleMoreInfoArrow($event)
	{
  		$(event.target).parent().parent().parent().next().toggle();
  		$(event.target).toggleClass('fa-chevron-up');
  		$(event.target).toggleClass('fa-chevron-down');
	}

	changeLeaveStatus(leaveId:any,statusId:any)
	{
      this.leaveIdfromBtn=leaveId;
      //this.successErrorModal.show();
      $('#successErrorModal').show();
      for(var i=0;i<this.leaveReqStatusIds.length;i++)
      {
        if(this.leaveReqStatusIds[i].status_id===statusId)
        {
            if((this.leaveReqStatusIds[i].status_id_value==='DENIED')||(this.leaveReqStatusIds[i].status_id_value==='APPROVED'))
            {
              this.managerDecision=statusId;
            }
        }

      }
	}

  	getData=function(activebutton)
  	{     
        this.noData="data";
        var dateA;
        var convertToUTC;
        var utc;
        var dateFL=localStorage.getItem('dateFromLocal');
        var currentDay=moment().format('YYYY-MM-DD');
        if(dateFL)
        {
            dateA=moment(dateFL).format("YYYY-MM-DD");
            this.DaytoDisplay=dateA;
            $('#mainDate').attr('data-mainDate',dateA); 
            convertToUTC=new Date();
            convertToUTC.setHours(0,0,0,0);
            utc=dateFL;
            if(currentDay===dateA)
            {   
                this.DaytoDisplay='Today';
            }
        }
        if(!dateFL)
        {
            dateA=moment(new Date()).format("YYYY-MM-DD");
            $('#mainDate').attr('data-mainDate',dateA);
            convertToUTC=new Date();
            convertToUTC.setHours(0,0,0,0);
            utc=new Date(convertToUTC).toISOString();
            this.DaytoDisplay='Today';
        }
        
        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");
        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');

        let params = new URLSearchParams();
  
        params.set('member_id','');  
        params.set('region_id',RegionId);
        params.set('department_id',DeptId);
        params.set('from_date','');
        if(this.inputValueId!='')
        {
            params.set('member_id',this.inputValueId);
        }
        params.set('to_date',utc);
        params.set('status',activebutton);   

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: params});

        let apiSuffix=this.suffixUrl;

        this.ds.Get(options,apiSuffix).subscribe(data=>{
  
          	this.leavesData=data.json().leaves;
          	if(this.leavesData.length===0)
          	{
            	this.noData='zero';
          	}
          	this.leaveReqStatusIds=data.json().leave_request_status;
          	this.leaveIds=data.json().leave_types; 

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
          	this.roles = data.json().current_user.roles;
          	this.functionName=data.json().navigation_details.default_path.department_path.name;
          	this.regionName=data.json().navigation_details.default_path.region_path.name;

          	this.loading=false;  
        },error=>{
          	this.error=this.ds.error(error.json());
        });
  	}

	statusToApi()
	{  
      	this.loading=true;     
      	var activebutton=$('.activeBtn').html();

      	if(this.managerDecision==='')
      	{
        	this.loading=false;
        	this.error='required*';
        	return false;
      	}

      	let postParams:any={}

      	postParams={
        	"leave_id":this.leaveIdfromBtn,
        	"manager_remarks":this.mangerRemrks,
        	"action_id":this.managerDecision
      	}

      	this.http.post(this.API_URL+this.BASE_URL+this.suffixUrl,postParams, { headers:this.headers })
        .map((response: Response) => {
          	this.getData(activebutton);
          	//this.successErrorModal.hide();
          	$('#successErrorModal').hide();
          	this.error='';
          	this.managerDecision='';
        }).subscribe(
          	status => {
          	},
          	error =>{
          		this.loading=false;
          		this.error=this.ds.error(error.json());
          	},
          	() => console.log()
          	);
	}

  	closeModal()
  	{ 
      	//this.successErrorModal.hide();
      	$('#successErrorModal').hide();	
      	this.loading=false;
      	this.managerDecision='';
  	}
  	
  	closeNav(router) {
  	    document.getElementById("mySidenav").style.width = "0";
  	    this.router.navigate(['/'+router]);
  	}
    
    closeNavbtn()
    {
    	document.getElementById("mySidenav").style.width = "0";
    }

  	logOut()
    { 
        this.ds.logOut();
	}

	Vue(value)
	{
  		$('#app').attr('data-state','close');
  		this.search=true;
  		//this.searchResultsInLeaves=true;
  	}

  	searchByContact()
  	{
  		let prams = new URLSearchParams();
        prams.set('input_string',this.leavesSearch);    

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: prams});

        let apiSuffix="members/autosuggest";
        this.searchResultsLength=true;
        this.ds.Get(options,apiSuffix).subscribe(data=>{
        	this.searchResults=data.json();
        	if(this.searchResults.length!=0)
        	{
        		this.searchResultsLength=false;
        	}
        	this.searchResultsInLeaves=true;
        },error=>{
        	this.ds.error(error.json());
        });
  	}

  	getIdFormSearchResults(id:any,name:any)
  	{
  		this.inputValueId=id;
  		this.leavesSearch=name;
  		this.searchResultsInLeaves=false;
  		this.loading=true;
  		var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var activebutton=$('.activeBtn').html();

  		let params = new URLSearchParams();
        params.set('department_id',DeptId);
        params.set('region_id',RegionId);
        params.set('from_date','');
        params.set('to_date','');
        params.set('member_id',id);
        params.set('status',activebutton);    

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: params});

        let apiSuffix="member/dashboard/leaves";

        this.ds.Get(options,apiSuffix).subscribe(data=>{
        	this.leavesData=data.json().leaves;
        	this.loading=false;	
          	if(this.leavesData.length===0)
          	{
            	this.noData='zero';
            	this.searchResultsInLeaves=false;
          	}
        },error=>{
        	this.ds.error(error.json());
        });

  	}
  	clearInput()
  	{
  		this.inputValueId='';
  		this.leavesSearch='';
  		this.searchResultsInLeaves=false;
  		this.search=false;
  		var activebutton=$('.activeBtn').html();
  		this.loading=true;
  		this.getData(activebutton);
  	}
}

