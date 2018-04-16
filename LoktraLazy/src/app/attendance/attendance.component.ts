import { Component, OnInit,ViewChild, EventEmitter, Output, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
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
  	selector: 'app-attendance',
  	templateUrl: './attendance.component.html',
  	styleUrls: ['./attendance.component.css'],
  	providers:[DataStorageService]
})
export class AttendanceComponent implements OnInit {
    @ViewChild('successErrorModal') successErrorModal: any;

	API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;
    geocode_api_key = environment.GoogleApiKey;
    headers: Headers = new Headers();
    suffixUrl="member/dashboard/attendance";//get suffix
	  firstLetter='';// CU first letter
    secondLetter='';// CU second letter
    agentName='';// CU name
    orgName='';// to show org name
    roles=[];// CU roles
    public daterange: any = {};// date range picker
    DaytoDisplay:any;//for date selector display
    regionName:string='';// region 
	  functionName:string='';// department
    currentDate:any='';//
  	loading=false;// for loader 
  	attendanceData=[];// to user end
  	attendanceStatusIds=[];// to compare status
    dataToGetLocations=[];// get area name from lat lng
    mangerRemrksForAttendance;//remarks from modal
    error='';//error display
	  remarksmemId='';
    remarksStatusId='';
    noData='';
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
       
        this.getData();//common function to show data
    }

  	ngOnInit() {

  		  this.loading=true;
        this.currentDate=new Date();
  		  var dateA;
        var convertToUTC;
        var utc;
        var dateFL=localStorage.getItem('dateFromLocal');
        if(dateFL)
        {
			      dateA=moment(dateFL).format("YYYY-MM-DD");
			      this.DaytoDisplay=dateA;
			      $('#mainDate').attr('data-mainDate',dateA); 
			      convertToUTC=new Date();
			      convertToUTC.setHours(0,0,0,0);
			      utc=dateFL;
        }
        if(!dateFL)
        {
			      dateA=moment(new Date()).format("YYYY-MM-DD");
			      $('#mainDate').attr('data-mainDate',dateA);
			      convertToUTC=new Date();
			      convertToUTC.setHours(0,0,0,0);
			      utc=new Date(convertToUTC).toISOString();
			      this.DaytoDisplay=dateA;
        }

        var RegionId=localStorage.getItem('regionId');
      	var DeptId=localStorage.getItem('deptId');
        this.getData();
    
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
    		this.getData();//common function to show data
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
    		this.getData();//common function to show data
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
  	toggleDropDown($event)
  	{
    		$(event.target).next().toggle();
  	}
   
    changeLeaveStatus(id,saf)
    {

    }

    changeAttendanceStatus(statusId:any,memId:any)
    {
      this.loading=true;
      console.log(this.loading);
      let postParams:any={}

      postParams={
        "date": localStorage.getItem('dateFromLocal'),
        "data" : {
            "agent_id" : memId,
            "attendance_status" : statusId,
            "remarks" : ""
          }
      }

      this.http.put(this.API_URL+this.BASE_URL+"member/dashboard/attendance",postParams, { headers:this.headers })
        .map((response: Response) => {
        
          this.getData();
        }).subscribe(
          status => {},
          error =>{
           this.loading=false;
           //this.error=this.ds.error(response.json());
          },
          () => console.log()
          );
    }

    getRemarksForAttendance(remarks,id:any,status:any)
    {
      //this.successErrorModal.show('slow');
      $('#successErrorModal').show();
      this.mangerRemrksForAttendance=remarks;
      this.remarksmemId=id;
      this.remarksStatusId=status;
    }
    
    closeModal()
    {
      	//this.successErrorModal.hide();
      	$('#successErrorModal').hide();
    }

    commentsToApi()
    {
	    console.log(this.mangerRemrksForAttendance);
	    if(this.mangerRemrksForAttendance==='')
	    {
        	//this.successErrorModal.show();
        	$('#successErrorModal').show();
        	return false;
      	}
      	//this.successErrorModal.hide();
       	$('#successErrorModal').hide();
       	this.loading=true;
        let postParams:any={}

        postParams={
          "date": localStorage.getItem('dateFromLocal'),
          "data" : {
              "agent_id" : this.remarksmemId,
              "attendance_status" : this.remarksStatusId,
              "remarks" : this.mangerRemrksForAttendance
            }
        }

        this.http.put(this.API_URL+this.BASE_URL+"member/dashboard/attendance",postParams, { headers:this.headers })
          .map((response: Response) => {
          this.mangerRemrksForAttendance='';
          this.getData();
        }).subscribe(
          status => {},
          error =>{
          this.loading=false;
           //this.error=this.ds.error(response.json());
          },
          () => console.log()
          );
    }

    getData=function()
    {
        var dateA;
        var convertToUTC;
        var utc;
        var dateFL=localStorage.getItem('dateFromLocal');
        if(dateFL)
        {
            dateA=moment(dateFL).format("YYYY-MM-DD");
            this.DaytoDisplay=dateA;
            $('#mainDate').attr('data-mainDate',dateA); 
            convertToUTC=new Date();
            convertToUTC.setHours(0,0,0,0);
            utc=dateFL;
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

        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
       
        let prams = new URLSearchParams();
  
        prams.set('region_id',RegionId);
        prams.set('department_id',DeptId);
        prams.set('from_date',utc);
        prams.set('to_date',utc); 

        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");
      
        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: prams});
        let apiSuffix=this.suffixUrl;

        this.ds.Get(options,apiSuffix).subscribe(data=>{
          
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

          this.dataToGetLocations=data.json().attendance;
          this.attendanceStatusIds=data.json().attendance_types;  

          for(var j=0;j<this.dataToGetLocations.length;j++)
          {
            if((this.dataToGetLocations[j].shift_off_latitude!='')&&(this.dataToGetLocations[j].shift_off_longitude!=''))
            { 
                setTimeout(this.pushAddress(this.dataToGetLocations[j].shift_off_latitude,this.dataToGetLocations[j].shift_off_longitude,j,this.dataToGetLocations[j].shift_on_latitude,this.dataToGetLocations[j].shift_on_longitude), 150);  
            }
          }
          this.displayWithAddress(); 

        },error=>{
          this.error=this.ds.error(error.json());
        });
    }

    displayWithAddress=function()
    {
        let vm = this;
        setTimeout(function(){
          vm.loading=false;
           vm.attendanceData =vm.dataToGetLocations;
           if(vm.attendanceData.length===0)
           {
             vm.noData=true;
           }
        },50*vm.dataToGetLocations.length*1.5);  
    }
    
    pushAddress = function(laat:any,lnng:any,j:any,laanOn:any,lnngOn:any)
    {     
        if(((laat!=null)&&(lnng!=null))&&((laat!='')&&(lnng!='')))
        { 
          /*this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key='+this.geocode_api_key+'&latlng='+laat+','+lnng).subscribe(data=>*/
          this.http.get('https://nominatim.openstreetmap.org/reverse?format=json&lat='+laat+'&lon='+lnng+'&addressdetails=1').subscribe(data=> 
          {
              //this.dataToGetLocations[j].shiftOffArea=data.json().results[1].formatted_address;
              /*if(data.json().address.suburb)
              {/state_district
                  this.dataToGetLocations[j].shiftOffArea=data.json().address.suburb;
              }
              else
              {
                  this.dataToGetLocations[j].shiftOffArea=data.json().address.suburb;
              }*/

              var split=data.json().display_name.split(', ')
              this.dataToGetLocations[j].shiftOffArea=split[0]+", "+split[1];
          },error=>{

          });
        }
        if(((laat===null)&&(lnng===null))&&((laat==='')&&(lnng==='')))
        {
          this.dataToGetLocations[j].shiftOffArea='';
        }

        if(((laanOn!=null)&&(lnngOn!=null))&&((laanOn!='')&&(lnngOn!='')))
        {  
          this.http.get('https://nominatim.openstreetmap.org/reverse?format=json&lat='+laanOn+'&lon='+lnngOn+'&addressdetails=1').subscribe(data=>
          {
              //this.dataToGetLocations[j].shiftOnArea=data.json().address.suburb;
              //this.dataToGetLocations[j].shiftOnArea=data.json().results[1].formatted_address;
              var split=data.json().display_name.split(', ')
              this.dataToGetLocations[j].shiftOnArea=split[0]+", "+split[1];

          },error=>{

          });
        }  
        if(((laanOn===null)&&(lnngOn===null))&&((laanOn==='')&&(lnngOn==='')))
        {
          this.dataToGetLocations[j].shiftOnArea='';
        }
    }
}

