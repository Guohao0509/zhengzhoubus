/**
 * @author 周快
 * @date 2016-10-13
 * @version 1.0.0
 * @descriptions 针对排班管理的控制器
 */
app.controller('ScheduleEditController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    $scope.editMode = !!$stateParams.id;//检测有没有ID，判断当前是添加还是编辑，共用一套模板
    if($scope.editMode){
        //编辑模式
        $myHttpService.post("api/buslineSchedule/queryBuslineSchedule.htm",{bsid:$stateParams.id},function(data){
            $scope.schedule = data.buslineSchedule;
            $scope.route = data.busline;
            $scope.bus = data.car;
            $scope.driver = data.driver;
            var times =  $scope.schedule.departtime.split(':');
            $scope.schedule.departtimetemp = new Date(2001,01,01,times[0],times[1],00);
            var times2 =  $scope.schedule.arrivetime.split(':');
            $scope.schedule.arrivetimetemp = new Date(2001,01,01,times2[0],times2[1],00);
            var times3 =  $scope.schedule.backDeparttime.split(':');
            $scope.schedule.backDeparttimetemp = new Date(2001,01,01,times3[0],times3[1],00);
            var times4 =  $scope.schedule.backArrivetime.split(':');
            $scope.schedule.backArrivetimetemp = new Date(2001,01,01,times4[0],times4[1],00);
        });
    }else{
        //添加模式
        $scope.schedule  ={
            bsstatus:0,
            chargingtype:0,
            departtimetemp:new Date(2001,01,01,8,0,00),
            arrivetimetemp:new Date(2001,01,01,9,0,00),
            backDeparttimetemp:new Date(2001,01,01,18,0,00),
            backArrivetimetemp:new Date(2001,01,01,17,0,00),
        };
        //定义线路对象
        $scope.route = {};
        $scope.driver = {};
        $scope.bus = {};
    }
    //标记是否开启了线路编辑
    $scope.routeEditMode = false;
    $scope.driverEditMode = false;
    $scope.busEditMode = false;
    //点击线路编辑后会开启
    $scope.changeRouteToggle= function($rootScope){
        $scope.driverEditMode = false;
        $scope.busEditMode = false;
        $scope.routeEditMode= !$scope.routeEditMode;
        if($scope.routeEditMode){
            $tableListService.init($scope, {
                searchFormId:"J_search_form",
                listUrl:"api/busline/queryBuslineByKeyword.htm"
            });
            $tableListService.get();
        }
    }
    $scope.changeDriverToggle= function(){
        $scope.routeEditMode = false;
        $scope.busEditMode = false;
        $scope.driverEditMode= !$scope.driverEditMode;
        if($scope.driverEditMode){
            $tableListService.init($scope,{
                searchFormId:"J_search_form2",
                listUrl:"api/driver/queryDriversByKeyword.htm"
            });
            $tableListService.get();
        }

    }
    $scope.changeBusToggle= function(){
        $scope.routeEditMode = false;
        $scope.driverEditMode = false;
        $scope.busEditMode= !$scope.busEditMode;
        if($scope.busEditMode){
            $tableListService.init($scope,{
                searchFormId:"J_search_form3",
                listUrl:"api/car/queryCarlistByKeyword.htm"
            });
            $tableListService.get();
        }
    }
    //更换临时route
    $scope.changeRoute= function(item){
        console.log(item);
        $scope.route=item;
    }
    $scope.changeDriver= function(item){
        console.log(item);
        $scope.driver=item;
    }
    $scope.changeBus= function(item){
        console.log(item);
        $scope.bus=item;
    }
    $scope.submit  = function(){
        $scope.schedule.lineid = $scope.route.lineid;
        $scope.schedule.driverid = $scope.driver.driverid;
        $scope.schedule.carid =$scope.bus.carid;
        $scope.schedule.platenum = $scope.bus.platenum;
        $scope.schedule.departtime = $filter('date')($scope.schedule.departtimetemp,'HH:mm');
        $scope.schedule.arrivetime = $filter('date')($scope.schedule.arrivetimetemp,'HH:mm');
        $scope.schedule.backDeparttime = $filter('date')($scope.schedule.backDeparttimetemp,'HH:mm');
        $scope.schedule.backArrivetime = $filter('date')($scope.schedule.backArrivetimetemp,'HH:mm');
        if($scope.editMode){
            $myHttpService.post("api/buslineSchedule/updateBuslineSchedule.htm",$scope.schedule,function(data){
                layer.msg("修改成功！",{offset: '100px'})
            });
        }else{
            $myHttpService.post("api/buslineSchedule/insertBuslineSchedule.htm",$scope.schedule,function(data){
                layer.msg("添加成功！",{offset: '100px'})
                $state.go("app.schedule.add",{},{reload:true});
            });
        }

    }
});

app.controller('ScheduleListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    //全选
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.content,function(item){
            item.selected = selected;
        });
    }
    //搜索分页选项
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/buslineSchedule/queryBuslineScheduleByKeyword.htm"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    $scope.delete=function(item){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/buslineSchedule/deleteBuslineSchedule.htm",item,function(){
                $state.go("app.schedule.list",{},{reload: true});
                layer.msg("删除成功！",{offset: '100px'})
            });
        },function(index){
            layer.close(index);
        });

    }
});
