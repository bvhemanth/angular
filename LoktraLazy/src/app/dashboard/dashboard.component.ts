import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../environments/environment';
import { DataStorageService } from '../services/data-storage.service';
import { Daterangepicker } from 'ng2-daterangepicker';

declare var angular: any;
declare var moment:any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers:[DataStorageService]
})

export class DashboardComponent implements OnInit {

	currentUser;
	API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;

  	$index:any;
  	headers: Headers = new Headers();

    $ppc:any;
    percent:any;
    deg:any;
    public daterange: any = {};
   	DaytoDisplay:any;

    //author data
	agentName:string='';
	orgName:string='';
	//roles:string='';
	firstLetter:string='';
	secondLetter:string='';

	//dash board data

	regionName:string='';
	functionName:string='';
	per:any=50;

	//graph data
	onLine:any='';
	offLine:any='';
	inActive:any;
	onLineNumber:any='';
	offLineNumber:any='';
	inActiveNumber:any='';

	pending:any='';
	successfull:any='';
	failed:any='';
	pendingNumber:any='';
	successfullNumber:any='';
	failedNumber:any='';

	agentTotal:string='';
	agentsUsage:any="";

	taskTotal:any='';
	taskAVG:any='';

	custTotal:any='40';
	custAdded:any='40';

	Date:any='';
	params:any={};
	roles:any=[];

	rating:any=4;	
	loading = false;

	//modal
	taskDesc='';
	custAutoComplete
	customersData=[];
	showCustomerList:any;

	agentAutoComplete
	agentsData=[];
	showAgentList:any;

	allAgentsData=[];

	constructor(private http:Http, private router: Router,private ds: DataStorageService) { }

	public options: any = {
        locale: { format: 'YYYY-MM-DD' },
        alwaysShowCalendars: false,
        singleDatePicker: true,
        maxDate: new Date()
    };

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
    }

    public selectedDate(value: any) {
        this.loading=true;

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

		var RegionId=localStorage.getItem('regionId');
      	var DeptId=localStorage.getItem('deptId');
      	var DeptName=localStorage.getItem('deptName');

      	let dashboard_data = new URLSearchParams();
      	location.reload();

      	if((!RegionId)&&(!DeptId))
      	{    
      	    dashboard_data.set('department_id','');
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE');     
        } 
	    if((RegionId)&&(DeptId))
	    {
	    	dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 

	    }

	    if((RegionId)&&(!DeptId))
	    {
	        dashboard_data.set('department_id','');
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }

	    if((!RegionId)&&(DeptId))
	    {
	        dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    } 

	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: dashboard_data});

  		this.http.get(this.API_URL+this.BASE_URL+'mis/summary/agents',options).subscribe(data=>
	      	{
		       	this.agentName=data.json().current_user.name;
		       	let split=this.agentName.split(' ');
		       	this.firstLetter=split[0][0];
		       	this.secondLetter=split[1][0];
		       	this.orgName=data.json().organization_details.organization_name;
		       	
		       	this.roles = data.json().current_user.roles;

		       	this.functionName=data.json().navigation_details.default_path.department_path.name;
      			this.regionName=data.json().navigation_details.default_path.region_path.name;

		        let Atotal=data.json().statistics.agent.TOTAL;
		        this.agentTotal=data.json().statistics.agent.TOTAL;

		        this.inActive=(data.json().statistics.agent.INACTIVE/Atotal)*100;
		        this.inActiveNumber=data.json().statistics.agent.INACTIVE;

		        this.onLine=(data.json().statistics.agent.ONLINE/Atotal)*100;
		        this.onLineNumber=data.json().statistics.agent.ONLINE;

		        this.offLine=(data.json().statistics.agent.OFFLINE/Atotal)*100;
		        this.offLineNumber=data.json().statistics.agent.OFFLINE;

		        this.agentsUsage=Math.floor(((data.json().statistics.agent.ONLINE+data.json().statistics.agent.OFFLINE)/Atotal)*100);

				let Ttotal=data.json().statistics.task.TOTAL;
				this.taskTotal=data.json().statistics.task.TOTAL;

				this.pending=(data.json().statistics.task.PENDING/Ttotal)*100;
				this.pendingNumber=data.json().statistics.task.PENDING;
				
				this.successfull=(data.json().statistics.task.SUCCESS/Ttotal)*100;
				this.successfullNumber=data.json().statistics.task.SUCCESS;

				this.failed=(data.json().statistics.task.FAILED/Ttotal)*100;
				this.failedNumber=data.json().statistics.task.FAILED;

				if(Ttotal!=0)
				this.taskAVG=Math.floor(((data.json().statistics.task.SUCCESS)/Ttotal)*100);

				var prog1 = document.querySelector("#agents1"); 
				prog1.setAttribute('data-percent',this.onLine);

				this.$ppc = $('.progress-pie-chart');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill').css('transform','rotate('+ this.deg +'deg)');

				var prog2 = document.querySelector("#agents2"); 
				prog2.setAttribute('data-percent',this.offLine);

				this.$ppc = $('.progress-pie-chart1');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill1').css('transform','rotate('+ this.deg +'deg)');

		        var prog3 = document.querySelector("#agents3"); 
				prog3.setAttribute('data-percent',this.inActive);
		       
		       	this.$ppc = $('.progress-pie-chart2');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill2').css('transform','rotate('+ this.deg +'deg)');

				//end of agent card 

				var progT3 = document.querySelector("#tasks3"); 
				progT3.setAttribute('data-percent',this.pending);
				var progT1 = document.querySelector("#tasks1"); 
				progT1.setAttribute('data-percent',this.successfull);
				var progT2 = document.querySelector("#tasks2"); 
				progT2.setAttribute('data-percent',this.failed);
			       
			       	this.$ppc = $('.progress-pie-chart3');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill3').css('transform','rotate('+ this.deg +'deg)');

					this.$ppc = $('.progress-pie-chart4');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill4').css('transform','rotate('+ this.deg +'deg)');

					this.$ppc = $('.progress-pie-chart5');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill5').css('transform','rotate('+ this.deg +'deg)');

					this.loading=false;

	      	}, error=>{
		        var display=error.json();
		        this.loading=false;
      	});
        
    }

  	ngOnInit() {
  		this.loading=true;
  		this.DaytoDisplay='Today'
  		this.$index=4;
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

		var RegionId=localStorage.getItem('regionId');
      	var DeptId=localStorage.getItem('deptId');
      	var DeptName=localStorage.getItem('deptName');


      	let dashboard_data = new URLSearchParams();

      	if((!RegionId)&&(!DeptId))
      	{    
      	    dashboard_data.set('department_id','');
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE');     
        } 
	    if((RegionId)&&(DeptId))
	    {
	    	dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }

	    if((RegionId)&&(!DeptId))
	    {
	        dashboard_data.set('department_id','');
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }

	    if((!RegionId)&&(DeptId))
	    {
	        dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }  

	    this.headers.set("dataType","json");
	    this.headers.set('crossDomain','true');
      	this.headers.set("Access-Control-Allow-Credentials","true");
      
	    var token="JWT "+localStorage.getItem('jwtToken');
	    this.headers.set("Authorization",token);

	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: dashboard_data});

  		this.http.get(this.API_URL+this.BASE_URL+'mis/summary/agents',options).subscribe(data=>
	      	{
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

      			localStorage.setItem('deptId', data.json().navigation_details.default_path.department_path.id);
      			localStorage.setItem('regionId', data.json().navigation_details.default_path.region_path.id);
      			
		        let Atotal=data.json().statistics.agent.TOTAL;
		        this.agentTotal=data.json().statistics.agent.TOTAL;

		        this.inActive=(data.json().statistics.agent.INACTIVE/Atotal)*100;
		        this.inActiveNumber=data.json().statistics.agent.INACTIVE;

		        this.onLine=(data.json().statistics.agent.ONLINE/Atotal)*100;
		        this.onLineNumber=data.json().statistics.agent.ONLINE;

		        this.offLine=(data.json().statistics.agent.OFFLINE/Atotal)*100;
		        this.offLineNumber=data.json().statistics.agent.OFFLINE;

		        this.agentsUsage=Math.floor(((data.json().statistics.agent.ONLINE+data.json().statistics.agent.OFFLINE)/Atotal)*100);

				let Ttotal=data.json().statistics.task.TOTAL;
				this.taskTotal=data.json().statistics.task.TOTAL;

				this.pending=(data.json().statistics.task.PENDING/Ttotal)*100;
				this.pendingNumber=data.json().statistics.task.PENDING;
				
				this.successfull=(data.json().statistics.task.SUCCESS/Ttotal)*100;
				this.successfullNumber=data.json().statistics.task.SUCCESS;

				this.failed=(data.json().statistics.task.FAILED/Ttotal)*100;
				this.failedNumber=data.json().statistics.task.FAILED;

				if(Ttotal!=0)
				this.taskAVG=Math.floor(((data.json().statistics.task.SUCCESS)/Ttotal)*100);

				this.deg=0;
				this.percent=0;
				this.$ppc=0;

				var prog1 = document.querySelector("#agents1"); 
				prog1.setAttribute('data-percent',this.onLine);

				this.$ppc = $('.progress-pie-chart');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if(isNaN(this.percent))
				{
					this.percent=0;
				}
				if(isNaN(this.deg))
				{
					this.deg=0;
				}

				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill').css('transform','rotate('+ this.deg +'deg)');

				this.deg=0;

				var prog2 = document.querySelector("#agents2"); 
				prog2.setAttribute('data-percent',this.offLine);

				this.$ppc = $('.progress-pie-chart1');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;

				if(isNaN(this.percent))
				{
					this.percent=0;
				}
				if(isNaN(this.deg))
				{
					this.deg=0;
				}
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill1').css('transform','rotate('+ this.deg +'deg)');

		        var prog3 = document.querySelector("#agents3"); 
				prog3.setAttribute('data-percent',this.inActive);
		       
		       	this.$ppc = $('.progress-pie-chart2');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;

				if(isNaN(this.percent))
				{
					this.percent=0;
				}
				if(isNaN(this.deg))
				{
					this.deg=0;
				}

				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill2').css('transform','rotate('+ this.deg +'deg)');

				//end of agent card 

				var progT3 = document.querySelector("#tasks3"); 
				progT3.setAttribute('data-percent',this.pending);
				var progT1 = document.querySelector("#tasks1"); 
				progT1.setAttribute('data-percent',this.successfull);
				var progT2 = document.querySelector("#tasks2"); 
				progT2.setAttribute('data-percent',this.failed);
			       
			       	this.$ppc = $('.progress-pie-chart3');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					
					if(isNaN(this.percent))
					{
						this.percent=0;
					}
					if(isNaN(this.deg))
					{
						this.deg=0;
					}

					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill3').css('transform','rotate('+ this.deg +'deg)');

					this.deg=0;

					this.$ppc = $('.progress-pie-chart4');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;

					if(isNaN(this.percent))
					{
						this.percent=0;
					}
					if(isNaN(this.deg))
					{
						this.deg=0;
					}
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill4').css('transform','rotate('+ this.deg +'deg)');

					this.deg=0;

					this.$ppc = $('.progress-pie-chart5');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;

					if(isNaN(this.percent))
					{
						this.percent=0;
					}
					if(isNaN(this.deg))
					{
						this.deg=0;
					}
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill5').css('transform','rotate('+ this.deg +'deg)');

					this.loading=false;

	      	}, error=>{
		        var display=error.json();
		        this.loading=false;
		        this.ds.error(error.json());
      	});

		var size = 4.4/5*100;
		$('#rating').css("width",size+"%");
  	}

  	openNav() {
    	document.getElementById("mySidenav").style.width = "250px";
	}

	closeNav() {
	    document.getElementById("mySidenav").style.width = "0";
	}

	getStars(rating) 
	{
    	var val = parseFloat(rating);
    	var size = val/5*100;
    	return size + '%';
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
	    location.reload();

	    var RegionId=localStorage.getItem('regionId');
      	var DeptId=localStorage.getItem('deptId');
      	var DeptName=localStorage.getItem('deptName');

      	let dashboard_data = new URLSearchParams();

      	if((!RegionId)&&(!DeptId))
      	{    
      	    dashboard_data.set('department_id','');
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE');     
        } 
	    if((RegionId)&&(DeptId))
	    {
	    	dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }

	    if((RegionId)&&(!DeptId))
	    {
	        dashboard_data.set('department_id','');
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }

	    if((!RegionId)&&(DeptId))
	    {
	        dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    } 

	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: dashboard_data});

  		this.http.get(this.API_URL+this.BASE_URL+'mis/summary/agents',options).subscribe(data=>
	    {
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

		        let Atotal=data.json().statistics.agent.TOTAL;
		        this.agentTotal=data.json().statistics.agent.TOTAL;

		        this.inActive=(data.json().statistics.agent.INACTIVE/Atotal)*100;
		        this.inActiveNumber=data.json().statistics.agent.INACTIVE;

		        this.onLine=(data.json().statistics.agent.ONLINE/Atotal)*100;
		        this.onLineNumber=data.json().statistics.agent.ONLINE;

		        this.offLine=(data.json().statistics.agent.OFFLINE/Atotal)*100;
		        this.offLineNumber=data.json().statistics.agent.OFFLINE;

		        this.agentsUsage=Math.floor(((data.json().statistics.agent.ONLINE+data.json().statistics.agent.OFFLINE)/Atotal)*100);

				let Ttotal=data.json().statistics.task.TOTAL;
				this.taskTotal=data.json().statistics.task.TOTAL;

				this.pending=(data.json().statistics.task.PENDING/Ttotal)*100;
				this.pendingNumber=data.json().statistics.task.PENDING;
				
				this.successfull=(data.json().statistics.task.SUCCESS/Ttotal)*100;
				this.successfullNumber=data.json().statistics.task.SUCCESS;

				this.failed=(data.json().statistics.task.FAILED/Ttotal)*100;
				this.failedNumber=data.json().statistics.task.FAILED;

				this.taskAVG=Math.floor(((data.json().statistics.task.SUCCESS)/Ttotal)*100);

				var prog1 = document.querySelector("#agents1"); 
				prog1.setAttribute('data-percent',this.onLine);

				this.$ppc = $('.progress-pie-chart');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill').css('transform','rotate('+ this.deg +'deg)');

				var prog2 = document.querySelector("#agents2"); 
				prog2.setAttribute('data-percent',this.offLine);

				this.$ppc = $('.progress-pie-chart1');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill1').css('transform','rotate('+ this.deg +'deg)');

		        var prog3 = document.querySelector("#agents3"); 
				prog3.setAttribute('data-percent',this.inActive);
		       
		       	this.$ppc = $('.progress-pie-chart2');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill2').css('transform','rotate('+ this.deg +'deg)');

				//end of agent card 

				var progT3 = document.querySelector("#tasks3"); 
				progT3.setAttribute('data-percent',this.pending);
				var progT1 = document.querySelector("#tasks1"); 
				progT1.setAttribute('data-percent',this.successfull);
				var progT2 = document.querySelector("#tasks2"); 
				progT2.setAttribute('data-percent',this.failed);

			       
			       	this.$ppc = $('.progress-pie-chart3');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill3').css('transform','rotate('+ this.deg +'deg)');


					this.$ppc = $('.progress-pie-chart4');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill4').css('transform','rotate('+ this.deg +'deg)');


					this.$ppc = $('.progress-pie-chart5');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill5').css('transform','rotate('+ this.deg +'deg)');

					this.loading=false;

	      	}, error=>{
		        var display=error.json();
		        this.loading=false;
      	});

	}	

	previous()
	{	
		this.loading=true;
  		var date_from_ip=$('#mainDate').data('maindate');
  		var dateA=moment(date_from_ip).subtract(1,'days').format("YYYY-MM-DD");
  		var currentDay=moment().format('YYYY-MM-DD');
		if(currentDay<dateA)
		{
			return false;
		}

  		$('#mainDate').data('maindate',dateA);
		
		this.daterange.start =moment(dateA).subtract(0, 'days');
      	this.daterange.end = moment(dateA).subtract(0, 'days');
      	this.daterange.label ='';
      	$("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
		$("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));
  			
		this.DaytoDisplay=dateA;
		var a=new Date(dateA);
		a.setHours(0,0,0,0);
		var utc=new Date(a).toISOString();

    	localStorage.setItem('dateFromLocal',utc);	
    	location.reload();

      	var RegionId=localStorage.getItem('regionId');
      	var DeptId=localStorage.getItem('deptId');
      	var DeptName=localStorage.getItem('deptName');

      	let dashboard_data = new URLSearchParams();

      	if((!RegionId)&&(!DeptId))
      	{    
      	    dashboard_data.set('department_id','');
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE');     
        } 
	    if((RegionId)&&(DeptId))
	    {
	    	dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 

	    }

	    if((RegionId)&&(!DeptId))
	    {
	        dashboard_data.set('department_id','');
			dashboard_data.set('region_id',RegionId);
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }

	    if((!RegionId)&&(DeptId))
	    {
	        dashboard_data.set('department_id',DeptId);
			dashboard_data.set('region_id','');
      		dashboard_data.set('date',utc);
      		dashboard_data.set('search_string','');
      		dashboard_data.set('type','agents');
      		dashboard_data.set('sort_by','last_activity_at');	
      		dashboard_data.set('order','ASC');
      		dashboard_data.set('activation_status','');
      		dashboard_data.set('page_number','1');
      		dashboard_data.set('per_page','20');
      		dashboard_data.set('status','ONLINE,OFFLINE,INACTIVE'); 
	    }  

	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: dashboard_data});

  		this.http.get(this.API_URL+this.BASE_URL+'mis/summary/agents',options).subscribe(data=>
	      	{
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

		        let Atotal=data.json().statistics.agent.TOTAL;
		        this.agentTotal=data.json().statistics.agent.TOTAL;

		        this.inActive=(data.json().statistics.agent.INACTIVE/Atotal)*100;
		        this.inActiveNumber=data.json().statistics.agent.INACTIVE;

		        this.onLine=(data.json().statistics.agent.ONLINE/Atotal)*100;
		        this.onLineNumber=data.json().statistics.agent.ONLINE;

		        this.offLine=(data.json().statistics.agent.OFFLINE/Atotal)*100;
		        this.offLineNumber=data.json().statistics.agent.OFFLINE;

		        this.agentsUsage=Math.floor(((data.json().statistics.agent.ONLINE+data.json().statistics.agent.OFFLINE)/Atotal)*100);

				let Ttotal=data.json().statistics.task.TOTAL;
				this.taskTotal=data.json().statistics.task.TOTAL;

				this.pending=(data.json().statistics.task.PENDING/Ttotal)*100;
				this.pendingNumber=data.json().statistics.task.PENDING;
				
				this.successfull=(data.json().statistics.task.SUCCESS/Ttotal)*100;
				this.successfullNumber=data.json().statistics.task.SUCCESS;

				this.failed=(data.json().statistics.task.FAILED/Ttotal)*100;
				this.failedNumber=data.json().statistics.task.FAILED;

				this.taskAVG=Math.floor(((data.json().statistics.task.SUCCESS)/Ttotal)*100);

				var prog1 = document.querySelector("#agents1"); 
				prog1.setAttribute('data-percent',this.onLine);

				this.$ppc = $('.progress-pie-chart');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill').css('transform','rotate('+ this.deg +'deg)');

				var prog2 = document.querySelector("#agents2"); 
				prog2.setAttribute('data-percent',this.offLine);

				this.$ppc = $('.progress-pie-chart1');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill1').css('transform','rotate('+ this.deg +'deg)');

		        var prog3 = document.querySelector("#agents3"); 
				prog3.setAttribute('data-percent',this.inActive);
		       
		       	this.$ppc = $('.progress-pie-chart2');
				this.percent = parseInt(this.$ppc.data('percent'));
				this.deg = 360*this.percent/100;
				if (this.percent > 50) 
				{
					this.$ppc.addClass('gt-50');
				}
				$('.ppc-progress-fill2').css('transform','rotate('+ this.deg +'deg)');

				//end of agent card 

				var progT3 = document.querySelector("#tasks3"); 
				progT3.setAttribute('data-percent',this.pending);
				var progT1 = document.querySelector("#tasks1"); 
				progT1.setAttribute('data-percent',this.successfull);
				var progT2 = document.querySelector("#tasks2"); 
				progT2.setAttribute('data-percent',this.failed);

			       
			       	this.$ppc = $('.progress-pie-chart3');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill3').css('transform','rotate('+ this.deg +'deg)');

					this.$ppc = $('.progress-pie-chart4');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill4').css('transform','rotate('+ this.deg +'deg)');

					this.$ppc = $('.progress-pie-chart5');
					this.percent = parseInt(this.$ppc.data('percent'));
					this.deg = 360*this.percent/100;
					if (this.percent > 50) 
					{
						this.$ppc.addClass('gt-50');
					}
					$('.ppc-progress-fill5').css('transform','rotate('+ this.deg +'deg)');

					this.loading=false;

	      	}, error=>{
		        var display=error.json();
		        this.loading=false;
      	});
	}

	agentsNext()
	{
		$('#tasksCard').hide();
		$('#custCard').hide();
		$('#agentsCard').show();
		$('#tasksDetails').hide();
		$('#agentsDetails').show();
	}

	tasksNext()
	{
		$('#custCard').hide();
		$('#agentsCard').hide();
		$('#tasksDetails').show();
		$('#agentsDetails').hide();
		$('#tasksCard').show();
	}

	addTask()
	{
		
	}

	hidedate()
	{
		$('.modal-open').css('overflow','scroll');
	}	

	custmerNameAuto()
	{
		var RegionId=localStorage.getItem('regionId');
      	var DeptId=localStorage.getItem('deptId');
      	var DeptName=localStorage.getItem('deptName');
      		
      	let dashboard_data = new URLSearchParams();
   
   		dashboard_data.set('page_number','1');
   		dashboard_data.set('per_page','20');
   		dashboard_data.set('department_id','');
		dashboard_data.set('region_id','');
   		dashboard_data.set('query',this.custAutoComplete);     

	    let options = new RequestOptions({headers: this.headers, withCredentials: true, params: dashboard_data});

		this.http.get(this.API_URL+this.BASE_URL+'customers/search',options).subscribe(data=>
		{
				this.customersData=data.json().customers;
				this.showCustomerList = true;
		},error=>
		{

		})
	}

	addToCustomer($event)
	{	
		this.custAutoComplete=$event.target.innerText;
	}

	agentNameAuto()
	{

	}  

	swipe(action) {
       	this.ds.swipe(action);
   	}
}
