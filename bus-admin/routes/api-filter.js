var httpProxy = require('../routes/http-proxy');
var filter = function(req,res,next){
  //检查用户登录情况
  if(req.session.user==undefined){
    res.send({"code":401,"data":"权限不足，用户未登录"})
    res.end();
  }else{
    //获取完整目录名
    var url = req.originalUrl;//var url = req._parsedUrl.pathname;  截取完整目录名
    //截取请求网关后的目录名
    var serviceUrl =url.substring(4,url.length);
    httpProxy(serviceUrl,req.body,function(data){
      res.send(data);
      res.end();
    },function(data){
      res.send(data);
      res.end();
    });

  }
}
module.exports = filter;
