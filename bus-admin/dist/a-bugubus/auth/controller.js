app.controller("LoadingController",function($rootScope,$scope,$http,$state,$localStorage,$myHttpService){$myHttpService.get("auth/check",{},function(data){null==data?$state.go("auth.login"):($rootScope.session_user=data,$state.go("app.dashboard"))})}),app.controller("LoginController",function($rootScope,$scope,$state,$http,$resource,Base64,$localStorage,$myHttpService,md5){$scope.login=function(){var user={username:$scope.user.username,password:md5.createHash($scope.user.password)};$myHttpService.get("auth/login",{params:user},function(data){null!=data?($rootScope.session_user=data,$state.go("app.statistic.profit")):$scope.authError="用户名或密码错误"})}}),app.factory("Base64",function(){var keyStr="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";return{encode:function(input){var chr1,chr2,enc1,enc2,enc3,output="",chr3="",enc4="",i=0;do chr1=input.charCodeAt(i++),chr2=input.charCodeAt(i++),chr3=input.charCodeAt(i++),enc1=chr1>>2,enc2=(3&chr1)<<4|chr2>>4,enc3=(15&chr2)<<2|chr3>>6,enc4=63&chr3,isNaN(chr2)?enc3=enc4=64:isNaN(chr3)&&(enc4=64),output=output+keyStr.charAt(enc1)+keyStr.charAt(enc2)+keyStr.charAt(enc3)+keyStr.charAt(enc4),chr1=chr2=chr3="",enc1=enc2=enc3=enc4="";while(i<input.length);return output},decode:function(input){var chr1,chr2,enc1,enc2,enc3,output="",chr3="",enc4="",i=0,base64test=/[^A-Za-z0-9\+\/\=]/g;base64test.exec(input)&&window.alert("There were invalid base64 characters in the input text.\nValid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\nExpect errors in decoding."),input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");do enc1=keyStr.indexOf(input.charAt(i++)),enc2=keyStr.indexOf(input.charAt(i++)),enc3=keyStr.indexOf(input.charAt(i++)),enc4=keyStr.indexOf(input.charAt(i++)),chr1=enc1<<2|enc2>>4,chr2=(15&enc2)<<4|enc3>>2,chr3=(3&enc3)<<6|enc4,output+=String.fromCharCode(chr1),64!=enc3&&(output+=String.fromCharCode(chr2)),64!=enc4&&(output+=String.fromCharCode(chr3)),chr1=chr2=chr3="",enc1=enc2=enc3=enc4="";while(i<input.length);return output}}});