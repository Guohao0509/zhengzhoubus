'use strict';

app
  .run(
      function ($rootScope,   $state,   $stateParams,$localStorage,$http) {
		  $http.defaults.headers.common['Authorization'] = 'Basic ' + $localStorage.auth;
          $rootScope.$state = $state;
          $rootScope.$stateParams = $stateParams;        
          $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            $rootScope.previousState = from;
            $rootScope.previousStateParams = fromParams;
          });
	}
  )
.config(
      function ($stateProvider,   $urlRouterProvider) {
          //使用$urlRouterProvider来指定默认路由，默认跳转到登录加载页面
          $urlRouterProvider
              .otherwise('/auth/loading');
          //使用ui-router组件来进行路由
          $stateProvider
              .state('auth',{//作为子页面的容器，下面的子页面会继承这里的scope信息
                  abstract: true,
                  url:'/auth',
                  template: '<div ui-view class="fade-in"></div>',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load('admin/auth/ctrl.js');
                      }]
                  }
              })
              .state('auth.loading',{
                  //显示加载中画面，实际上这个地方会进行用户是否登录的校验，如果用户登录，则会跳转到主页
                  url:'/loading',
                  templateUrl:'admin/auth/loading.html',
              })
              .state('auth.login',{
                  //登录页面，可以查看用户登录页面的相关登录代码
                  url:'/login',
                  templateUrl:'admin/auth/login.html',
              })
		  
              .state('app', {
                  abstract: true,
                  url: '/app',
                  templateUrl: 'admin/app.html',
              })
              .state('app.dashboard', {
                  url: '/dashboard',
                  templateUrl: 'admin/dashboard.html',
                  ncyBreadcrumb: {
                    label: '<i class="fa fa-home"></i> 首页'
                  }
              })
              .state('app.news', {
                  abstract: true,
                  url: '/news',
                  template: '<div ui-view class="fade-in"></div>',
                  resolve: {
                      deps: ['$ocLazyLoad',
                        function( $ocLazyLoad ){
                          return $ocLazyLoad.load('admin/news/ctrl.js');
                      }]
                  }
              })
              .state('app.news.list', {
                  url: '/list?page&search',
                  templateUrl: 'admin/news/list.html',
                  ncyBreadcrumb: {
                    parent:'app.dashboard',
                    label: '新闻列表',
                  }
              })
              .state('app.news.detail', {
                  url: '/detail/{id}',
                  templateUrl: 'admin/news/detail.html',
                  ncyBreadcrumb: {
                    parent:'app.news.list',
                    label: '编辑',
                  }
			  })

              .state('app.news.create', {
                  url: '/create',
                  templateUrl: 'admin/news/detail.html',
                  ncyBreadcrumb: {
                    parent:'app.news.list',
                    label: '新增',
                  }
              })
		}
  );
app.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
app.factory('AuthInterceptor', function ($rootScope, $q,$location) {
  return {
    responseError: function (response) {
        if(response.status==401)
        {
            $location.url('/auth/login');
        }
      return $q.reject(response);
    }
  };
})