var httpProxy = require('../routes/http-proxy');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/login', function(req, res, next) {
  //设置权限检查禁止浏览器缓存数据
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  //进行登录
  httpProxy("/user/userLogin",req.body,function(data){
    req.session.user.userInfo = JSON.parse(data).data.user;
    res.send(data);
    res.end();
  },function(data){
    res.send(data);
    res.end();
  });
});
router.get('/check', function(req, res, next) {
  //设置权限检查禁止浏览器缓存数据
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  if(req.session.user==undefined){
    res.send({
      "code":0,
      "data":null
    });
  }else{
    res.send({
      "code":0,
      "data":req.session.user
    });
  }
});
router.get('/logout', function(req, res, next) {
  //设置权限检查禁止浏览器缓存数据
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", 0);
  req.session.user = undefined;
  res.send({
    "code":0,
    "data":null
  });
});
module.exports = router;
