import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import { Http, Response,RequestOptions, Headers,URLSearchParams,RequestOptionsArgs,Request,ConnectionBackend} from '@angular/http';
import 'rxjs/add/operator/map';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { AuthenticationService } from '../services/authentication.service';
import { DataStorageService } from '../services/data-storage.service';
import { environment } from '../../environments/environment';

declare var moment:any;
declare var google: any;
declare var MarkerClusterer: any;

@Component({
  selector: 'app-member-details',
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css'],
  providers: [AuthenticationService, DataStorageService],
  
})


export class MemberDetailsComponent implements OnInit {
    
    API_URL: string = environment.apiMainPoint;//global declaration for hostname
    BASE_URL:string=environment.apiBasePoint;
    geocode_api_key = environment.GoogleApiKey;
      
    headers: Headers = new Headers();

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

    //author data
    agentName:string='';
    loginId;
    orgName:string='';
    roles:any=[];
    firstLetter:string='';
    secondLetter:string='';

    //dash board data
    localRegId=localStorage.getItem("regionId");
    localRegName=localStorage.getItem("regionName");

    regionId:any   
    regionName:string;

    functionName:string='';
    loading = false;
    DaytoDisplay:any;

    params:any={};

    memberData = []; // array to store members data
    memberDataRole=[];
    withLastLocation=[];
    format_address;

    totalTasks;//total tasks data
    assignedTasks;
    unAssignedTasks;

    totalOnlineNumber:any='';
    totalOfflineNumber:any='';
    totalInactiveNumber:any='';
    on:any=0;
    off:any=0;
    in:any=0;

    currentUserId:any='';
    private result: Object;

    //hide and show
    mapDisplay=true;
    membersDisplay=true;
    tasksDisplay=false;

    //modal
    taskDesc='';
    custAutoComplete
    customersData=[];
    showCustomerList:any;

    agentAutoComplete
    agentsData=[];
    showAgentList:any;
    //showAgentList:any;

    allAgentsData=[];
    agentDataTofunction=[];

    taskAgentId="";
    customerAddressId="";
    customerId='';

    //cluster
    clusterLocations=[];

    //status tabs
    statusFilter=true;

    assigendListDisplay=true;
    unAssigendListDisplay=false;

    constructor(private http:Http, private router: Router,private ds: DataStorageService) { 

        $('body').on("swiperight",function(){
        alert();
         document.getElementById("mySidenav").style.width = "280px";
        });
    }

    getLocation() {
        if (navigator.geolocation) {
          var that = this;
          navigator.geolocation.getCurrentPosition((position) => {
            that.INDIA = { lat: position.coords.latitude, lng: position.coords.longitude };
            that.mapZoom = 16;
            that.map.setCenter(that.INDIA);
            that.map.setZoom(that.mapZoom);
            that.gotLocationFromBrowser = true;
          });

        } else {
          // alert("Geolocation is not supported by this browser.");
        }
    }

    public options: any = {
        locale: { format: 'YYYY-MM-DD' },
        alwaysShowCalendars: false,
        singleDatePicker: true,
        maxDate: new Date()
    };

    public selectedDate(value: any) {
      this.loading=true;
      this.clusterLocations=[];
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

      //console.log($('.activeTab').html());
      var active=$('.activeTab').html()
      if(active==='Tasks')
      {
        this.tasksDisplay=true;
      }  
      $('#selectRole').attr('selected','all');

      this.daterange.start = value.start;
      this.daterange.end = value.end;
      this.daterange.label = value.label;
      var dateA=moment(value.start).add(0,'days').format("YYYY-MM-DD");
      $('#mainDate').data('maindate',dateA);

      this.daterange.start =moment(dateA).add(0, 'days');
      this.daterange.end = moment(dateA).add(0, 'days');
      this.daterange.label ='';

      //$("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
      //$("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));

      var currentDay=moment().format('YYYY-MM-DD');
      this.DaytoDisplay=dateA;
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
      this.headers.set("Access-Control-Allow-Credentials","true");

      var token="JWT "+localStorage.getItem('jwtToken');
      this.headers.set("Authorization",token);
        
      let options = new RequestOptions({headers: this.headers, withCredentials: true, params: this.params});

      this.http.get(this.API_URL+this.BASE_URL+'home',options).subscribe(data=>
      {   
          this.on=0;
          this.off=0;
          this.in=0;

          this.memberData=data.json().members;
          this.memberDataRole=data.json().members;
          this.totalTasks=data.json().tasks;
          this.assignedTasks=data.json().tasks.list.Assigned;

          for(var j=0;j<this.memberDataRole.length;j++)
            {
                if((this.memberDataRole[j].same_location==-1)||(this.memberDataRole[j].same_location==1))
                { 
                   setTimeout(this.pushAddress(this.memberDataRole[j].location[0],this.memberDataRole[j].location[1],j,this.memberDataRole[j].avatar,this.memberDataRole[j].status,this.memberDataRole[j].name,this.memberDataRole[j].last_activity_at), 200);  
                }
                if(this.memberDataRole[j].location===null)
                {
                  //locations_array.push('');
                }
            }

            this.displayWithAddress()

      },error=>{
        this.loading=false;
      });

    }


    ngOnInit() {          
    
        $("#selectRole").val('all');
        $('#mapComponent').hide();

        this.loading=true;
        this.mapDisplay=true;
        this.DaytoDisplay='Today'

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
            //this.memberData=data.json().members;

            this.memberDataRole=data.json().members;
            this.withLastLocation=data.json().members;

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

            var tree_data=data.json().navigation_details.navigation[0].regions_tree;

            //var tree=this.ds.BFS(tree_data[0]);

            this.roles = data.json().current_user.roles.join('|');

            this.totalTasks=data.json().tasks;
            this.assignedTasks=data.json().tasks.list.Assigned;

            this.functionName=data.json().navigation_details.default_path.department_path.name;
            //this.regionName=data.json().navigation_details.default_path.region_path.name;

            if(this.localRegName)
            {
                this.regionName=this.localRegName;
            }
            else
            {
              this.regionName=data.json().navigation_details.default_path.region_path.name;
            }//to change the region name using local storage
             
            this.loginId=data.json().current_user.id;
              
            localStorage.setItem('regionId', data.json().navigation_details.default_path.region_path.id);
            localStorage.setItem('regionName', data.json().navigation_details.default_path.region_path.name);

            localStorage.setItem('deptId', data.json().navigation_details.default_path.department_path.id);
            localStorage.setItem('deptName', data.json().navigation_details.default_path.department_path.name);

            for(var j=0;j<this.memberDataRole.length;j++)
            {
                
                if((this.memberDataRole[j].same_location==-1)||(this.memberDataRole[j].same_location==1))
                {    
                   setTimeout(this.pushAddress(this.memberDataRole[j].location[0],this.memberDataRole[j].location[1],j,this.memberDataRole[j].avatar,this.memberDataRole[j].status,this.memberDataRole[j].name,this.memberDataRole[j].last_activity_at), 200);  
                   //console.log(this.memberDataRole[j].last_activity_at);
                }
                if(this.memberDataRole[j].location===null)
                {
                  //locations_array.push('');
                }
            }

            this.displayWithAddress()
            this.currentUserId=data.json().current_user.id;
        }, error=>{
          var display=error.json();
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
        document.getElementById("mySidenav").style.width = "280px";
    }

    closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    next()
    {    
        $("#selectRole").val('all');
        this.clusterLocations=[];

        $('#onlinenumber').removeClass('onlineButton_wb');
        $('#offlinenumber').removeClass('offlineButton_wb');
        $('#inactivenumber').removeClass('inactiveButton_wb');
        $('#onlinenumber').addClass('onlineButton');
        $('#offlinenumber').addClass('offlineButton');
        $('#inactivenumber').addClass('inactiveButton');
        $('#onlinenumber').show();
        $('#offlinenumber').show();
        $('#inactivenumber').show();

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

        //$("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
        //$("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));

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
        
          this.memberDataRole=data.json().members;
          this.withLastLocation=data.json().members;
          this.totalTasks=data.json().tasks;
          this.assignedTasks=data.json().tasks.list.Assigned;

          if(this.localRegName)
          {
            this.regionName=this.localRegName;
          }
          else
          {
            this.regionName=data.json().navigation_details.default_path.region_path.name;
          }

          for(var j=0;j<this.memberDataRole.length;j++)
            { 
                if((this.memberDataRole[j].same_location==-1)||(this.memberDataRole[j].same_location==1))
                { 
                   
                   setTimeout(this.pushAddress(this.memberDataRole[j].location[0],this.memberDataRole[j].location[1],j,this.memberDataRole[j].avatar,this.memberDataRole[j].status,this.memberDataRole[j].name,this.memberDataRole[j].last_activity_at), 200);
                    
                }
                if(this.memberDataRole[j].location===null)
                {
                  //locations_array.push('');
                }
            }

          this.displayWithAddress();

        },error=>{
            this.loading=false;
        });
    }

    previous()
    {    
        $("#selectRole").val('all');
        this.clusterLocations=[];

        $('#onlinenumber').removeClass('onlineButton_wb');
        $('#offlinenumber').removeClass('offlineButton_wb');
        $('#inactivenumber').removeClass('inactiveButton_wb');
        $('#onlinenumber').addClass('onlineButton');
        $('#offlinenumber').addClass('offlineButton');
        $('#inactivenumber').addClass('inactiveButton');
        $('#onlinenumber').show();
        $('#offlinenumber').show();
        $('#inactivenumber').show();

        this.loading=true;
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
        this.daterange.label =moment(dateA).subtract(0, 'days');
        //$("#mainDate").data('daterangepicker').setStartDate(moment(dateA).subtract(0, 'days'));
        //$("#mainDate").data('daterangepicker').setEndDate(moment(dateA).subtract(0, 'days'));
        
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
            
            this.memberDataRole=data.json().members;
            this.withLastLocation=data.json().members;
            this.totalTasks=data.json().tasks;  
            this.assignedTasks=data.json().tasks.list.Assigned;

            for(var j=0;j<this.memberDataRole.length;j++)
            {
                
                if((this.memberDataRole[j].same_location==-1)||(this.memberDataRole[j].same_location==1))
                { 
                    
                   setTimeout(this.pushAddress(this.memberDataRole[j].location[0],this.memberDataRole[j].location[1],j,this.memberDataRole[j].avatar,this.memberDataRole[j].status,this.memberDataRole[j].name,this.memberDataRole[j].last_activity_at), 200);
                    
                }
                if(this.memberDataRole[j].location===null)
                {
                  //locations_array.push('');
                }
            }
            
            this.displayWithAddress();

        },error=>{
          this.loading=false;
        });
    }

    agentDetaisroute(event)
    {  
      localStorage.setItem('memDetTMT',event);
      //this.ds.setAgentId(event)
      this.router.navigate(['/lazy/agentdetails']);
      this.ds.setInfo(event);
    }

    membersTab($event)
    {
        this.membersDisplay=true;
        this.mapDisplay=false;
        this.tasksDisplay=false;

        $('#mapComponent').hide();
        this.statusFilter=true;

        $('.activeTab').removeClass('activeTab');
        $(event.target).addClass('activeTab'); 
      
    }
    mapsTab($event)
    {
        this.membersDisplay=false;
        this.mapDisplay=true;
        this.statusFilter=false;
        this.tasksDisplay=false;

        //$('#mapComponent').show();
        var map=document.getElementById('mapComponent');
        map.style.display = 'block';
        $('.activeTab').removeClass('activeTab');
        $(event.target).addClass('activeTab'); 
        this.buildMap();
    }
    buildMap=function()
    {
        var Mapstyles=Mapstyles=[
        {
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [
            {
              "color": "#f5f5f5"
            }
          ]
        },
        {
          "featureType": "administrative.land_parcel",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#bdbdbd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "road.arterial",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#757575"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#dadada"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#616161"
            }
          ]
        },
        {
          "featureType": "road.local",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        },
        {
          "featureType": "transit.line",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#e5e5e5"
            }
          ]
        },
        {
          "featureType": "transit.station",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#eeeeee"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [
            {
              "color": "#A3CCFF"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#9e9e9e"
            }
          ]
        }
      ];

        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.DRIVING,
          mapTypeControl: false,
          streetViewControl: false,
          center: {lat: 20.5937, lng: 78.9629}
        });

        map.setOptions({styles: Mapstyles});

        var infoWin = new google.maps.InfoWindow(); 

        var markers = this.clusterLocations.map(function(location, i) {
            var marker =new google.maps.Marker({
                position: location,
                icon: {
                url:location.avatar,
                scaledSize: new google.maps.Size(30, 40)
                }
            });
            google.maps.event.addListener(marker, 'mouseover', function(evt) {

                var time= moment(location.timestamp).format("hh:mm a");

                infoWin.setContent("<div style='font-size:10px;'> <p id='content' style='margin-bottom:0px;'><b>"+location.name+"</b></p><p style='margin-bottom:0px;'><b>"+time+"</b></p></div>");
                infoWin.open(map, marker);
            });
            return marker;
        });
        
        var markerCluster = new MarkerClusterer(map, markers, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});


    }
    tasksTab($event)
    {
        $('.activeTab').removeClass('activeTab');
        $(event.target).addClass('activeTab');

        $('#mapComponent').hide();
        this.membersDisplay=false;
        this.tasksDisplay=true;
        this.statusFilter=false;
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
            //$('.'+x).show();
        }
        if(x==='agent')
        {
            $('.'+x).show();
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
        var cloneData=this.withLastLocation;
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
            this.memberData=selectedOptionArray;
        }  

        if(x==='all')
        {   
            var sorting;
            sorting=cloneData;
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
            
            this.customersData=data.json().customers;
            this.showCustomerList = true;
        },error=>
        {

        })
    }

    agentNameAuto($event)
    {
        var cloneData=this.agentDataTofunction;
       
        var selectedOptionArray=[];
        for(var i=0;i<cloneData.length;i++)
        {
            if(cloneData[i].name.search(this.agentAutoComplete)>-1)
            {
                selectedOptionArray.push(cloneData[i]);
            }
        }
        this.showAgentList=true;
        
        this.allAgentsData=selectedOptionArray;
       
    }

    addToCustomer($event,id)
    { 
        this.custAutoComplete=$event.target.innerText;
        this.customerAddressId=$event.target.id;
        this.customerId=id;
    }

    addToAgent($event)
    {
        this.agentAutoComplete=$event.target.innerText;
        this.taskAgentId=$event.target.id;
    }

    doneTask()
    {
        var RegionId=localStorage.getItem('regionId');
        var DeptId=localStorage.getItem('deptId');
        var DeptName=localStorage.getItem('deptName');
      
        let dashboard_data:any ={} //new URLSearchParams();
        
        //var utc;

        var a:any=$('#taskDate').val();
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

    onSwipeLeft = function(ev) {
      alert('You swiped left!!');
    };  

    pushAddress = function(laat:any,lnng:any,j:any,avatar:any,status:any,name:any,timestamp:any)
    {   
        if(status==='ONLINE')
        this.clusterLocations.push({lat:laat,lng:lnng,avatar:avatar+"_green",name:name,timestamp:timestamp});
        if(status==='OFFLINE')
        this.clusterLocations.push({lat:laat,lng:lnng,avatar:avatar+"_red",name:name,timestamp:timestamp});
        if(status==='INACTIVE')
        this.clusterLocations.push({lat:laat,lng:lnng,avatar:avatar+"_black",name:name,timestamp:timestamp});

        this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key='+this.geocode_api_key+'&latlng='+laat+','+lnng).subscribe(data=>
        {
          if(data.json().results[0].length!=0)
          var arr=data.json().results[0].formatted_address.split(',');
          arr.pop();
          arr.pop();
          this.format_address=arr.slice(Math.max(arr.length - 4, 0))
          var addr=this.format_address;
          this.withLastLocation[j].address = addr;
          
          //locations_array.push(addr);
        },error=>{
          console.log(error.json());
        });

        /*this.http.get('http://nominatim.openstreetmap.org/reverse?format=json&lat='+laat+'&lon='+lnng+'&zoom=18&addressdetails=1').subscribe(data=>
        {
          console.log(data.json());
        },error=>{

        })*/
    }


    displayWithAddress=function()
    {
         let vm = this;
        setTimeout(function(){
          vm.loading=false;
          
          var sorting;
          sorting=vm.withLastLocation;
          if(sorting.length!=null)
          {
            sorting.sort((a,b)=> a.name.localeCompare(b.name))
            vm.memberData=sorting;
          }

          for(var i:any=0;i<vm.memberData.length;i++)
          { 
              if(vm.memberData[i].status==="ONLINE")
              { vm.on++;
                vm.totalOnlineNumber=vm.on;
              }
              if(vm.memberData[i].status==="OFFLINE")
              {
                vm.off++;
                vm.totalOfflineNumber=vm.off;
              }
              if(vm.memberData[i].status==="INACTIVE")
              {
                vm.in++;
                vm.totalInactiveNumber=vm.in;
              }
          }
          if((vm.off===0)||(vm.off===''))
          {
             vm.totalOfflineNumber=0;
          }
            //console.log(vm.clusterLocations);
            vm.buildMap();
        },50*vm.memberDataRole.length);
             
    }

    assignList($event)
    {
        this.assigendListDisplay=true;
        this.unAssigendListDisplay=false;
        $('.bbblack').removeClass('bbblack');
        $(event.target).addClass('bbblack');
    }

    unAssignList($event)
    {
        this.assigendListDisplay=false;
        this.unAssigendListDisplay=true;
        $('.bbblack').removeClass('bbblack');
        $(event.target).addClass('bbblack');
    }  

    swipe(action) {
        this.ds.swipe(action);
    }
}

