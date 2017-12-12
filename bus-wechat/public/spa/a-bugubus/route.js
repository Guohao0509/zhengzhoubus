angular.module('app', [
        'ionic',
        'ion-datetime-picker'
    ])
.run(function($rootScope,$ionicPlatform,$ionicPickerI18n,$rootScope,$location,$state) {
        //初始化页面相关的配置信息
    $rootScope.session = {
        user:window.global.config.user
    }
    $ionicPlatform.ready(function() {
        /**
         * date time picker选择器国际化
         * @type {string[]}
         */
        $ionicPickerI18n.weekdays = ["日", "一", "二", "三", "四", "五", "六"];
        $ionicPickerI18n.months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
        $ionicPickerI18n.ok = "确认";
        $ionicPickerI18n.cancel = "取消";
        $ionicPickerI18n.okClass = "button-positive";
        $ionicPickerI18n.cancelClass = "button-stable";
    });
        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
            if((toState.name.indexOf("create_route")!=-1
                ||toState.name.indexOf("i.")!=-1
                ||toState.name.indexOf("order.")!=-1
                ||toState.name.indexOf("bus_service_history")!=-1
                ||toState.name.indexOf("bus_service1")!=-1
                ||toState.name.indexOf("ticket.")!=-1)
                &&$rootScope.session.user.userInfo==undefined){
                event.preventDefault();//取消默认跳转行为
                //截取字符串
                var url = "/"+toState.name.replace('.','/');
                if(toStateParams){
                    var paramStr = "",i=0;
                    for(var key in toStateParams){
                        var value=toStateParams[key];
                        i>0&&value!=undefined?paramStr+= "&":'';
                        value!=undefined?paramStr+=key+"="+value:'';
                        i++;
                    }
                    if(paramStr!=""){
                        url = encodeURIComponent(url+="?"+paramStr);
                    }else{
                        url = encodeURIComponent(url);
                    }
                }
                $state.go("auth.login",{url:url},{location:'replace'});
                /*window.setTimeout(function(){
                    $state.go("auth.login",{url:url},{location:'replace'});
                    //$location.url("/auth/login?url="+url).replace();
                },0);*/
            }
             //console.log(toState.name);
        });
})
.config(
    function ($stateProvider,   $urlRouterProvider) {
        var basePath = "a-bugubus/";
        $urlRouterProvider
            .otherwise('/schedule_opened');
        $stateProvider
            .state('auth',{
                abstract: true,
                url:'/auth',
                template: '<div ui-view class="fadeInUp animated"></div>',
            })
            .state('auth.login',{
                //跳转到用户登录页面
                url:'/login?url',
                templateUrl:basePath+'tpl/login.html',
            })
            .state('select_location',{
                url:'/select_location/{params}/{status}',
                templateUrl:basePath+'tpl/select-location.html',
            })
            .state('select_address',{
                url:'/select_address/{params}',
                templateUrl:basePath+'tpl/select-address.html',
            })
            //发起新线路
            .state('create_route',{
                url:'/create_route?openid&java',
                templateUrl:basePath+'tpl/create-route.html',
            })
            //添加新线路成功
            .state('create_route_success',{
                url:'/create_route_success',
                templateUrl:basePath+'tpl/create-route-success.html'
            })
            //带开通班次列表
            .state('schedule_will_open',{
                url:'/schedule_will_open',
                templateUrl:basePath+'tpl/schedule-will-open.html'
            })
            //已开通班次列表
            .state('schedule_opened',{
                url:'/schedule_opened',
                templateUrl:basePath+'tpl/schedule-opened.html'
            })
            .state('ticket',{
                //乘车界面主目录，展示用户购买的车票，此目录下需要对用户进行权限过滤
                abstract: true,
                url:'/ticket',
                template: '<div ui-view class="fadeInUp animated"></div>',
            })
            .state('ticket.month',{
                //跳转到月票界面
                url:'/month',
                templateUrl:basePath+'tpl/ticket_month.html',
            })
            .state('ticket.pay',{
                //跳转到月票界面
                url:'/pay?bsid',
                templateUrl:basePath+'tpl/schedule-ticket-pay.html',
            })
            .state('ticket.detail',{
                //跳转到车票详情界面
                url:'/detail?ticketid',
                templateUrl:basePath+'tpl/ticket_detail.html',
            })
            .state('ticket.store',{
                //跳转到月票界面
                url:'/store',
                templateUrl:basePath+'tpl/ticket_store.html',
            })
            //班次主目录
            .state('schedule',{
                abstract: true,
                url:'/schedule',
                template:'<div ui-view class="fadeInUp animated"></div>',
            })
            //班次详情
            .state('schedule.detail',{
                //我的用户主目录 ids 表示需要在地图上显示的多个班次ID, buyMode表示是否显示购买按钮,0表示显示，1表示不显示
                url:'/detail?bsid&mode',
                templateUrl:basePath+'tpl/schedule-detail.html',
            })
            //班次详情
            .state('schedule.detail2', {
                //我的用户主目录 ids 表示需要在地图上显示的多个班次ID, buyMode表示是否显示购买按钮,0表示显示，1表示不显示
                url: '/detail2?bsid&mode',
                templateUrl: basePath + 'tpl/schedule-detail2.html',
            })
            //我的界面账户信息二级页面
            .state('i',{
                //我的用户主目录
                abstract: true,
                url:'/i',
                template:'<div ui-view class="fadeInUp animated"></div>',
            })
            //账户信息
            .state('i.user',{
                //我的用户主目录
                url:'/user',
                templateUrl:basePath+'tpl/i-user.html',
            })
            .state('signup_success',{
                //报名成功后跳转的页面
                url:'/signup_success?goBsid&backBsid',
                templateUrl:basePath+'tpl/signup-success.html',
            })
            //订单主目录
            .state('order',{
                abstract: true,
                url:'/order',
                template:'<div ui-view class="fadeInUp animated"></div>',
            })
            .state('order.list',{
                //报名成功后跳转的页面
                url:'/list',
                templateUrl:basePath+'tpl/pay-order-list.html',
            })
            .state('ticket.recharge',{
                //报名成功后跳转的页面
                url:'/recharge',
                templateUrl:basePath+'tpl/ticket_recharge.html',
            })
            .state('ticket.recharge2',{
                //跳转到第二充值页面
                url:'/recharge2',
                templateUrl:basePath+'tpl/ticket_recharge_2.html',
            })
            .state('ticket.pay_success',{
                //购票成功
                url:'/pay_success?orderInfo',
                templateUrl:basePath+'tpl/schedule-ticket-pay-success.html',
            })
            //包车服务
            .state('bus_service1',{
                //申请包车
                url:'/bus_service1',
                templateUrl:basePath+'tpl/bus_service_1.html',
            })
            //填写信息
            .state('bus_service_mess', {
                url:'/bus_service2?usermessobj',
                templateUrl:basePath+'tpl/bus_service_2.html',
            })
            //用户完整信息
            .state('bus_service_all',{
                url:'/bus_service_all?charterid&caseStatus',
                templateUrl:basePath+'tpl/bus_service_3.html',
            })

            /*提交成功界面*/
            .state('bus_submit_success',{
                url:'/bus_submit_success?charterid&caseStatus',
                templateUrl:basePath+'tpl/bus_service_success.html',
            })

            //包车订单的历史信息
            .state('bus_service_history',{
                url:'/bus_service_history',
                templateUrl:basePath+'tpl/bus_service_history.html'
            })
            //链接跳转的界面
            //.state('bus_href_success',{
            //    url:'/bus_href_success',
            //    templateUrl:basePath+'tpl/bus_href_success.html'
            //})
            //跳转支付界面
            .state('bus_service_pay',{
                url:'/bus_service_pay?totalfee&charterid',
                templateUrl:basePath+'tpl/bus_service_pay.html'
            })
    }
)
