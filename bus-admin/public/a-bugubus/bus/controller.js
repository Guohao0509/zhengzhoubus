/**
 * @author 周快
 * @date 2016-10-13
 * @version 1.0.0
 * @descriptions 针对排班管理的控制器
 */
app.controller('BusEditController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$myHttpService){
    $scope.editMode = !!$stateParams.id;//检测有没有ID，判断当前是添加还是编辑，共用一套模板
    if($scope.editMode){//编辑模式
        $scope.bus = {
            carid:$stateParams.id
        };
        //获取车辆详情
        $myHttpService.post("api/car/queryCarinfo.htm",$scope.bus,function(data){
            $scope.bus = data.carinfo;
        });
        $scope.submit = function(){
            //提交表单到服务器地址
            $myHttpService.post("api/car/updateCarinfo.htm",$scope.bus,function(data){
                layer.msg("修改成功！",{offset: '100px'})
            });
        };
        $scope.delete=function(item){
            layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
                $myHttpService.post("api/car/deleteCarinfo.htm",item,function(){
                    layer.msg("删除成功！",{offset: '100px'});
                    window.setTimeout(function(){
                        $state.go("app.bus.list",{},{reload: true});
                    },1000);
                });
            },function(index){
                layer.close(index);
            });

        }
    }else{ //添加模式
        $scope.bus = {
            cartype:0
        };
        //防止网络环境糟糕时，表单重复提交
        $scope.submiting = false;
        //当前页面的错误
        //提交添加司机的表单
        $scope.submit = function(){
            $scope.submiting = true;
            //提交表单到服务器地址
            $myHttpService.post("api/car/insertCarinfo.htm",$scope.bus,function(data){
                $scope.submiting = false;
                layer.msg("添加成功！",{offset: '100px'});
                $state.go("app.bus.add",{},{reload:true});
            },function(){
                $scope.submiting = false;
            });
        }

    }

});
/**
 * 线路列表控制器
 */
app.controller('BusListController',function($rootScope,$scope,$http,$state,$localStorage,$stateParams,$filter,$tableListService,$myHttpService){
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
        listUrl:"api/car/queryCarlistByKeyword.htm"
    };
    $scope.delete=function(item){
        layer.confirm('您确定要删除吗？', {icon: 3, title:'提示'},function(){
            $myHttpService.post("api/car/deleteCarinfo.htm",item,function(){
                layer.msg("删除成功！",{offset: '100px'});
                window.setTimeout(function(){
                    $state.go("app.bus.list",{},{reload: true});
                },1000);
            });
        },function(index){
            layer.close(index);
        });

    }
    $tableListService.init($scope, options);
    $tableListService.get();
});
