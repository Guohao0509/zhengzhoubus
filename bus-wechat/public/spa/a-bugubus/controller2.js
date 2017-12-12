angular.module('app')
.controller('bus_service_1',function($rootScope,$scope,$state,$filter,$myLocationService,$location,$myHttpService,$stateParams){
    //新建三个个scope对象
    $scope.onewayformdata = {};
    $scope.backformdata={};
    $scope.thenerveformadata={};
    $scope.ioncheck={};


    /*绑定选项卡*/
    $scope.onTabSelected = function(index){
        $scope.charterType=index;
    };
    /*设定选择按钮默认值*/
    $scope.ioncheck.checked=false;

        /*获取selectstartaddr信息*/
        if($rootScope["startLocation"]){
            var data = $rootScope["startLocation"];
            $scope.startLocation=data.name;
            $scope.startLocationlnglat=data.lngLat;

        }else{
            $myLocationService.getCurrentPosition(function(data){
                if(data.length>0){
                    var data=data[0];
                    $rootScope["startLocation"]={
                        name:data.name,
                        lngLat:data.location.lng+","+data.location.lat

                    }
                    $scope.startLocation=data.name;
                    $scope.startLocationlnglat=data.location.lng+","+data.location.lat;

                    $scope.$apply();
                }else{
                    $scope.startLocation = "无法获取你的位置";
                    $scope.startLocationlnglat = "0,0";
                    $scope.$apply();
                }
            });
        }
        if($rootScope["endLocation"]){
            var data = $rootScope["endLocation"];
            $scope.endLocation=data.name;
            $scope.endLocationlnglat=data.lngLat;
        }
        $scope.selectLocation = function(params,status){
            $state.go("select_location",{params:params,status:status});
        }

    /*datapickers*/
    $scope.onewayformdata = {
        StartTime:"出发时间",
        charterStartTime:new Date(),
        EndTime:"结束时间",
        charterEndTime:new Date(),

    };
    $scope.backformdata = {
        StartTime:"出发时间",
        charterStartTime:new Date(),
        EndTime:"结束时间",
        charterEndTime:new Date(),

    };
    $scope.thenerveformadata = {
        StartTime:"出发时间",
        charterStartTime:new Date(),
        EndTime:"结束时间",
        charterEndTime:new Date(),

    };

    /*封装参数*/
    $scope.gotobusservice3=function(startLocation,endLocation){
        /*获取用户id*/
        $scope.userid=$rootScope.session.user.userInfo.userid;
        var usermessobj={};
        /*判断选择的那个表单*/
        if($scope.charterType==1){
            usermessobj={
                userid:$scope.userid,
                startLocation:startLocation,
                startLoLa:$scope.startLocationlnglat,
                endLocation:endLocation,
                endLoLa:$scope.endLocationlnglat,
                charterType:$scope.charterType,
                needInfo:$scope.ioncheck.checked,
                charterStartTime : $filter('date')($scope.onewayformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
                charterEndTime:$filter('date')($scope.onewayformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
                charterCount:$scope.onewayformdata.charterCount,
            };

        }else if($scope.charterType==2){
            usermessobj={
                userid:$scope.userid,
                startLocation:startLocation,
                startLoLa:$scope.startLocationlnglat,
                endLocation:endLocation,
                endLoLa:$scope.endLocationlnglat,
                charterType:$scope.charterType,
                needInfo:$scope.ioncheck.checked,
                charterStartTime : $filter('date')($scope.backformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
                charterEndTime:$filter('date')($scope.backformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
                charterCount:$scope.backformdata.charterCount,
            };

        }else if($scope.charterType==3){
            usermessobj={
                userid:$scope.userid,
                startLocation:startLocation,
                startLoLa:$scope.startLocationlnglat,
                endLocation:endLocation,
                endLoLa:$scope.endLocationlnglat,
                charterType:$scope.charterType,
                needInfo:$scope.ioncheck.checked,
                charterStartTime :$filter('date')($scope.thenerveformadata.charterStartTime,'yyyy-MM-dd HH:mm'),
                charterEndTime:$filter('date')($scope.thenerveformadata.charterEndTime,'yyyy-MM-dd HH:mm'),
                charterCount:$scope.thenerveformadata.charterCount,
            };
        }

        var chartercount =/[^\d]/g;
        if(usermessobj.endLocation==undefined||usermessobj.endLocation==""){
            layer.msg("请输入目的地");
            return;
        }else if(chartercount.test(usermessobj.charterCount)) {
            layer.msg("请输入正确的乘车人数");
            return;
        }

        $scope.formtime={
            oneformstartdate:$filter('date')($scope.onewayformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
            oneformendtime:$filter('date')($scope.onewayformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
            twoformstartdate:$filter('date')($scope.backformdata.charterStartTime,'yyyy-MM-dd HH:mm'),
            twoformendtime:$filter('date')($scope.backformdata.charterEndTime,'yyyy-MM-dd HH:mm'),
            thereformstartdate:$filter('date')($scope.thenerveformadata.charterStartTime,'yyyy-MM-dd HH:mm'),
            thereformendtime:$filter('date')($scope.thenerveformadata.charterEndTime,'yyyy-MM-dd HH:mm')
        };
        /*判断用户输入的时间是否正确*/
        var time= new Date();
        var month=time.getMonth()+1;
        var day=time.getDate();
        var hours=time.getHours();
        var min = time.getMinutes();

        if(month<10){
            month = '0'+month;
        }
        if(day<10){
            day='0'+day;
        }
        if(hours<10){
            hours='0'+hours;
        }
        if(min<10){
            min='0'+min;
        }
        var windowdate=time.getFullYear()+'-'+month+'-'+day+' '+hours+':'+min;


        if(usermessobj.charterType==1){
            if($scope.formtime.oneformstartdate>$scope.formtime.oneformendtime){
                layer.msg('结束时间不能小于开始时间');
                return false;
            }else if($scope.formtime.oneformstartdate==$scope.formtime.oneformendtime){
                layer.msg('请输入正确的时间');
                return false;
            }else if($scope.formtime.oneformstartdate<windowdate){
                layer.msg('出发时间已经过了哦');
                //layer.msg($scope.formtime.oneformstartdate+"----"+windowdate);
                return false;
            }else if($scope.formtime.oneformendtime<windowdate) {
                layer.msg('结束时间已经过了哦');
                return false;
            }
        }else if(usermessobj.charterType==2){
            if($scope.formtime.twoformstartdate>$scope.formtime.twoformendtime){

                layer.msg('结束时间不能小于开始时间');
                return false;
            }else if($scope.formtime.twoformstartdate==$scope.formtime.twoformendtime){
                layer.msg('请输入正确的时间');
                return false;
            }else if($scope.formtime.twoformstartdate<windowdate){
                layer.msg('出发时间已经过了哦');
                return false;
            }else if($scope.formtime.twoformendtime<windowdate){
                layer.msg('结束时间已经过了哦');
                return false;
            }
        }else if(usermessobj.charterType==3){
            if($scope.formtime.thereformstartdate>$scope.formtime.thereformendtime){
                layer.msg('结束时间不能小于开始时间');
                return false;
            }else if($scope.formtime.thereformstartdate==$scope.formtime.thereformendtime){
                layer.msg('请输入正确的时间');
                return false;
            }else if($scope.formtime.thereformstartdate<windowdate){
                layer.msg('出发时间已经过了哦');
                return false;
            }else if($scope.formtime.thereformendtime<windowdate){
                layer.msg('结束时间已经过了哦');
                return false;
            }
        }

        //usermessobj.needInfo=usermessobj.needInfo==true?1:2;

        $state.go('bus_service_mess',{usermessobj:JSON.stringify(usermessobj)});
    };


})
    /*完善信息*/
    .controller('bus_service_2',function($rootScope,$scope,$state,$myHttpService){
        $scope.argee=true;
        $scope.agreeChange=function(){
            $scope.argee = !$scope.argee;
        }

        /*处理用户选择的类型*/
        $scope.usermesschartype={
            1:'单程',
            2:'往返',
            3:'包天'
        };
        $scope.needinfotype={
            true:'需要司机',
            false:'不需要司机'
        }

        /*处理接受的对象*/
        $scope.usermessobj=JSON.parse($state.params.usermessobj);
        $scope.usermessobj.charterCount=parseInt($scope.usermessobj.charterCount);

        /*接收第二个页面的值提交后台服务*/

        $scope.buservice=function(){
            var info=/^[\u4e00-\u9fa5]{2,4}$/;
            if($scope.usermessobj.commName==undefined){
                layer.msg("请输入联系人昵称");
                return false;
            }else if(!info.test($scope.usermessobj.commName)){

                layer.msg('请输入正确的联系人昵称');
                return false;
            };

            var tellinfo=/^1[34578]\d{9}$/;
            if($scope.usermessobj.commMobile==undefined||$scope.usermessobj.commMobile=="") {
                layer.msg("请输入联系方式");
                return false;
            }else if(!tellinfo.test($scope.usermessobj.commMobile)){
                layer.msg('请输入正确的联系方式');
                return false;
            };
            console.log($scope.usermessobj.repInfo);
             if($scope.usermessobj.repInfo != undefined&&$scope.usermessobj.repInfo !=''){
                 if($scope.usermessobj.repInfo.length>100){
                     layer.msg("输入内容长度不能超过100个字,请重新输入");
                     return false;
                 }
             }
                 $myHttpService.post('api/charterOrder/newCharterCase',$scope.usermessobj,function(data){
                         /*提交成功后跳转到成功的页面*/
                         $state.go("bus_submit_success",{charterid:data.charterid,caseStatus:data.caseStatus},{location:'replace'});
                         //$location.path("/bus_submit_success",{charterid:data.charterid,caseStatus:data.caseStatus}).replace();
                     }
                 );

        }
    })
    /*获取单个数据信息*/
    .controller('bus_service_all',function($scope, $http, $myHttpService,$stateParams,$state,$rootScope){
        $scope.caseStatus=$state.params.caseStatus;
        $scope.usercharteridmess={
            charterid:$state.params.charterid
        };
        /*根据用户的id请求服务器再次查询状态信息*/
        $myHttpService.post('api/charterOrder/CharterCaseDetails',$scope.usercharteridmess,function(data){
            /*获取相关信息,进行格式转换*/
           $scope.usermess={
               userid:data.userid,
               startLocation:data.startLocation,
               endLocation:data.endLocation,
               charterStartTime:data.charterStartTime,
               charterEndTime:data.charterEndTime,
               charterCount:data.charterCount,
               charterType:data.charterType,
               commName:data.commName,
               commMobile:data.commMobile,
               reqInfo:data.reqInfo,
               caseStatus:data.caseStatus,
               totalfee:data.totalfee,
               needInfo:data.needInfo
           };
            console.log(JSON.stringify(data));
        });

        //判断类型
        $scope.charterTypestaus={
            1:'单程',
            2:'往返',
            3:'包天'
        };
        //判断用户状态
        $scope.usercaseStatus={
            1:'待审核',
            2:'审核失败',
            3:'未支付',
            4:'支付失败',
            5:'已支付',
            6:'已完成'
        };
        $scope.needinfostaus={
            true:'需要司机',
            false:'不需要司机'
        };

        /*给未支付或者支付状态按钮赋予事件*/
        //{chargefee:$scope.newpay.chargefee,rechargeid:$scope.newpay.rechargeid}
           $scope.pay=function() {
               if($scope.usermess.caseStatus == '1'){
                   layer.msg('请等待管理员审核');
               }
               else if($scope.usermess.caseStatus == '3'||$scope.usermess.caseStatus=='4'){
                   $state.go('bus_service_pay',{totalfee:$scope.usermess.totalfee,charterid:$scope.usercharteridmess.charterid}).replace();
                }else if($scope.usermess.caseStatus=='5'||$scope.usermess.caseStatus=='6'){
                   layer.msg('此订单已完成');
               }
            }

    })

    /*charter充值*/
    .controller('charterpayController',function($scope,$myHttpService,$rootScope,$location,$state){
        /*接收上一个界面传过来的值*/
        $scope.totalfee=$state.params.totalfee;
        $scope.charterid=$state.params.charterid;
        $scope.nextpay = function(){
            $myHttpService.post('api/payOrder/newPayCase',{
                charterid: $scope.charterid,
                userid:$rootScope.session.user.userInfo.userid,
                openid:$rootScope.session.user.userInfo.openid
            },function(data){
                function onBridgeReady(){
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest',
                        data,
                        function(res){
                            if(res.err_msg == "get_brand_wcpay_request:ok") {
                                //重新查询一次服务器
                                $myHttpService.post("api/payOrder/verifyWxorderStatus",{
                                    rechargeid:data.rechargeid
                                },function(data){
                                    alert("您本次成功充值了"+$scope.totalfee+"元");
                                    $location.url("/bus_service_history").replace();
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

    /*提交成功后跳转的界面*/
    .controller('bus_submit_success',function($scope,$location,$state){
        $scope.caseStatus=$state.params.caseStatus;
        $scope.charterid=$state.params.charterid;
        $scope.querystuts=function(){
            $state.go('bus_service_all',{caseStatus:$scope.caseStatus,charterid:$state.params.charterid}).replace();
        }
    })

    /*获取历史数据信息列表*/
    .controller('bus_service_history',function($scope,$http,$myHttpService,$rootScope,$stateParams,$location,$ionicScrollDelegate,$state) {
        $scope.userallmess= [];
        $scope.offset = 0;
        $scope.pagesize = 20;
        $scope.count = 0;
        $scope.showMoreBtn = false;
        $scope.getData = function(){
            $myHttpService.post('api/charterOrder/queryOrderRecords',{
                userid: $rootScope.session.user.userInfo.userid,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum= data.totalnum;
                /*更改状态*/
                $scope.queryusertype={
                    1:'单程',
                    2:'往返',
                    3:'包天'
                };
                $scope.queryuserstaus={
                    1:'待审核',
                    2:'审核失败',
                    3:'未支付',
                    4:'支付失败',
                    5:'已支付',
                    6:'已完成'
                };
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.userallmess = data.body;
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
                //$scope.$apply();
            })
        };
        /*查看用户详情*/
        $scope.bus_service_all=function(item){
            $state.go('bus_service_all',{
                charterid:item.charterid,
                caseStatus:item.caseStatus
            });
        };

        $scope.getData();
        $scope.refresh = function () {
            $scope.offset = 0;
            $myHttpService.postNoLoad('api/charterOrder/queryOrderRecords', {
                //runstatus: 1,
                userid: $rootScope.session.user.userInfo.userid,
                offset: $scope.offset,
                pagesize: $scope.pagesize
            }, function (data) {
                $scope.totalnum = data.totalnum;
                if ($scope.totalnum - ($scope.offset + $scope.pagesize) > 0) {
                    $scope.showMoreBtn = true;
                } else {
                    $scope.showMoreBtn = false;
                }
                $scope.$broadcast("scroll.refreshComplete");
                $scope.userallmess = data.body;
                window.setTimeout(function () {
                    $ionicScrollDelegate.resize();
                }, 0);
                layer.msg("刷新成功");
                //$scope.$apply();
            })
        };

        $scope.getMoreData = function(){
            $scope.offset = $scope.offset+$scope.pagesize;
            $myHttpService.post('api/charterOrder/queryOrderRecords',{
                userid: $rootScope.session.user.userInfo.userid,
                offset:$scope.offset,
                pagesize:$scope.pagesize
            },function(data){
                $scope.totalnum = data.totalnum;
                if($scope.totalnum-($scope.offset+$scope.pagesize)>0){
                    $scope.showMoreBtn  = true;
                }else{
                    $scope.showMoreBtn  = false;
                }
                $scope.userallmess = $scope.userallmess.concat(data.body);
                window.setTimeout(function(){
                    $ionicScrollDelegate.resize();
                },0);
            })
        }
    });



