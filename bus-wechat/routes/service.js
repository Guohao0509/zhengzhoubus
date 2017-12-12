app.service('$myLocationService',function($ionicLoading){
    var el =document.createElement('div');
    el.id = "map"+new Date().getTime();
    el.style="width:0;height:0";
    document.body.appendChild(el)
    var map, geolocation,geocoder;
    //加载地图，调用浏览器定位服务
    map = new AMap.Map(el.id, {
        resizeEnable: true
    });
    geocoder = new AMap.Geocoder({
        radius: 1000,
        city:'027',
        extensions: "all"
    });
    this.getCurrentPosition=function(callback){
        //$ionicLoading.show();
        /**
         * 获取用户的当前位置
         */
        map.plugin('AMap.Geolocation', function() {
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                convert:true
            });
            geolocation.getCurrentPosition();
            AMap.event.addListener(geolocation, 'complete', function(data){
                geocoder.getAddress(data.position, function(status, result) {
                    //$ionicLoading.hide();
                    // document.body.removeChild(el);
                    if (status === 'complete' && result.info === 'OK') {
                        if(result.regeocode.pois&&result.regeocode.pois.length>0){
                            callback(result.regeocode.pois);
                        }else{
                            callback([]);
                        }
                    }
                });
            });//返回定位信息
            AMap.event.addListener(geolocation, 'error', function(data){
                alert(JSON.stringify(data));
            });
        });
    };
    /**
     *根据经纬度获取附近的兴趣点列表
     */
    this.getPoisByLngLat = function(lngLat,callback){
        geocoder.getAddress(lngLat, function(status, result) {
            // document.body.removeChild(el);
            if (status === 'complete' && result.info === 'OK') {
                if(result.regeocode.pois&&result.regeocode.pois.length>0){
                    callback(result.regeocode.pois);
                }else{
                    callback([]);
                }
            }
        });
    }
    /**
     * 根据关键词返回兴趣点列表
     * @param address 关键词
     * @param callback
     */
    this.AddressByKeyword = function(keyword,callback){
        geocoder.getLocation(keyword, function(status, result) {
            console.log(status);
            if (status === 'complete' && result.info === 'OK') {
                console.log(result);
                if(result.geocodes.pois&&result.regeocode.pois.length>0){
                    //callback(result.regeocode.pois);
                }else{
                    //callback([]);
                }
            }
        });
    }
    //{city:"武汉",datatype:"poi"}
    this.getPoisByKeyword = function(keyword,callback){
        AMap.service(['AMap.Autocomplete'],function(){
            var auto = new AMap.Autocomplete({city:"武汉",datatype:"all"});
            if(keyword.length>0){
                auto.search(keyword,function(status,result){
                    if(status=="complete"){
                        callback(result.tips);
                    }else if(status=="no_data"){
                        callback([]);
                    }
                });
            }
        })
    }
})
    .service('$myHttpService',function($http,$ionicLoading){
        this.post = function(url,data,success,error){
            $ionicLoading.show();
            $http.post(url,data).success(function(data){
                $ionicLoading.hide();
                if(data.code==0){
                    success(data.data);
                }else{
                    var errorMsg = "";
                    if(data.data.msg){
                        errorMsg=data.data.msg;
                    }else{
                        errorMsg=data.data;
                    }
                    if(layer){
                        layer.alert(errorMsg);
                    }else{
                        alert(errorMsg);
                    }
                    if(error){
                        error(data.data);
                    }
                }
                //$scope.dt = $scope.driver.birthday;
            }).error(function(e){
                $ionicLoading.hide();
                if(layer){
                    layer.alert(e.message);
                }else{
                    alert(e.message);
                }
                if(error){
                    error(e);
                }
            });
        };
        this.postNoLoad = function(url,data,success,error){
            $http.post(url,data).success(function(data){
                if(data.code==0){
                    success(data.data);
                }else{
                    var errorMsg = "";
                    if(data.data.msg){
                        errorMsg=data.data.msg;
                    }else{
                        errorMsg=data.data;
                    }
                    if(layer){
                        layer.alert(errorMsg);
                    }else{
                        alert(errorMsg);
                    }
                    if(error){
                        error(data.data);
                    }
                }
                //$scope.dt = $scope.driver.birthday;
            }).error(function(e){
                if(layer){
                    layer.alert(e.message);
                }else{
                    alert(e.message);
                }
                if(error){
                    error(e);
                }
            });
        };
        this.get = function(url,data,success,error){
            $ionicLoading.show();
            $http.get(url,data).success(function(data){
                $ionicLoading.hide();
                if(data.code==0){
                    success(data.data);
                }else{
                    var errorMsg = "";
                    if(data.data.msg){
                        errorMsg=data.data.msg;
                    }else{
                        errorMsg=data.data;
                    }
                    if(layer){
                        layer.alert(errorMsg);
                    }else{
                        alert(errorMsg);
                    }
                    if(error){
                        error(data.data);
                    }
                }
                //$scope.dt = $scope.driver.birthday;
            }).error(function(e){
                $ionicLoading.hide();
                if(layer){
                    layer.alert(e.message);
                }else{
                    alert(e.message);
                }
                if(error){
                    error(e);
                }
            });
        }
    })
