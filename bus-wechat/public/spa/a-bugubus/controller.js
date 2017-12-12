var app = angular.module('app');
app.controller('AppController',function($rootScope,$scope,$state,$ionicViewSwitcher,$location){
    $rootScope.routerInclude = function(url){
        //ui-router自带的include有坑，在进行json对象序列化时，序列化出来的对象，name和url均为空
        //如下代码可以进行检测
        /*$scope.currState = $state;
         console.log("This one have some objects: ");
         console.log('by reference:', $scope.currState);
         console.log('by value:', JSON.parse(JSON.stringify($scope.currState)));

         // console.log("But when I want to access name its empty: ");
         // $timeout(function() {
         //    console.log($state.current.name);
         // });

         // use this instead:
         $scope.$watch('currState.current.name', function(newValue, oldValue) {
         console.log(newValue);
         });*/
        $scope.currState = $state;
        if($scope.currState.current.name.indexOf(url)!=-1){
            return true;
        }
        return false;
    }
    /**控制器切换*/
    $scope.changePage = function(route){
        /**
         * 为了防止浏览器留下历史记录
         */
        $location.path(route).replace();
    }
})
/**
 * 注册登录过滤器
 */
app.controller('LoginController',function($rootScope,$scope,$state,$stateParams,$ionicViewSwitcher,$myHttpService,$location){
    if($stateParams.url){
        $scope.showTip =true;
        $scope.tips = "请先验证您的手机号";
    }
    //定义用户对象
    $scope.user = {};
    //标记是否开启第一步
    $scope.first = true;
    $scope.sendButtonText = "重新获取",
        $scope.sendStatus =true;
    $scope.sendCode = function(){
        //对参数做预处理
        var checkcode = $scope.user.mobile%($scope.user.mobile.toString().substr(1,3));
        console.log($scope.user.mobile);
        $myHttpService.post("api/utils/sendAuthcode", {
            phone:$scope.user.mobile,
            servicename:"WechatUserLogin",
            checkcode:checkcode
        },function(data){
            layer.msg("短信验证码发送成功！");
            $scope.first = false;
            $scope.sendStatus = false;
            var count = 60;
            $scope.sendButtonText = count+"s后获取"
            var timer = window.setInterval(function(){
                if(count>0){
                    count--;
                    $scope.sendButtonText = count+"s后获取";
                    $scope.$apply();
                }else{
                    $scope.sendStatus = true;
                    $scope.sendButtonText = "重新获取";
                    $scope.$apply();
                    window.clearInterval(timer);
                }
            },1000);
        });
    }

    $scope.next= function(){
        $myHttpService.post("auth/login",{
            phone:$scope.user.mobile,
            authcode:$scope.user.authcode,
            openid:$rootScope.session.user.openId
        },function(data){
            //登录成功，更新session
            $rootScope.session.user.userInfo = data.user;
            //登录后检查重定向路径，重定向到登陆前的路径
            if($stateParams.url){
                console.log($stateParams.url);
                $location.url($stateParams.url).replace();
            }else{
                $location.url("/app/buy").replace();
            }
        });
    }
})
/**
 * 搜索位置界面控制器
 */
    .controller('SelectLocationController',function($rootScope,$scope,$state,$myLocationService,$ionicScrollDelegate){
        var param = $state.params.params,map=null,status =$state.params.status;
        $scope.address = $rootScope[param];
        $scope.poilist = [];
        if($scope.address){
            //存在，可以直接进行地址解析
            $myLocationService.getPoisByKeyword( $scope.address.name,function(data){
                var tempArray = [];
                //对数据进行过滤
                for(var i= 0,len=data.length;i<len;i++){
                    if(!(data[i].location==undefined||data[i].location=="")){
                        tempArray.push(data[i]);
                    }
                }
                //重新初始化滚动条
                $ionicScrollDelegate.scrollTo(0,0,true);
                //数据绑定到$scope
                $scope.poilist = tempArray;
                if($scope.poilist.length>0){
                    $scope.poilist[0].active = true;
                }
                //通知angular更新数据
                $scope.$apply();
            });
        }else{
            //不存在，则调用定位服务，获取用户的位置信息
            $myLocationService.getCurrentPosition(function(data){
                if(data.length>0){
                    map.setCenter(data[0].location);
                    $scope.poilist = data;
                    if($scope.poilist.length>0){
                        $scope.poilist[0].active = true;
                        $scope.address = {
                            name:$scope.poilist[0].name,
                            lngLat:$scope.poilist[0].location.getLng()+","+$scope.poilist[0].location.getLat()
                        }
                    }
                    $scope.$apply();
                    //更新坐标到根对象，需要更新时才更新到根对象，通过status确定
                    if(status==true){
                        $rootScope[param]=$scope.address;
                    }
                }
            });
        }
        var map = new AMap.Map("J_map_canvas",{
            zoom:17,
            animateEnable:false,
            center:$scope.address==undefined?[0,0]:$scope.address.lngLat.split(',')
        });
        /**
         * 设置地图工具条
         */
        AMap.plugin(['AMap.ToolBar'],
            function(){
                map.addControl(new AMap.ToolBar());
            });
        /**
         * 地图拖动完成时，重新解析兴趣点
         */
        AMap.event.addListener(map,"dragend",function(){
            $myLocationService.getPoisByLngLat( map.getCenter(),function(data){
                $scope.poilist = data;
                if($scope.poilist.length>0){
                    $scope.poilist[0].active = true;
                    //同时更新数据到address
                    $scope.address = {
                        name:$scope.poilist[0].name,
                        lngLat:$scope.poilist[0].location.getLng()+","+$scope.poilist[0].location.getLat()
                    }
                }
                $ionicScrollDelegate.scrollTo(0,0,true);
                $scope.$apply();
            });
        });
        /**
         * 点击取消按钮，界面退回上级
         */
        $scope.cancel = function(){
            window.history.back(-1);
        }
        /**
         * 控制被选中的那一栏
         * @param item 当前兴趣点列表的数据对象
         * @param index 需要激活的兴趣点的索引
         */
        $scope.active = function(item,index){
            for(var i = 0,len= $scope.poilist.length;i<len;i++){
                if(index==i){
                    $scope.poilist[i].active = true;
                    //同时更新数据到address
                    $scope.address = {
                        name: item.name,
                        lngLat: item.location.getLng()+","+ item.location.getLat()
                    }
                }else{
                    $scope.poilist[i].active = false;
                }
            }
            map.setCenter(item.location);
        }
        /**
         * 保存数据到根对象
         */
        $scope.save = function(){
            $rootScope[param]=$scope.address;
            window.history.back(-1);
        };
        $scope.openSelectAddress = function(){
            $state.go("select_address",{params:param});
        }
    })
/**
 * 选择兴趣点列表控制器
 */
    .controller('SelectAddressController',function($rootScope,$scope,$state,$myLocationService,$ionicScrollDelegate){
        //先让文本框聚焦
        var param = $state.params.params;
        $scope.keyword = {
            text:""
        }
        $scope.poilist = [];
        $scope.search = function(){
            $myLocationService.getPoisByKeyword( $scope.keyword.text,function(data){
                var tempArray = [];
                //对数据进行过滤
                for(var i= 0,len=data.length;i<len;i++){
                    if(!(data[i].location==undefined||data[i].location=="")){
                        tempArray.push(data[i]);
                    }
                }

                //重新初始化滚动条
                $ionicScrollDelegate.scrollTo(0,0,true);
                //数据绑定到$scope
                $scope.poilist = tempArray;
                //通知angular更新数据
                $scope.$apply();
            });
        }
        $scope.cancel = function(){
            window.history.back(-1);
        }
        $scope.active = function(item){
            $rootScope[param]={
                name:item.name,
                address:item.address,
                lngLat:item.location.getLng()+","+item.location.getLat()
            };
            window.setTimeout(function(){window.history.back(-1)},0);
        }
    })
/**
 * 发起新线路界面控制器
 */
    .controller('CreateRouteController',function($rootScope,$scope,$state,$myLocationService,$location,$myHttpService){
        //首先从根对象上获取坐标信息
        $scope.schedule = {
            onDutyTitle:"上班时间",
            onDutyTime:new Date(2001,0,1,9,0,0),
            offDutyTitle:"下班时间",
            offDutyTime:new Date(2001,0,1,18,0,0)
        };
        if($rootScope["departAddressCreate"]){
            var data = $rootScope["departAddressCreate"];
            $scope.schedule.depart =data.name;
            $scope.schedule.departLngLat = data.lngLat;
        }else{
            //定位获取开始位置
            $myLocationService.getCurrentPosition(function(data){
                if(data.length>0){
                    var data = data[0];
                    $rootScope["departAddressCreate"] = {
                        name:data.name,
                        lngLat:data.location.lng+","+data.location.lat
                    }
                    $scope.schedule.depart = data.name;
                    $scope.schedule.departLngLat = data.location.lng+","+data.location.lat;
                    $scope.$apply();
                }else{
                    $scope.schedule.depart = "无法获取你的位置";
                    $scope.schedule.departLngLat = "0,0";
                    $scope.$apply();
                }

            });
        }
        if($rootScope["arriveAddressCreate"]){
            var data = $rootScope["arriveAddressCreate"];
            $scope.schedule.arrive =data.name;
            $scope.schedule.arriveLngLat = data.lngLat;
            console.log( $scope.schedule.arrive);
        }
        /**
         * 打开选择位置窗口
         * @param params 需要保存的全局变量的名称
         * @param status
         */
        $scope.selectLocation = function(params,status){
            $state.go("select_location",{params:params,status:status});
        }
        $scope.save = function(){
            var data = {
                phone:$rootScope.session.user.userInfo.phone,
                getonaddr: $scope.schedule.depart,
                getonlgt:$scope.schedule.departLngLat.split(",")[0],
                getonlat:$scope.schedule.departLngLat.split(",")[1],
                getoffaddr:$scope.schedule.arrive,
                getofflgt:$scope.schedule.arriveLngLat.split(",")[0],
                getofflat:$scope.schedule.arriveLngLat.split(",")[1],
                startworktime:$scope.schedule.onDutyTime.getTime(),
                endworktime:$scope.schedule.offDutyTime.getTime()
            }
            $myHttpService.post("api/applyBusline/applyBusline",data,function(){
                //保存线路信息，跳转到添加成功页面
                $location.path("/create_route_success").replace();
                //$state.go("create_route_success",{},{reload:true});
            });
        };
        $scope.exchangePosition = function(){
            var tempArrive = $scope.schedule.depart;
            var tempArriveLngLat = $scope.schedule.departLngLat;
            $scope.schedule.depart = $scope.schedule.arrive;
            $scope.schedule.departLngLat = $scope.schedule.arriveLngLat;
            $scope.schedule.arrive  = tempArrive;
            $scope.schedule.arriveLngLat = tempArriveLngLat;
            $rootScope["departAddressCreate"] = {
                name:  $scope.schedule.depart,
                lngLat:$scope.schedule.departLngLat
            }
            $rootScope["arriveAddressCreate"] = {
                name:  $scope.schedule.arrive,
                lngLat:$scope.schedule.arriveLngLat
            }
        }
    })
/**
 * 待开通路线控制器
 */
    .controller('ScheduleWillOpenController',function($rootScope,$scope,$state,$myHttpService,$ionicScrollDelegate){
        $scope.scheduleList = [];
        $scope.offset = 0;
        $scope.pagesize = 20;
        $scope.totalnum = 0;
        $scope.showMoreBtn = false;
        $scope.getData = function(){
            $myHttpService.post('api/busline/queryCycleBuslines',{
                runstatus:0,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.scheduleList = data.cycleBuslineSchedules;
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
                //$scope.$apply();
            })
        }
        //初始化页面数据
        $scope.getData();
        $scope.refresh = function(){
            $scope.offset = 0;
            $myHttpService.postNoLoad('api/busline/queryCycleBuslines',{
                runstatus:0,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.scheduleList = data.cycleBuslineSchedules;
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
                layer.msg("刷新成功");
                //$scope.$apply();
            })
        }
        //查询班次详情
        $scope.goToScheduleDetail = function(item){
            $state.go("schedule.detail",{
                bsid:item.bsid,
                mode:1,//0详情，1新线路报名模式,2购买车票
            });
        }
        $scope.getMoreData = function(){
            $scope.offset = $scope.offset+$scope.pagesize;
            $myHttpService.post('api/busline/queryCycleBuslines',{
                runstatus:0,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.scheduleList = $scope.scheduleList.concat(data.cycleBuslineSchedules);
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
            })
        }
    })
/**
 * 已开通路线控制器
 */
    .controller('ScheduleOpenedController',function($rootScope,$scope,$state,$myHttpService,$ionicScrollDelegate){
        $scope.scheduleList = [];
        $scope.offset = 0;
        $scope.pagesize = 20;
        $scope.totalnum = 0;
        $scope.showMoreBtn = false;
        $scope.getData = function(){
            $myHttpService.post('api/busline/queryCycleBuslines',{
                runstatus:1,
                offset:$scope.offset,
                pagesize:$scope.pagesize

            },function(data){
                console.log("关于已开通路线:"+JSON.stringify(data));
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.scheduleList = data.cycleBuslineSchedules;
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
                //$scope.$apply();
            })
        }
        //初始化页面数据
        $scope.getData();
        $scope.refresh = function(){
            $scope.offset = 0;
            $myHttpService.postNoLoad('api/busline/queryCycleBuslines',{
                runstatus:1,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.scheduleList = data.cycleBuslineSchedules;
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
                layer.msg("刷新成功");
                //$scope.$apply();
            })
        }
        //查询班次详情
        $scope.goToScheduleDetail = function(item,mode){
            $state.go("schedule.detail",{
                bsid:item.bsid,
                mode:mode,//0详情，1新线路报名模式,2购买车票
            });
        };
        $scope.getMoreData = function(){
            $scope.offset = $scope.offset+$scope.pagesize;
            $myHttpService.post('api/busline/queryCycleBuslines',{
                runstatus:1,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.scheduleList = $scope.scheduleList.concat(data.cycleBuslineSchedules);
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
            })
        }
    })

/**
 * 线路详情控制器
 */
    .controller('ScheduleDetailController',function($rootScope,$scope,$stateParams,$location,$state,$ionicLoading,$myHttpService,$interval){
        //标记是否购买
        $scope.mode = $stateParams.mode;
        //标记当前选中的标签
        $scope.tabIndex = 0;
        var map = null,drving = null;
        $scope.goSchedule = {};
        $scope.backSchedule = {};
        $scope.goLine = {};
        $scope.backLine = {};
        //标记展开收起状态
        $scope.expandStatus = false;
        var MapOperation = {
            //清空地图
            clearMap:function(){
                map.clearMap();
            },
            //添加点到地图上面
            addMarkers:function(buslines){
                for(var i = 0,len = buslines.length;i<len;i++){
                    var text = "<div class='marker station-marker'>"+i+"</div>";
                    if(i==0){
                        text="<div class='marker start-marker'>起</div>";
                    }else if(i==len-1){
                        text="<div class='marker stop-marker'>终</div>";
                    }
                    var marker = new AMap.Marker({
                        map: map,
                        position:new AMap.LngLat(buslines[i].lng,buslines[i].lat),
                        content:text,
                        extData:buslines[i],
                        draggable:false
                    });
                }
            },
            //添加路线到地图上面
            addPolyline:function(polyline){
                var polyline = new AMap.Polyline({
                    path: polyline,          //设置线覆盖物路径
                    strokeColor: "#3366FF", //线颜色
                    strokeOpacity: 1,       //线透明度
                    strokeWeight: 5,        //线宽
                    strokeStyle: "solid",   //线样式
                    strokeDasharray: [10, 5] //补充线样式
                });
                polyline.setMap(map);
                map.setFitView();
            },
            //调用高德地图进行路线规划
            drivingSearch:function(stations){
                $ionicLoading.show();
                var len = stations.length;
                if(len>1){
                    var startPoint = new AMap.LngLat(stations[0].stalongitude,stations[0].stalatitude);
                    var endPoint = new AMap.LngLat(stations[len-1].stalongitude,stations[len-1].stalatitude);
                    var waypoints = [];
                    for(var i=1;i<len-1;i++){
                        waypoints.push(new AMap.LngLat(stations[i].stalongitude,stations[i].stalatitude));
                    }
                    //绘图
                    drving.search(startPoint,endPoint,{waypoints:waypoints},function(){
                        $ionicLoading.hide();
                        //设置地图
                        map.setFitView();
                    });
                }else{
                    alert("读取线路数据出错");
                }
            }
        }
        $ionicLoading.show();
        $myHttpService.post("api/busline/queryCycleBusScheduleInfo",{
            bsid:$stateParams.bsid,
        },function(data){
            $scope.busSchedule = data.busSchedule;
            $scope.busStations = data.busStations;
            //此处进行网络请求，并创建地图
            map = new AMap.Map("J_map_canvas",{
                zoom:14,
                animateEnable:false,
                center:[114.530266,30.498785]
            });
            /**
             * 设置地图工具条
             */
            AMap.plugin(['AMap.ToolBar'],
                function(){
                    map.addControl(new AMap.ToolBar({
                        offset:new AMap.Pixel(10,150)
                    }));
                });
            //设置驾车导航
            drving = new AMap.Driving({
                map: map
            });
            //完成数据封装
            //完成地图绘制
            //MapOperation.addMarkers( $scope.goSchedule.line.stations);
            MapOperation.drivingSearch($scope.busStations);
        });

        /*
         * 每隔10s请求
         * */
        var content="<div class='bus-image marker '></div>";
        var marker;
        $interval(function(){
                $myHttpService.postNoLoad('api/busrecord/queryBusRecord',{lineid:$scope.busSchedule.lineid},function(data){
                    /*接收数据*/
                   $scope.lnglat=data.currlonlat;
                    /*判断marker是否存在*/
                    if(!marker){
                       //创建一个地图对象
                       var marker = new AMap.Marker({
                            map: map,
                            position:$scope.lnglat.split(','),
                            content:content,
                            draggable:false
                        });
                    }else{
                        marker.setPosition($scope.lnglat.split(','));
                   }

                })
           },
           10000
        );


        $scope.baoming = function(){
            //检查用户的登陆情况，没有登录则跳转到登录页
            if($rootScope.session.user.userInfo==undefined){
                var url = encodeURIComponent("/schedule/detail?bsid="+$stateParams.bsid+"&mode=1");
                $location.url("/auth/login?url="+url);
            }else{
                $myHttpService.post("api/userEnrollBusline/userEnrollBusline",{
                    userid:$rootScope.session.user.userInfo.userid,
                    phone:$rootScope.session.user.userInfo.phone,
                    lineid:$scope.busSchedule.lineid,
                    bsid:$scope.busSchedule.bsid
                },function(data){
                    $location.url("/signup_success?bsid="+$stateParams.bsid);
                });
            }
        };
        $scope.oldIndex = 0;
        $scope.expand = function(){
            $scope.expandStatus=! $scope.expandStatus;
            if($scope.expandStatus==true){
                map.panBy(0,140);
            }else{
                map.panBy(0,-140);
            }

        }
        $scope.activeStations = function(index){
            $scope.busStations[$scope.oldIndex].active = false;
            $scope.busStations[index].active = true;
            $scope.oldIndex = index;
            map.setZoom(18);
            map.setCenter([$scope.busStations[index].stalongitude,$scope.busStations[index].stalatitude]);
            map.panBy(0,140);
        }
        $scope.showLocation = function(item){
            var dest = item.stalongitude+","+item.stalatitude;
            var destName = item.stationname;
            window.location.href = "http://m.amap.com/navi/?start=&dest="+dest+"&destName="+destName+"&naviBy=bus&key=1a5cdec55ebac9dbd85652429f54d4d1";
        }
    })

    .controller('ScheduleDetailController2',function($rootScope,$scope,$stateParams,$location,$state,$ionicLoading,$myHttpService,$interval){
        //标记是否购买
        $scope.mode = $stateParams.mode;
        //标记当前选中的标签
        $scope.tabIndex = 0;
        var map = null,drving = null;
        $scope.goSchedule = {};
        $scope.backSchedule = {};
        $scope.goLine = {};
        $scope.backLine = {};
        //标记展开收起状态
        $scope.expandStatus = false;
        var MapOperation = {
            //清空地图
            clearMap:function(){
                map.clearMap();
            },
            //添加点到地图上面
            addMarkers:function(buslines){
                for(var i = 0,len = buslines.length;i<len;i++){
                    var text = "<div class='marker station-marker'>"+i+"</div>";
                    if(i==0){
                        text="<div class='marker start-marker'>起</div>";
                    }else if(i==len-1){
                        text="<div class='marker stop-marker'>终</div>";
                    }
                    var marker = new AMap.Marker({
                        map: map,
                        position:new AMap.LngLat(buslines[i].lng,buslines[i].lat),
                        content:text,
                        extData:buslines[i],
                        draggable:false
                    });
                }
            },
            //添加路线到地图上面
            addPolyline:function(polyline){
                var polyline = new AMap.Polyline({
                    path: polyline,          //设置线覆盖物路径
                    strokeColor: "#3366FF", //线颜色
                    strokeOpacity: 1,       //线透明度
                    strokeWeight: 5,        //线宽
                    strokeStyle: "solid",   //线样式
                    strokeDasharray: [10, 5] //补充线样式
                });
                polyline.setMap(map);
                map.setFitView();
            },
            //调用高德地图进行路线规划
            drivingSearch:function(stations){
                $ionicLoading.show();
                var len = stations.length;
                if(len>1){
                    var startPoint = new AMap.LngLat(stations[0].stalongitude,stations[0].stalatitude);
                    var endPoint = new AMap.LngLat(stations[len-1].stalongitude,stations[len-1].stalatitude);
                    var waypoints = [];
                    for(var i=1;i<len-1;i++){
                        waypoints.push(new AMap.LngLat(stations[i].stalongitude,stations[i].stalatitude));
                    }
                    //绘图
                    drving.search(startPoint,endPoint,{waypoints:waypoints},function(){
                        $ionicLoading.hide();
                        //设置地图
                        map.setFitView();
                    });
                }else{
                    alert("读取线路数据出错");
                }
            }
        }
        $ionicLoading.show();
        $myHttpService.post("api/busline/queryCycleBusScheduleInfo",{
            bsid:$stateParams.bsid,
        },function(data){
            $scope.busSchedule = data.busSchedule;
            //对数据进行倒序
            var busStationsDesc = [];
            for(var i=data.busStations.length-1;i>=0;i--){
                busStationsDesc.push(data.busStations[i]);
            }
            console.log(busStationsDesc);
            $scope.busStations = busStationsDesc;
            //此处进行网络请求，并创建地图
            map = new AMap.Map("J_map_canvas",{
                zoom:14,
                animateEnable:false,
                center:[114.530266,30.498785]
            });
            /**
             * 设置地图工具条
             */
            AMap.plugin(['AMap.ToolBar'],
                function(){
                    map.addControl(new AMap.ToolBar({
                        offset:new AMap.Pixel(10,150)
                    }));
                });
            //设置驾车导航
            drving = new AMap.Driving({
                map: map
            });
            //完成数据封装
            //完成地图绘制
            //MapOperation.addMarkers( $scope.goSchedule.line.stations);
            MapOperation.drivingSearch($scope.busStations);
        });

        /*
         * 每隔10s请求
         * */
        var content="<div class='bus-image marker '></div>";
        var marker;
        $interval(function(){
                $myHttpService.postNoLoad('api/busrecord/queryBusRecord',{lineid:$scope.busSchedule.lineid},function(data){
                    /*接收数据*/
                    $scope.lnglat=data.currlonlat;
                    /*判断marker是否存在*/
                    if(!marker){
                        //创建一个地图对象
                        var marker = new AMap.Marker({
                            map: map,
                            position:$scope.lnglat.split(','),
                            content:content,
                            draggable:false
                        });
                    }else{
                        marker.setPosition($scope.lnglat.split(','));
                    }

                })
            },
            10000
        );





        $scope.baoming = function(){
            //检查用户的登陆情况，没有登录则跳转到登录页
            if($rootScope.session.user.userInfo==undefined){
                var url = encodeURIComponent("/schedule/detail?bsid="+$stateParams.bsid+"&mode=1");
                $location.url("/auth/login?url="+url);
            }else{
                $myHttpService.post("api/userEnrollBusline/userEnrollBusline",{
                    userid:$rootScope.session.user.userInfo.userid,
                    phone:$rootScope.session.user.userInfo.phone,
                    lineid:$scope.busSchedule.lineid,
                    bsid:$scope.busSchedule.bsid
                },function(data){
                    $location.url("/signup_success?bsid="+$stateParams.bsid);
                });
            }
        };
        $scope.oldIndex = 0;
        $scope.expand = function(){
            $scope.expandStatus=! $scope.expandStatus;
            if($scope.expandStatus==true){
                map.panBy(0,140);
            }else{
                map.panBy(0,-140);
            }

        }
        $scope.activeStations = function(index){
            $scope.busStations[$scope.oldIndex].active = false;
            $scope.busStations[index].active = true;
            $scope.oldIndex = index;
            map.setZoom(18);
            map.setCenter([$scope.busStations[index].stalongitude,$scope.busStations[index].stalatitude]);
            map.panBy(0,140);
        }
        $scope.showLocation = function(item){
            var dest = item.stalongitude+","+item.stalatitude;
            var destName = item.stationname;
            window.location.href = "http://m.amap.com/navi/?start=&dest="+dest+"&destName="+destName+"&naviBy=bus&key=1a5cdec55ebac9dbd85652429f54d4d1";
        }
    })





/**
 * 报名成功控制器
 */
    .controller('SignUpSuccessController',function($scope,$location,$state,$ionicLoading,$myHttpService){
        var wxConfig = {};
        $scope.tipStatus = false;
        //获取微信签名
        $myHttpService.post("api/utils/getWechatJsSign",{currenturl:window.location.href.split('#')[0]},function(data){
            wxConfig = {
                debug:false,
                appId:data.appId,
                timestamp:data.timestamp,
                nonceStr:data.nonceStr,
                signature:data.signature,
                jsApiList:['onMenuShareTimeline','onMenuShareAppMessage']
            },
                wx.config(wxConfig);
            wx.ready(function(){
                /* wx.onMenuShareAppMessage({
                 title: "畅巴线路报名分享测试", // 分享标题
                 desc: '畅巴线路报名分享测试描述', // 分享描述
                 link: 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5d18456bf1ece6b3&redirect_uri=http%3a%2f%2fwechat.happyev.com%2fgetUserInfoByCode%3freturn%3dapp%2fbuy&response_type=code&scope=snsapi_base&state=123#wechat_redirect', // 分享链接
                 type: 'link', // 分享类型,music、video或link，不填默认为link
                 success: function () {
                 layer.alert("你已分享成功！")
                 },
                 cancel: function () {
                 layer.msg("你取消了分享！")
                 // 用户取消分享后执行的回调函数
                 }
                 });*/
            });
        });
        $scope.share = function(){
            $scope.tipStatus = true;
        }
    })
/**
 月票控制器*/
    .controller('TicketMonthController',function($rootScope,$scope,$myHttpService){
        $scope.scheduleList = [];
        //定义请求状态
        $scope.requestStatus = false;
        $myHttpService.post("api/ticket/queryTicketsList",{
            userid:$rootScope.session.user.userInfo.userid
        },function(data){
            $scope.requestStatus = true;
            $scope.scheduleList = data.tickets;
        });
    })

/**
 用户信息编辑控制器
 */
    .controller('IUserController',function($rootScope,$scope,$location,$state,$myHttpService){
        $scope.user = {

        };
        $scope.tempUser = {};
        $myHttpService.post("api/user/queryUserinfo",{
            userid:$rootScope.session.user.userInfo.userid
        },function(data){
            $scope.user = data.user;
        });
        $scope.editMode = false;
        $scope.editButtonText = "编辑";
        $scope.edit = function(){
            if($scope.editMode==false){
                $scope.tempUser = $scope.user;
                $scope.editMode=!$scope.editMode;
                $scope.editButtonText = "保存";
            }else{
                $scope.editMode=!$scope.editMode;
                $scope.editButtonText = "编辑";
                //保存用户信息
                $myHttpService.post("api/user/modifyUserInfo",$scope.tempUser,function(data){
                    $scope.user = $scope.tempUser;
                    layer.msg("修改成功");
                });
            }

        }
    })
/**
 * 储值卡
 */
    .controller('TicketStoreController',function($rootScope,$scope,$interval,$myHttpService){
        $scope.cardInfo = {
            barcode:123456789012345678,
            refreshTime:15,
            refreshStatus:true
        }
        $myHttpService.post("api/user/queryUserBarcode",{
            userid:$rootScope.session.user.userInfo.userid
        },function(data){
            $scope.cardInfo.balance = data.user.balance;
            $scope.cardInfo.barcode = data.user.barcode;
            $scope.cardInfo.refreshStatus = false;
        });
        //定时刷新余票
        $interval(function(){
            $scope.cardInfo.refreshTime--;
            if($scope.cardInfo.refreshTime ==0&&$scope.cardInfo.refreshStatus==false){
                $scope.cardInfo.refreshStatus =true;
                $myHttpService.postNoLoad("api/user/queryUserBarcode",{
                    userid:$rootScope.session.user.userInfo.userid
                },function(data){
                    $scope.cardInfo.balance = data.user.balance;
                    $scope.cardInfo.barcode = data.user.barcode;
                    $scope.cardInfo.refreshStatus = false;
                    //重置计时器
                    $scope.cardInfo.refreshTime=15;
                });
            }
        },1000);
    })
/**
 **/
    .controller('TicketDetailController',function($rootScope,$scope,$interval,$myHttpService,$stateParams){
        $scope.ticket = {};
        $scope.barcode = 0;
        $scope.requestStatus = false;
        $scope.cardInfo = {
            refreshTime:9000,
            refreshStatus:true
        }
        $myHttpService.post("api/ticket/queryTicketInfo",{
            ticketid:$stateParams.ticketid
        },function(data){
            $scope.requestStatus=true;
            $scope.ticket = data.ticket;
            $scope.barcode = data.barcode;
            $scope.cardInfo.refreshStatus = false;
            $scope.ticket.startDate = new Date(data.ticket.startdate);
            $scope.ticket.endDate = new Date(data.ticket.enddate);
        });
        //定时刷新储值票
        $interval(function(){
            if($stateParams.ticketid){
                $scope.cardInfo.refreshTime--;
                if($scope.cardInfo.refreshTime ==0&&$scope.cardInfo.refreshStatus==false){
                    $scope.cardInfo.refreshStatus =true;
                    $myHttpService.postNoLoad("api/ticket/queryTicketInfo",{
                        ticketid:$stateParams.ticketid
                    },function(data){
                        $scope.ticket = data.ticket;
                        $scope.barcode = data.barcode;
                        $scope.ticket.startDate = new Date(data.ticket.startdate);
                        $scope.ticket.endDate = new Date(data.ticket.enddate);
                        $scope.cardInfo.refreshStatus = false;
                        //重置计时器
                        $scope.cardInfo.refreshTime=9000;
                    });
                }
            }
        },1000);
    })
    .controller('PayOrderListController',function($rootScope,$scope,$myHttpService,$ionicScrollDelegate){
        $scope.offset = 0;
        $scope.pagesize = 5;
        $scope.showMoreBtn = false;
        $scope.orderList = [];
        $myHttpService.post('api/recharge/queryRechargeOrders',{
            userid:$rootScope.session.user.userInfo.userid,
            offset:$scope.offset,
            pagesize:$scope.pagesize
        },function(data){
            if(data.rechargeOrders.length-$scope.pagesize==0){
                $scope.showMoreBtn  = true;
            }else{
                $scope.showMoreBtn  = false;
            }
            $scope.orderList = data.rechargeOrders;
        });
        $scope.getMoreData = function(){
            $scope.offset = $scope.offset+$scope.pagesize;
            $myHttpService.post('api/recharge/queryRechargeOrders',{
                userid:$rootScope.session.user.userInfo.userid,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                if(data.rechargeOrders.length-$scope.pagesize==0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.orderList = $scope.orderList.concat(data.rechargeOrders);
                $ionicScrollDelegate.resize();
            })
        }
        $scope.refresh = function(){
            $scope.offset = 0;
            $myHttpService.postNoLoad('api/recharge/queryRechargeOrders',{
                userid:$rootScope.session.user.userInfo.userid,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                if(data.rechargeOrders.length-$scope.pagesize==0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.orderList = data.rechargeOrders;
                layer.msg("刷新成功");
            });
        }
    })
    .controller('TicketRechargeController',function($rootScope,$scope,$myHttpService,$location){
        $scope.user = {
            rechargeNum:""
        }
        $scope.recharge = function(){
            $myHttpService.post("api/recharge/rebillUserBalance",{
                userid:$rootScope.session.user.userInfo.userid,
                openid:$rootScope.session.user.openId,
                chargefee:$scope.user.rechargeNum
            },function(data){
                function onBridgeReady(){
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest',
                        data,
                        function(res){
                            if(res.err_msg == "get_brand_wcpay_request:ok"){
                                //重新查询一次服务器
                                $myHttpService.post("api/recharge/verifyWxorderStatus",{
                                    rechargeid:data.rechargeid,
                                },function(data){
                                    alert("您本次成功充值了"+$scope.user.rechargeNum+"元");
                                    $location.url("/ticket/store").replace();
                                },function(data){
                                    alert("支付失败，请联系客服处理。");
                                });
                            }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                alert("你取消了本次支付");
                            }else{
                                alert("支付失败，请联系客服处理。");
                            }
                        }
                    );
                }
                if (typeof WeixinJSBridge == "undefined"){
                    if( document.addEventListener ){
                        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                    }else if (document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    }
                }else{
                    onBridgeReady();
                }
            });
        }
    })
    .controller('ScheduleTicketPay',function($rootScope,$scope,$location,$state,$stateParams,$myHttpService,$filter){
        /**
         * 计算两个日期之间的工作天数(包含当天)
         * @param String startDate 开始时间 // 2017-2-1
         * @param String endDate 结束时间 // 2017-2-3
         * @return Number workDays 开始时间到结束时间的工作日天数 // 3 
         */
        function getWorkDays(startDate, endDate) {
            var tmpStartDate = startDate.split('-');
            var tmpEndDate = endDate.split('-');
            var start = new Date(tmpStartDate[0], tmpStartDate[1] - 1, tmpStartDate[2]);
            var end = new Date(tmpEndDate[0], tmpEndDate[1] - 1, tmpEndDate[2]);
            var tolDays = ((end - start) / (1000*60*60*24)) + 1;
            var remain = tolDays % 7;
            var weekDay = start.getDay();
            var weekendDays = 0;
            for(var i = 0; i < remain; i ++) {
                var tmp = (weekDay + i) >= 7 ? (weekDay + i) % 7 : weekDay + i;
                if(tmp % 6 == 0 || tmp % 7 == 0) {
                    weekendDays ++;
                }
            }
            return tolDays - Math.floor(tolDays / 7) * 2 - weekendDays;
        }

        /**
         * 获得指定月份的天数
         * @param Number yy 年份 // 2018
         * @param Number mm 月份 // 2
         * @return Object {
         *      String startDate 当月开始时间 // 2018-2-1
         *      String enDate 当月结束时间 // 2018-2-28
         *      Number workDays 当月工作时间 // 20
         * }
         */
        function getMonthDate(yy, mm) {
            if(mm == 0){
                mm = 12;
                yy --;
            }
            var currentTime = new Date();
            var date = {
                startDate: yy + '-' + mm + '-' +'1', // 指定开始日期相当于format一个日期格式 yy-MM-dd
                endDate: yy + '-' + mm + '-' + new Date(yy, mm, 0).getDate(), //指定月的最后一天 yy-MM-dd
                current: currentTime.getFullYear() + '-' + (currentTime.getMonth() + 1) + '-' + currentTime.getDate(), // 当前yy-MM-dd时间
                monthstr: yy + '-' + mm
                // nextMonth: mm == 12 ? yy-1 + '-' + 1 : yy + '-' + mm
            }
            date.workDays = getWorkDays(date.startDate, date.endDate);
            date.remainDays = getWorkDays(date.current,date.endDate);
            console.log(date)
            return date;
        }
        //计算总价的函数
        function getTotalMoney(totalMoney,workDays,remainDays) {
            return (totalMoney /  workDays) * remainDays;
        }
        $scope.agreeStatus = true;
        $scope.agreeStatusChange = function(){
            $scope.agreeStatus = !$scope.agreeStatus;
        }
        //初始化当前页面的变量
        $scope.orderInfo = {
            payType:'0'
        }
        $scope.status  = false;
        //从服务器获取车票订单数据
        var dateObj = {}
        $myHttpService.post("api/busline/queryCycleBusSchedulePrice",{
            bsid:$stateParams.bsid,
        },function(data){
            console.log(data)
            $scope.orderInfo.linename =  data.busSchedule.linename;
            $scope.orderInfo.depart = data.busSchedule.departaddr;
            $scope.orderInfo.arrive = data.busSchedule.arriveaddr;
            $scope.orderInfo.plateNum = data.busSchedule.platenum;
            $scope.orderInfo.goDepartTime = data.busSchedule.departtime;
            $scope.orderInfo.backDepartTime = data.busSchedule.backDeparttime;
            //当月的开始时间和结束时间，来计算当月的工作时间
            $scope.orderInfo.startDate = data.startdate;
            $scope.orderInfo.endDate = data.enddate;
            //计算当前年月
            var date = new Date(data.startdate);
            $scope.orderInfo.year = date.getFullYear();
            $scope.orderInfo.month = date.getMonth();
            //获得一个format格式的时间字符对象
            $scope.dateObj = getMonthDate($scope.orderInfo.year, $scope.orderInfo.month);
            $scope.totalMoney = data.busSchedule.monthprice;
            $scope.totalDays = getMonthDate($scope.orderInfo.year, $scope.orderInfo.month+1).workDays;
            $scope.remainDays = $scope.dateObj.remainDays;
            $scope.remainMoney = Math.floor(($scope.totalMoney / $scope.dateObj.workDays) * $scope.dateObj.remainDays);
            $scope.status=true;
            $scope.orderInfo.total =  $scope.remainMoney;
        });
        $scope.$watch('orderInfo.monthTicketType',function(val){
            if(val == '1'){
                $scope.orderInfo.total =  $scope.remainMoney;
            }else {
                $scope.orderInfo.total =  $scope.totalMoney;
            }
        })
        $scope.submitOrder  = function(){
            $myHttpService.post("api/busline/buyMonthTicket",{
                userid:'2017050217325695014834',
                openid:'oMv4Svw0Ko3bz284wc1rjj73s4IE',
                bsid:$stateParams.bsid,
                // timestr: $filter('date')($scope.orderInfo.startDate,'yyyy-MM')
                timestr: $scope.dateObj.current + '&' + $scope.dateObj.endDate,
                workDays: $scope.dateObj.remainDays + '&' + $scope.dateObj.workDays,
                monthstr: $scope.dateObj.monthstr
            },function(data){
                function onBridgeReady(){
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest',
                        data,
                        function(res){
                            if(res.err_msg == "get_brand_wcpay_request:ok") {
                                //重新查询一次服务器
                                $myHttpService.post("api/recharge/verifyWxorderStatus",{
                                    rechargeid:data.rechargeid,
                                },function(data){
                                    $location.url("/ticket/pay_success?orderInfo="+JSON.stringify($scope.orderInfo)).replace();
                                },function(data){
                                    alert("支付失败，请联系客服处理。");
                                });
                            }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                alert("你取消了本次支付");
                            }else{
                                alert("支付失败，请联系客服处理。");
                            }
                        }
                    );
                }
                if (typeof WeixinJSBridge == "undefined"){
                    if( document.addEventListener ){
                        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                    }else if (document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    }
                }else{
                    onBridgeReady();
                }
            });
        }
    })
    .controller('ScheduleTicketPaySuccess',function($rootScope,$scope,$location,$state,$stateParams){
        $scope.orderInfo = JSON.parse($stateParams.orderInfo);
        $scope.showTicket = function(){
            $location.url('/ticket/month').replace();
        }
    })
/**充值2*/
    .controller('TicketRecharge2Controller',function($rootScope,$scope,$state,$stateParams,$myHttpService,$location){
        $scope.rechargeCouponList = [];
        $scope.agreeStatus = true;
        $scope.agreeStatusChange = function(){
            $scope.agreeStatus = !$scope.agreeStatus;
        }
        $scope.orderInfo = {
            rcid:"",
            payType:0,
            payMoney:0,
            couponMoney:0
        }
        var oldIndex = 0;
        //请求服务，获得充值优惠列表
        $myHttpService.post("api/rechargeCoupon/queryRechargeCouponList",{
            offset:0,
            pagesize:10
        },function(data){
            $scope.rechargeCouponList = data.rechargeCoupons;
            if(data.rechargeCoupons.length>0){
                //默认选中第一个
                $scope.orderInfo = {
                    rcid:data.rechargeCoupons[0].rcid,
                    payMoney:data.rechargeCoupons[0].paymoney,
                    couponMoney:data.rechargeCoupons[0].couponMoney,
                    rechargeMoney:data.rechargeCoupons[0].rechargeMoney,
                    hasCoupon:data.rechargeCoupons[0].hascoupon,
                    isActive:data.rechargeCoupons[0].isactive,
                    payType:0,
                }
                $scope.rechargeCouponList[0].active = true;
            }
        });
        //点击按钮切换
        $scope.changeCoupon = function(item,index){
            $scope.rechargeCouponList[oldIndex].active = false;
            item.active=true;
            //更新索引
            oldIndex = index;
            //更新当前选中的订单信息
            $scope.orderInfo = {
                rcid:item.rcid,
                payMoney:item.paymoney,
                couponMoney:item.couponMoney,
                rechargeMoney:item.rechargeMoney,
                hasCoupon:item.hascoupon,
                isActive:item.isactive,
                payType:0,
            }
        }
        //点击支付
        $scope.recharge = function(){
            $myHttpService.post("api/recharge/rebillUserBalanceCoupon",{
                userid:$rootScope.session.user.userInfo.userid,
                openid:$rootScope.session.user.openId,
                rcid:$scope.orderInfo.rcid
            },function(data){
                function onBridgeReady(){
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest',
                        data,
                        function(res){
                            if(res.err_msg == "get_brand_wcpay_request:ok") {
                                //重新查询一次服务器
                                $myHttpService.post("api/recharge/verifyWxorderStatus",{
                                    rechargeid:data.rechargeid,
                                },function(data){
                                    alert("您本次成功充值了"+$scope.orderInfo.rechargeMoney+"元");
                                    $location.url("/ticket/store").replace();
                                },function(data){
                                    alert("支付失败，请联系客服处理。");
                                });
                            }else if(res.err_msg == "get_brand_wcpay_request:cancel"){
                                alert("你取消了本次支付");
                            }else{
                                alert("支付失败，请联系客服处理。");
                            }
                        }
                    );
                }
                if (typeof WeixinJSBridge == "undefined"){
                    if( document.addEventListener ){
                        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                    }else if (document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    }
                }else{
                    onBridgeReady();
                }
            });
        }
    })
;
