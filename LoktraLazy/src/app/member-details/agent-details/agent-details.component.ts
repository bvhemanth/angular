import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../environments/environment';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DataStorageService } from '../../services/data-storage.service';

declare var moment:any;
declare var google: any;

@Component({
  selector: 'app-agent-details',
  templateUrl: './agent-details.component.html',
  styleUrls: ['./agent-details.component.css'],
  providers: [DataStorageService]
})
export class AgentDetailsComponent implements OnInit {
    
    API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;
    geocode_api_key = environment.GoogleApiKey;

    INDIA = { lat: 20.3120868, lng: 74.7320638 };
    map: any;
    toggleDarkView: boolean = false;
    toggleTraffic: boolean = false;
    styledMapType: any;
    planeMapStyle: any;
    mapZoom = 4;
    gotLocationFromBrowser: boolean = false;

    latlngbounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow;
    geocoder = new google.maps.Geocoder;

    trafficLayer: any;

    public daterange: any = {};
    
    headers: Headers = new Headers();

    //author data
    agentName:string='';
    orgName:string='';
    roles:any=[];
    firstLetter:string='';
    secondLetter:string='';

    //dash board data
    regionName:string='';
    functionName:string='';

    loading = false;
    DaytoDisplay:any;

    agentId:any;
    deptId:any;
    regionId:any;
    params:any={};

    //to diplay agent details
    agentAvatar:any;
    agentStatus:any;
    agentMobile:any;

    // task details in member page 
    taskDetails=[];

    //travel log 
    travelLog=[];
    travalLogDisp=[];

    // particular agent details
    totalWorkingHours:any;
    lastActivity:any;
    agentShift:any;
    agentGps:any;
    batteryStatus:any;

    // to get address 
    lat:any;
    long:any;

    //store address from reverse geo code
    locations:any={};
    format_address:any=[];

    //particular task data from travel lag
    travelTask:any=[];

    travelTaskTitle:any;
    travelTaskcustName:any;
    travelTaskAttempts:any=[];

    hideme:any = {};

    //revisit modal
    revisitComment:any='';
    revisitTaskId:any='';
    ///end of revisit

    address_data;
    toggle=0;

    documentImage;

    public options: any = {
        locale: { format: 'YYYY-MM-DD' },
        alwaysShowCalendars: false,
        singleDatePicker: true,
        maxDate: new Date()
    };

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

        this.headers.set("Content-Type","application/json; charset=utf-8");
        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        $("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
        $("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));

        var currentDay=moment().format('YYYY-MM-DD');
        this.DaytoDisplay=dateA;
        var a=new Date(dateA);
        a.setHours(0,0,0,0);
        var utc=new Date(a).toISOString();//Date.UTC(2012, 02, 30);

        localStorage.setItem('dateFromLocal',utc);

        this.params={page_reload:'no',refresh:'no',date:utc,id:this.agentId,department_id:this.deptId,region_id:this.regionId}

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

        this.http.get(this.API_URL+this.BASE_URL+'members/details/'+this.agentId,options).subscribe(data=>
       {  
          var main_data=data.json().member_details;

          this.agentName=main_data.agent_profile.name;
          this.roles=main_data.agent_profile.name;
          this.agentMobile=main_data.agent_profile.phone;
          this.agentStatus=main_data.agent_profile.status.status;
          this.agentAvatar=main_data.agent_profile.avatar;

          //this.totalWorkingHours=main_data.agent_profile.status.total_working_hours;
          
          var d = Number(main_data.agent_profile.status.total_working_hours);
          var h:any = Math.floor(d / 3600);
          var m:any = Math.floor(d % 3600 / 60);
          var s:any = Math.floor(d % 3600 % 60);

          this.totalWorkingHours=h+" : "+m+" : "+s;  

          this.lastActivity=main_data.agent_profile.status.last_activity;
          this.agentShift=main_data.agent_profile.status.shift;
          this.agentGps=main_data.agent_profile.status.gps;
          this.batteryStatus=main_data.agent_profile.status.battery;

          var locClone=[];
          if(data.json().travel_log!=null)
          {
            var travel=[];
            travel=data.json().travel_log.travel_activity_list;
            this.travelLog=travel;
            locClone = this.travelLog;

            var locations_array=[];
            for(var i=0;i<travel.length;i++)
            {
                
              if(travel[i].activity_location!=null)
              { 
                this.pushAddress(travel[i].activity_location[0],travel[i].activity_location[1],i);  
              }
              if(travel[i].activity_location===null)
              {
                locations_array.push('');
              }
            }

            let vm = this;
            setTimeout(function(){
              vm.loading=false;
              vm.travalLogDisp=vm.travelLog;
            },200*travel.length);
          }
          if(data.json().travel_log===null)
          {
            this.loading=false;
          }
      }, error=>{
          console.log(error);
      });

      this.params={date:utc,id:this.agentId}
      let options1 = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

      this.http.get(this.API_URL+this.BASE_URL+'members/tasks/'+this.agentId,options1).subscribe(data=>
      {
        this.taskDetails=data.json().task_details;
      },error=>{

      });

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

    constructor(private http:Http, private router: Router,private ds: DataStorageService) { }
    
    

    ngOnInit() {
      var get=this.ds.getInfo();
    
      console.log(get);

      $('#mapComponentview').hide();
      this.loading=true;
      //var dateA=moment(new Date()).format("YYYY-MM-DD");
      //$('#mainDate').attr('data-mainDate',dateA);

      this.headers.set("Content-Type","application/json; charset=utf-8");
      this.headers.set("dataType","json");
      this.headers.set('crossDomain','true');
      this.headers.set("Access-Control-Allow-Credentials","true");

      var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

      this.DaytoDisplay='Today';
      this.agentId=localStorage.getItem("memDetTMT"); 
      this.deptId='8b69b9e4-928f-4edb-b19c-3214f93a7586';
      this.regionId='b61ea708-b6cb-49dd-a280-b1513442a2a6';

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

      this.params={page_reload:'no',refresh:'no',date:utc,id:this.agentId,department_id:this.deptId,region_id:this.regionId}

      let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

      this.http.get(this.API_URL+this.BASE_URL+'members/details/'+this.agentId,options).subscribe(data=>
        { 
          var main_data=data.json().member_details;

          this.agentName=main_data.agent_profile.name;
          this.roles=main_data.agent_profile.name;
          this.agentMobile=main_data.agent_profile.phone;
          this.agentStatus=main_data.agent_profile.status.status;
          this.agentAvatar=main_data.agent_profile.avatar;
          
          //var hours:any = Math.trunc(main_data.agent_profile.status.total_working_hours/60);
          //var minutes:any = main_data.agent_profile.status.total_working_hours % 60;
          //this.totalWorkingHours=hours+" : "+minutes;
          
          var d = Number(main_data.agent_profile.status.total_working_hours);
          var h:any = Math.floor(d / 3600);
          var m:any = Math.floor(d % 3600 / 60);
          var s:any = Math.floor(d % 3600 % 60);

          this.totalWorkingHours=h+"h "+m+"m "+s+"s ";
          
          this.lastActivity=main_data.agent_profile.status.last_activity;
          this.agentShift=main_data.agent_profile.status.shift;
          this.agentGps=main_data.agent_profile.status.gps;
          this.batteryStatus=main_data.agent_profile.status.battery;

          var locClone=[];

          var sellers = JSON.stringify(data.json().travel_log);
         

          if(!($.isEmptyObject(data.json().travel_log)))
          {
              var travel=[];
              travel=data.json().travel_log.travel_activity_list;
              this.travelLog=travel;
              locClone = this.travelLog;
              var locations_array=[];
            
              for(var i=0;i<travel.length;i++)
              {
                  
                if(travel[i].activity_location!=null)
                { 
                  this.pushAddress(travel[i].activity_location[0],travel[i].activity_location[1],i);  
                }
                if(travel[i].activity_location===null)
                {
                  locations_array.push('');
                }
              }

             let vm = this;
              setTimeout(function(){
                vm.loading=false;
                vm.travalLogDisp=vm.travelLog;
              },200*travel.length);
          }
          else
          {
            this.loading=false;
          }
          if(data.json().travel_log===null)
          {
            this.loading=false;
          }
          
      }, error=>{
          console.log(error);
      });
 
      this.params={date:utc,id:this.agentId}
      let options1 = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

      this.http.get(this.API_URL+this.BASE_URL+'members/tasks/'+this.agentId,options1).subscribe(data=>
      {
        this.taskDetails=data.json().task_details;

      },error=>{

      });

        /*this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: this.mapZoom,
          center: this.INDIA,
          disableDefaultUI: true,
          gestureHandling: 'greedy'

        });*/

    }


    pushAddress = function(laat:any,lnng:any,i:any)
    {
        this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key='+this.geocode_api_key+'&latlng='+laat+','+lnng).subscribe(data=>
        {
          this.format_address =data.json().results[1].formatted_address; 
          var addr=this.format_address;
          this.travelLog[i].address = addr;
          //locations_array.push(addr);
        },error=>{

        });
    }

    next(){
        this.loading=true;
        var date_from_ip=$('#mainDate').data('maindate');
        var dateA=moment(date_from_ip).add(1,'days').format("YYYY-MM-DD");
        $('#mainDate').data('maindate',dateA);
        
        this.daterange.start =moment(dateA).add(0, 'days');
        this.daterange.end = moment(dateA).add(0, 'days');
        this.daterange.label ='';

        $("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
        $("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));

        this.headers.set("Content-Type","application/json; charset=utf-8");
        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        var currentDay=moment().format('YYYY-MM-DD');
        if(currentDay<dateA)
        {
          return false;
        }
        this.DaytoDisplay=dateA;
        var a=new Date(dateA);
        a.setHours(0,0,0,0);

        var utc=new Date(a).toISOString();//Date.UTC(2012, 02, 30);

        localStorage.setItem('dateFromLocal',utc);

        this.params={page_reload:'no',refresh:'no',date:utc,id:this.agentId,department_id:this.deptId,region_id:this.regionId}

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

        this.http.get(this.API_URL+this.BASE_URL+'members/details/'+this.agentId,options).subscribe(data=>
        { 
          var main_data=data.json().member_details;

          this.agentName=main_data.agent_profile.name;
          this.roles=main_data.agent_profile.name;
          this.agentMobile=main_data.agent_profile.phone;
          this.agentStatus=main_data.agent_profile.status.status;
          this.agentAvatar=main_data.agent_profile.avatar;
          
          //this.totalWorkingHours=main_data.agent_profile.status.total_working_hours;
          
          var d = Number(main_data.agent_profile.status.total_working_hours);
          var h:any = Math.floor(d / 3600);
          var m:any = Math.floor(d % 3600 / 60);
          var s:any = Math.floor(d % 3600 % 60);

          this.totalWorkingHours=h+"h "+m+"m "+s+"s ";

          this.lastActivity=main_data.agent_profile.status.last_activity;
          this.agentShift=main_data.agent_profile.status.shift;
          this.agentGps=main_data.agent_profile.status.gps;
          this.batteryStatus=main_data.agent_profile.status.battery;

          var locClone=[];
          if(data.json().travel_log!=null)
          {
            var travel=[];
            travel=data.json().travel_log.travel_activity_list;
            this.travelLog=travel;
            locClone = this.travelLog;
            var locations_array=[];
            for(var i=0;i<travel.length;i++)
            {
                
              if(travel[i].activity_location!=null)
              { 
                this.pushAddress(travel[i].activity_location[0],travel[i].activity_location[1],i);  
              }
              if(travel[i].activity_location===null)
              {
                locations_array.push('');
              }
            }

            let vm = this;
            setTimeout(function(){
              vm.loading=false;
              vm.travalLogDisp=vm.travelLog;
            },200*travel.length);
          }
          if(data.json().travel_log===null)
          {
            
          }
          
      }, error=>{
          console.log(error);
      });

      this.params={date:utc,id:this.agentId}
      let options3 = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

      this.http.get(this.API_URL+this.BASE_URL+'members/tasks/'+this.agentId,options3).subscribe(data=>
      {
        this.taskDetails=data.json().task_details;  
      },error=>{
        console.log(error);
      });

    }

    previous()
    {
        this.loading=true;
        var date_from_ip=$('#mainDate').data('maindate');
        var dateA=moment(date_from_ip).subtract(1,'days').format("YYYY-MM-DD");
        $('#mainDate').data('maindate',dateA);

        this.daterange.start =moment(dateA).subtract(0, 'days');
        this.daterange.end = moment(dateA).subtract(0, 'days');
        this.daterange.label ='';
        $("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
        $("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));
        
        this.headers.set("Content-Type","application/json; charset=utf-8");
        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        var currentDay=moment().format('YYYY-MM-DD');

        if(currentDay<dateA)
        {
          return false;
        }
        this.DaytoDisplay=dateA;
        var a=new Date(dateA);
        a.setHours(0,0,0,0);
        var utc=new Date(a).toISOString();

        localStorage.setItem('dateFromLocal',utc);

        this.params={page_reload:'no',refresh:'no',date:utc,id:this.agentId,department_id:this.deptId,region_id:this.regionId}

        let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

        this.http.get(this.API_URL+this.BASE_URL+'members/details/'+this.agentId,options).subscribe(data=>
        { 
            var main_data=data.json().member_details;

            this.agentName=main_data.agent_profile.name;
            this.roles=main_data.agent_profile.name;
            this.agentMobile=main_data.agent_profile.phone;
            this.agentStatus=main_data.agent_profile.status.status;
            this.agentAvatar=main_data.agent_profile.avatar;

            //this.totalWorkingHours=main_data.agent_profile.status.total_working_hours;

            var d = Number(main_data.agent_profile.status.total_working_hours);
            var h:any = Math.floor(d / 3600);
            var m:any = Math.floor(d % 3600 / 60);
            var s:any = Math.floor(d % 3600 % 60);

            this.totalWorkingHours=h+"h "+m+"m "+s+"s ";

            this.lastActivity=main_data.agent_profile.status.last_activity;
            this.agentShift=main_data.agent_profile.status.shift;
            this.agentGps=main_data.agent_profile.status.gps;
            this.batteryStatus=main_data.agent_profile.status.battery;

            var locClone=[];
            if(data.json().travel_log!=null)
            {
                var travel=[];
                travel=data.json().travel_log.travel_activity_list;
                this.travelLog=travel;
                locClone = this.travelLog;
                var locations_array=[];
                for(var i=0;i<travel.length;i++)
                {
                    
                  if(travel[i].activity_location!=null)
                  { 
                    this.pushAddress(travel[i].activity_location[0],travel[i].activity_location[1],i);  
                  }
                  if(travel[i].activity_location===null)
                  {
                    locations_array.push('');
                  }
                }

                let vm = this;
                setTimeout(function(){
                  vm.loading=false;
                  vm.travalLogDisp=vm.travelLog;
                },200*travel.length);
            }
            if(data.json().travel_log===null)
            {
              this.loading=false;
            } 

        }, error=>{
            console.log(error);
        });

        this.params={date:utc,id:this.agentId}
        let options3 = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

        this.http.get(this.API_URL+this.BASE_URL+'members/tasks/'+this.agentId,options3).subscribe(data=>
        {
          this.taskDetails=data.json().task_details;
        },error=>{

        });
    }

    taskViewDisplay(event)
    {  
      $('#travelLogtask').hide(); 
      var clicked=$(event.target).data('id');
      $(event.target).removeClass('activeTab'); 
      $('.activeTab').removeClass('activeTab');
      if(clicked==='activeTab')
      {

      }
      if(clicked!='activeTab')
      {
        $('#taskViewSec').show();
        $('#travelLogSec').hide();
        //$('#travelLogSec').hide();
        $(event.target).addClass('activeTab');
      }
    }

    mapViewDisplay(event)
    { 
      //var clicked=$(event.target).data('id');

      var clicked=$(event.target).data('id');
      $(event.target).removeClass('activeTab');
      $('.activeTab').removeClass('activeTab');
      if(clicked==='activeTab')
      { 
        //$('#mapComponentview').show();
        
      }
      if(clicked!='activeTab')
      {
          $('#taskViewSec').hide();
          $('#travelLogSec').hide();
          $('#mapComponentview').show();
          $(event.target).addClass('activeTab');
      } 
    }  

    travelViewDisplay(event)
    {
      $('#travelLogtask').hide(); 
      var clicked=$(event.target).data('id');
      $(event.target).removeClass('activeTab');
      $('.activeTab').removeClass('activeTab');
      if(clicked==='activeTab')
      {

      }
      if(clicked!='activeTab')
      {
        $('#taskViewSec').hide();
        $('#mapComponentview').hide();
        $('#travelLogSec').show();
        $(event.target).addClass('activeTab');
      }

    }

    backPage()
    {
      this.router.navigate(['/lazy/memberdetails']);
    }

    travelLogTask(event)
    { 
        this.loading=true;

        $('#travelLogSec').hide();
        $('#travelLogtask').show();

        this.headers.set("Content-Type","application/json; charset=utf-8");
        this.headers.set("dataType","json");
        this.headers.set('crossDomain','true');
        this.headers.set("Access-Control-Allow-Credentials","true");

        var token="JWT "+localStorage.getItem('jwtToken');
        this.headers.set("Authorization",token);

        this.params={id:event};

        let options = new RequestOptions({headers:this.headers, withCredentials: true,params: this.params});

        this.http.get(this.API_URL+this.BASE_URL+'tasks/'+event,options).subscribe(data=>
        {
          this.travelTask=data.json();
          this.travelTaskTitle=data.json().title;
          this.travelTaskcustName=data.json().customer_details.name;
          this.travelTaskAttempts=data.json().attempt_details;
          this.revisitTaskId=data.json().id;
          this.loading=false;
        },
        error=>{

        })
    }

    closeTravellogTask()
    { 
        this.loading=true;
        $('#travelLogSec').show();
        $('#travelLogtask').hide(); 
        this.loading=false;
    } 

    getAddress(latt,lang,$event)
    { 
        $('.dropdown-content').css('display','none');
        $(event.target).next().css('display','block');
        var here=$(event.target).next();
        this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key='+this.geocode_api_key+'&latlng='+latt+','+lang).subscribe(data=>
          { 
            here.html('<div style="font-size:10px;">'+data.json().results[0].formatted_address+'</small>')
            
          },error=>{
        });
    }

    toggleCustom(toggleId:any)
    { 
      var toggle=$('#'+toggleId);
      //$("#"+toggleId).next().css('display','none');

      $("#"+toggleId).next().toggle();

     /* if(this.toggle===1)
      { 
        
        $("#"+toggleId).next().css('display','none');  
        this.toggle=1;
      }
      else
      {
        
        $("#"+toggleId).next().css('display','block');
        this.toggle=0;
      
      }*/
    }
    editRms()
    {
      console.log(this.agentId);
    }
    deleteRms()
    {
      console.log(this.agentId);
    }

    down()
    { 
      $('#updiv').show();
      $('#up').show();
      $('#down').hide();
    }
    up()
    {
      $('#updiv').hide();
      $('#up').hide();
      $('#down').show();
    }

    getImgUr(docs)
    {
        this.documentImage=docs;
    }

    revisitConfirm()
    {
        var Rdate=$('#revisitDate').val();
      

        //api/v2/
        
        let revisitData:any={}

        //var utc
        var a:any=Rdate;
        var utc:string=new Date(a).toISOString();

        var headers = new Headers();
        headers.set("Content-Type","application/json; charset=utf-8");

        var token="JWT "+localStorage.getItem('jwtToken');
        headers.append("Authorization",token);
    
        headers.set("dataType","json");
        headers.set('crossDomain','true');
        headers.set("dataType","json");
        headers.append('crossDomain','true');
        headers.append("Access-Control-Allow-Credentials","true");
        
        revisitData={
        agent_remarks:this.revisitComment,
        id:this.revisitTaskId,
        revisit_details:{remarks:this.revisitComment,timestamp:utc},
        timestamp:utc}
      

        var body=JSON.stringify(revisitData);

        this.http.post(this.API_URL+this.BASE_URL+'tasks/'+this.revisitTaskId+'/revisit',body, { headers: headers })
        .map((response: Response) => {
          var result = response.json();
         
          return result;
        }).subscribe(
          status => console.log(status),
          error => console.log(error),
          () => console.log()
          );

    }

    getIdFromRevisit(id:any)
    {
      console.log(id);
    }
}


