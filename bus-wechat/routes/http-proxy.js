﻿/**
 * @author 周快
 * @date 2016-10-07
 * @version 1.0.0
 * @descriptions http代理请求类，可以将请求代理到其他服务器
 */
var httpProxy = function(url,data,success,error){
    var ng=require('nodegrass');
  
    //定义主机
    var host = "http://localhost:8080/bus/wechat"+url;
    var header ={
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    console.log("发起请求:\r\n"+host);
    
    console.log("请求参数:\r\n"+JSON.stringify(data));
    //logger.info("请求参数:\r\n"+JSON.stringify(data));
    var startTime = new Date().getTime();
    ng.post(host,function(data,status,hearders){
        console.log("请求耗时:"+(new Date().getTime()-startTime)+"ms");
        //logger.info("请求耗时:"+(new Date().getTime()-startTime)+"ms");
        console.log("返回数据:\r\n"+data);
        //logger.info("返回数据:\r\n"+data);
        if(status==200){
            success(data);
        }else if(status==404){
            error({"code":404,data:"应用服务器资源未找到"});
        }else if(status==500){
            error({"code":500,data:"应用服务器错误"});
        }else{
            error({"code":502,data:"请求网关错误"});
        }
    },header,data,'utf8').on('error', function(e){
        console.log(e);
        if(e.code=="ETIMEDOUT"){
            error({"code":502,data:"网关连接超时！"});
        }else if(e.code=="EHOSTUNREACH"){
            error({"code":502,data:"无法连接到服务器，请检查您的网络设置"});
        }else{
            error({"code":502,data:"请求网关错误！"});
        }
    });
}
module.exports = httpProxy;