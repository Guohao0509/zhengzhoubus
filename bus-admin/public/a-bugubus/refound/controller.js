/**
 * Created by Guohao on 2017/11/4.
 * 关于用户退款订单管理列表控制器
 */

app.controller('refoundListController',function($scope,$http,$myHttpService,$tableListService){
    var selected = false;
    $scope.selectAll = function(){
        selected = !selected;
        angular.forEach($scope.pageResponse.rows,function(item){
            item.selected = selected;
        });
    }
    //搜索分页选项
    var options={
        searchFormId:'J_reg_form',
        listUrl:"api/refundOrder/queryRefundOrderListByKeword"
    };
    $tableListService.init($scope, options);
    $tableListService.get();
    console.log($scope);


});