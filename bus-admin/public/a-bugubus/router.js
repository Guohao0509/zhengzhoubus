/**
 * @author 周快
 * @date 2016-10-07
 * @version 1.0.0
 * @descriptions AngularJS的启动文件,AngularJs的路由配置文件
 */

app
    .run(
    //AngularJS启动的时候，运行如下配置
    function ($rootScope,$state,$stateParams,$localStorage,$http,$myHttpService) {
        //从本地的缓存中读取配置到session
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $localStorage.auth;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
            $rootScope.previousStateParams = fromParams;
        });
        //监听路由改变事件，每次路由改变，需要检查一下用户的权限，状态
        $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
            var urls = toState.name.split('.');
            //包含验证页面，则无需过滤，否则跳转到登录页
            if(urls.length>0&&urls[0]!="auth"&&$rootScope.session_user==undefined){
                $myHttpService.get("auth/check",{},function(data){
                    if(data==null){
                        $state.go('auth.login');
                    }else{
                        $rootScope.session_user = data;
                    }
                });
            }
        });
        //用户注销
        $rootScope.logout = function(){
            $myHttpService.get("auth/logout",{},function(data){
                $rootScope.session_user=undefined;
                $state.go('auth.login');
            });
        }
    }
)
.config(
    //AngularJS启动时顺便配置下面服务组件
    function ($stateProvider,   $urlRouterProvider) {
        var basePath = "a-bugubus/";
        //使用$urlRouterProvider来指定默认路由，默认路径必须通过系统自带的路由服务组件，系统路由不支持路由嵌套
        $urlRouterProvider
            .otherwise('/app/dashboard');
        //使用ui-router组件来进行路由
        $stateProvider
            .state('error',{
                abstract: true,
                url:'/error',
                template: '<div ui-view class="fade-in"></div>'
            })
            .state('error.404',{
                //显示加载中页面
                url:'/404',
                templateUrl:basePath+'error/404.html',
            })
            .state('auth',{
                abstract: true,
                url:'/auth',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load('a-bugubus/auth/controller.js');
                        }]
                }
            })
            .state('auth.loading',{
                //显示加载中页面
                url:'/loading',
                templateUrl:basePath+'auth/loading.html',
            })
            .state('auth.login',{
                //跳转到用户登录页面
                url:'/login',
                templateUrl:basePath+'auth/login.html',
            })
            .state('app', {
                //系统根目录
                abstract: true,
                url: '/app',
                templateUrl: basePath+'app.html',
            })
            .state('app.dashboard', {
                //跳转到系统主页
                url: '/dashboard',
                templateUrl: basePath+'dashboard.html',
                ncyBreadcrumb: {
                    label: '<i class="fa fa-home"></i> 首页'
                }
            })
            .state('app.driver',{
                abstract: true,
                url:'/driver',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load('a-bugubus/driver/controller.js');
                        }]
                }
            })
            .state('app.driver.list', {
                //跳转到司机管理界面
                url: '/list',
                templateUrl: basePath+'driver/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '司机列表'
                }
            })
            .state('app.driver.add', {
                //跳转到添加司机界面
                url: '/add',
                templateUrl: basePath+'driver/edit.html',
                ncyBreadcrumb: {
                    parent:'app.driver.list',
                    label: '添加司机'
                }
            })
            .state('app.driver.edit', {
                //跳转到编辑司机界面
                url: '/edit/{id}',
                templateUrl: basePath+'driver/edit.html',
                ncyBreadcrumb: {
                    parent:'app.driver.list',
                    label: '编辑司机'
                }
            })
            .state('app.driver.detail', {
                //跳转到司机详情界面
                url: '/detail/{id}',
                templateUrl: basePath+'driver/detail.html',
                ncyBreadcrumb: {
                    parent:'app.driver.list',
                    label: '司机详情'
                }
            })
            .state('app.route', {
                //线路列表，线路管理
                abstract: true,
                url:'/route',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'route/controller.js');
                        }]
                }
            })
            .state('app.route.list', {
                //跳转到司机详情界面
                url: '/list',
                templateUrl: basePath+'route/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '线路列表'
                }
            })


            .state('app.route.create_list', {
                //跳转到司机详情界面
                url: '/create_list',
                templateUrl: basePath+'route/create_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '线路报名'
                }
            })

            .state('layout', {
                abstract: true,
                url: '/layout',
                templateUrl: basePath+'a-blocks/layout.html',
                resolve: {
                    deps: ['uiLoad',
                        function( uiLoad ){
                            return uiLoad.load(
                                [
                                    basePath+'route/controller.js',
                                    'http://webapi.amap.com/maps?v=1.3&key=1a5cdec55ebac9dbd85652429f54d4d1&callback=init',
                                    'vendor/jquery/sortable/jquery.sortable.js'
                                ] );
                        }]
                }
            })
            .state('layout.route_add', {
                url: '/route_add',
                views: {
                    '': {
                        templateUrl: basePath+'route/edit.html'
                    },
                    'footer': {
                        templateUrl: basePath+'a-blocks/layout_footer_fullwidth.html'
                    }
                }
            })
            .state('layout.route_edit', {
                url: '/route_edit/{id}',
                views: {
                    '': {
                        templateUrl: basePath+'route/edit.html'
                    },
                    'footer': {
                        templateUrl: basePath+'a-blocks/layout_footer_fullwidth.html'
                    }
                }
            })
            .state('app.schedule', {
                //排班管理
                abstract: true,
                url:'/schedule',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'schedule/controller.js');
                    }]
                }
            })
            .state('app.schedule.list', {
                //跳转到排班管理
                url: '/list',
                templateUrl: basePath+'schedule/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '排班列表'
                }
            })
            .state('app.schedule.add', {
                //跳转到排班新增
                url: '/add',
                templateUrl: basePath+'schedule/edit.html',
                ncyBreadcrumb: {
                    parent:'app.schedule.list',
                    label: '添加排班'
                }
            })
            .state('app.schedule.edit', {
                //跳转到排班管理
                url: '/edit/{id}',
                templateUrl: basePath+'schedule/edit.html',
                ncyBreadcrumb: {
                    parent:'app.schedule.list',
                    label: '编辑排班'
                }
            })
            .state('app.bus', {
                //车辆管理
                abstract: true,
                url:'/bus',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'bus/controller.js');
                        }]
                }
            })
            .state('app.bus.list', {
                //跳转到车辆列表界面
                url: '/list',
                templateUrl: basePath+'bus/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '车辆列表'
                }
            })
            .state('app.bus.add', {
                //跳转到车辆添加界面
                url: '/add',
                templateUrl: basePath+'bus/edit.html',
                ncyBreadcrumb: {
                    parent:'app.bus.list',
                    label: '添加车辆'
                }
            })
            .state('app.bus.edit', {
                //跳转到车辆编辑界面
                url: '/edit/{id}',
                templateUrl: basePath+'bus/edit.html',
                ncyBreadcrumb: {
                    parent:'app.bus.list',
                    label: '编辑车辆'
                }
            })
            .state('app.bus.historical', {
                //跳转到车辆编辑界面
                url: '/historical',
                templateUrl: basePath+'bus/historical.html',
                ncyBreadcrumb: {
                    parent:'',
                    label: '轨迹回放'
                }
            })
            .state('app.trade', {
                //交易管理
                abstract: true,
                url:'/trade',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'trade/controller.js');
                        }]
                }
            })
            .state('app.trade.ticket_list', {
                //跳转到车辆列表界面
                url: '/ticket_list',
                templateUrl: basePath+'trade/ticket_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '车票列表'
                }
            })
            .state('app.trade.recharge_list',{
                url:'/recharge_list',
                templateUrl: basePath+'trade/recharge_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '充值列表'
                }
            })

            .state('app.user', {
                //用户管理
                abstract: true,
                url:'/user',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'user/controller.js');
                        }]
                }
            })

            .state('app.statistic', {
                //统计父目录
                abstract: true,
                url:'/statistic',
                template: '<div ui-view class="fade-in"></div>',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                            //延迟加载授权控制器
                            return $ocLazyLoad.load(basePath+'statistic/controller.js');
                        }]
                }
            })

            .state('app.statistic.profit',{
                //收益统计
                url:'/profit',
                templateUrl:basePath+'statistic/profit.html',
                ncyBreadcrumb:{
                    parent:'app.dashboard',
                    label:'收益统计'
                }
            })
            .state('app.user.user_list', {
                //跳转到用户管理界面
                url: '/user_list',
                templateUrl: basePath+'user/user_list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '用户管理'
                }
            })

            .state('app.charterbus',{
                /*包车管理父目录*/
                abstract:true,
                url:'/charterbus',
                template:'<div ui-view class="fade-in"></div>',
                resolve:{
                    deps:['$ocLazyLoad',
                        function($ocLazyLoad){
                            return $ocLazyLoad.load(basePath+'charterbus/controller.js');
                        }]
                }
            })
            .state('app.charterbus.operationadmin',{
                url:'/operationadmin',
                templateUrl:basePath+'charterbus/operationadmin.html',
                ncyBreadcrumb: {
                    parent:'app.charterbus',
                    label: '包车管理'
                }
            })
            .state('app.charterbus.edit',{
                url:'/edit/{charterid}',
                templateUrl:basePath+'charterbus/edit.html',
                ncyBreadcrumb: {
                    parent:'app.charterbus.operationadmin',
                    label: '包车服务'
                }

            })
            .state('app.refound',{
                /*包车管理父目录*/
                abstract:true,
                url:'/refound',
                template:'<div ui-view class="fade-in"></div>',
                resolve:{
                    deps:['$ocLazyLoad',
                        function($ocLazyLoad){
                            return $ocLazyLoad.load(basePath+'refound/controller.js');
                        }]
                }
            })
            .state('app.refound.list',{
                url:'/list',
                templateUrl:basePath+'refound/list.html',
                ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '退款记录列表'
                }
            })
    }
);