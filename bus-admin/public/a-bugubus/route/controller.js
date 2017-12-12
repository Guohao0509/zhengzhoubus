/**
 * @author 周快
 * @date 2016-10-09
 * @version 1.0.0
 * @descriptions 线路管理的控制器
 */
app.controller('RouteEditController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$myHttpService){
    $scope.editMode = !!$stateParams.id;
    var $sortable = $("#J_sortable").sortable();
    if($scope.editMode){
        $scope.buslineStations=[]
        //编辑模式
        $myHttpService.post("api/busline/queryBusline.htm",{"lineid":$stateParams.id},function(data){
            $scope.busline = data.busline;
            var stations = data.stations;
            for(var i = 0;i<stations.length;i++){
                $scope.buslineStations.push({
                    lineid:stations[i].lineid,
                    stationId:stations[i].stationid,
                    stationName:stations[i].stationname,
                    lng:stations[i].stalongitude,
                    lat:stations[i].stalatitude,
                    drivingTime:stations[i].drivingtime,
                })
            };
            window.setTimeout(function(){
                $scope.$apply();
                $sortable.sortable();
            });
            MapOperation.addMarkers($scope.buslineStations);
        });
    }else{
        //添加模式
        $scope.busline = {
            lineid:"",
            linename:"",
            runstatus:0,
            linetype:0,
            region:"武汉市",
            stationnum:0,
        }
        $scope.buslineStations = [];
    }
    $scope.tabs = [true,false]
    $scope.tab = function(index){
        for(var i= 0,len=$scope.tabs.length;i<len;i++){
            if(i!=index){
                $scope.tabs[i] = false;
            }else{
                $scope.tabs[i] = true;
            }
        }
    };
    $scope.changeRunStatus = function(){
        if($scope.busline.runstatus==0){
            $scope.busline.runstatus=1;
        }else{
            $scope.busline.runstatus=0;
        }
    }
    var MapOperation = {
        map:null,
        contextMenuPositon:null,
        contextMenu :null,
        createMap :function(){
            MapOperation.map = new AMap.Map('J_map_canvas', {
                zooms:[1,18],
                zoom:12,
                center: [114.3992493860, 30.5040608762]
            });
            MapOperation.contextMenu =  new AMap.ContextMenu();
            MapOperation.contextMenu.addItem("添加站点", function(e) {
                var len = $scope.buslineStations.length;
                closeEditMode(9999);
                var busline = {
                    "stationId":new Date().getTime()+""+ (Math.floor(Math.random () * 9000) + 1000),
                    "stationName":"新建站点  "+len,
                    "lng":MapOperation.contextMenuPositon.getLng(),
                    "lat":MapOperation.contextMenuPositon.getLat(),
                    "drivingTime":0,
                    "editMode":true,
                };
                if(len>1){
                    $scope.buslineStations.splice(len-1, 0, busline);
                }else{
                    $scope.buslineStations.push(busline);
                }
                MapOperation.addMarkers([busline]);
                $scope.$apply();
                $sortable.sortable();
                MapOperation.calcRouteLine();
            }, 0);
            MapOperation.contextMenu.addItem("放大一级", function() {
                MapOperation.map.zoomIn();
            }, 1);
            //右键缩小
            MapOperation.contextMenu.addItem("缩小一级", function() {
                MapOperation.map.zoomOut();
            }, 2);

            MapOperation.map.on('rightclick', function(e) {
                MapOperation.contextMenu.open(MapOperation.map, e.lnglat);
                MapOperation.contextMenuPositon = e.lnglat;
            });
        },
        addMarkers:function(buslines){
            for(var i = 0,len = buslines.length;i<len;i++){
                var text = "<div class='marker station-marker'>"+i+"</div>";
                if(i==0){
                    text="<div class='marker start-marker'>起</div>";
                }else if(i==len-1){
                    text="<div class='marker stop-marker'>终</div>";
                }
                var marker = new AMap.Marker({
                    map: MapOperation.map,
                    position:new AMap.LngLat(buslines[i].lng,buslines[i].lat),
                    content:text,
                    extData:buslines[i],
                    draggable:true
                });
                AMap.event.addListener(marker,"dragend",function(e){
                    //修改站点的坐标位置
                    for(var j= 0,len2=$scope.buslineStations.length;j<len2;j++){
                        var data = this.getExtData();
                        var lngLat = this.getPosition();
                        if(data.stationId==$scope.buslineStations[j].stationId){
                            closeEditMode(9999);
                            $scope.buslineStations[j].lng =lngLat.getLng();
                            $scope.buslineStations[j].lat = lngLat.getLat();
                            $scope.buslineStations[j].editMode = true;
                            $scope.$apply();
                            break;
                        }
                    }
                });
            }
        },
        calcRouteLine:function(){
            MapOperation.map.clearMap();
            MapOperation.addMarkers($scope.buslineStations);
        }
    }
    //定位到当前对象
    $scope.location = function(data){
        MapOperation.map.setCenter(new AMap.LngLat(data.lng,data.lat));
    }
    //更新排序
    $sortable.on("sortupdate",function(event){
        var temp = [];
        $sortable.children("li").each(function(index,item){
            temp.push(JSON.parse($(item).attr("data")));
        });
        //更新排序的站点
        $scope.buslineStations=temp;
        $scope.$apply();
        $sortable.sortable();
        MapOperation.calcRouteLine();
    });
    function closeEditMode(index){
        for(var i= 0,len=$scope.buslineStations.length;i<len;i++){
            if(i!=index){
                $scope.buslineStations[i].editMode = false;
            }
        }
    }

    MapOperation.createMap();

    //停靠点编辑
    $scope.edit = function(index){
        closeEditMode(index);
        $scope.buslineStations[index].editMode = !$scope.buslineStations[index].editMode;
    }
    //删除一个站点
    $scope.delete = function(index){
        //删除索引的数组
        $scope.buslineStations.splice(index,1);
        //清空地图
        $sortable.sortable();
        MapOperation.calcRouteLine();
    }
    $scope.save = function(){
        $scope.submit(true);
    }
    $scope.submit = function(saveMode){
        var len = $scope.buslineStations.length;
        if(len>1){
            var stations = [];
            for(var i=0;i<len;i++){
                stations.push({
                    stationid:$scope.buslineStations[i].stationId,
                    lineid:$scope.buslineStations[i].lineid,
                    stationname:$scope.buslineStations[i].stationName,
                    stalongitude:$scope.buslineStations[i].lng,
                    stalatitude:$scope.buslineStations[i].lat,
                    drivingtime:$scope.buslineStations[i].drivingTime,
                    serialno:i
                });
            }
            $scope.busline.stationnum =len;
            $scope.busline.departaddr = stations[0].stationname;
            $scope.busline.departlon = stations[0].stalongitude;
            $scope.busline.departlat =stations[0].stalatitude;
            $scope.busline.arriveaddr = stations[len-1].stationname;
            $scope.busline.arrivelon = stations[len-1].stalongitude;
            $scope.busline.arrivelat = stations[len-1].stalatitude;
            var data = {
                busline:$scope.busline,
                stations:stations
            }
            if($scope.editMode&&!saveMode){
                $myHttpService.post("api/busline/updateBuslineInfo.htm",{data:JSON.stringify(data)},function(){
                    layer.msg("修改成功！",{offset: '100px'})
                });
            }else{
                $myHttpService.post("api/busline/insertBusline.htm",{data:JSON.stringify(data)},function(){
                    layer.msg("添加成功！",{offset: '100px'})
                    $state.go("layout.route_add",{},{reload:true});
                });
            }

        }else{
            layer.alert("一条线路必须有一个起点和终点");
        }
    }
});
/**
 * 线路列表控制器
 */
app.controller('RouteListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    //全选
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.pageResponse.buslines,function(item){
            item.selected = selected;
        });
    }

    /*批量删除*/
    //$scope.deleteRow=function(){
    //    //获取选中的行数据
    //    for(var j =0;j<$scope.pageResponse.buslines.length;j++) {
    //        if ($scope.pageResponse.buslines[j].selected) {
    //            //封装charterid
    //            $scope.deletelineid = {
    //                lineid:$scope.pageResponse.buslines[j].lineid
    //            };
    //
    //            layer.confirm('您确定要删除选中的信息吗？', {icon: 3, title:'提示'},function(){
    //                //请求服务
    //                $myHttpService.post('api/busline/deleteBusline.htm',{lineid: $scope.deletelineid.lineid},function(data){
    //                    layer.msg("删除成功！", {offset: '100px'});
    //                    $state.go("app.charterbus.operationadmin", {}, {reload: true});
    //                });
    //            },function(index){
    //                layer.close(index);
    //            });
    //            return false;
    //        }else{layer.msg('请选择删除的信息')}
    //
    //    }
    //
    //};



    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/busline/queryBuslineByKeyword.htm"
    };



    $scope.delete=function(item){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/busline/deleteBusline.htm",item,function(){
                layer.msg("删除成功！",{offset: '100px'})
                $state.go("app.route.list",{},{reload: true});
            });
        },function(index){
            layer.close(index);
        });
    }
    $tableListService.init($scope, options);
    $tableListService.get();
});
/**

 * 线路列表控制器

 */

app.controller('RouteCreateListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
    //全选
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.pageResponse.buslines,function(item){
            item.selected = selected;
        });
    }
    var options = {
        searchFormId:"J_search_form",
        listUrl:"api/busline/queryApplyBuslinesByKeyword.htm"
    };
    $tableListService.init($scope, options);
    $tableListService.get();

});