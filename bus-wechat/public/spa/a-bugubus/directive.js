/**
 * input自动聚焦指令，进入页面时会自动聚焦，触摸其他元素时自动失焦
 * 用法
 * <input type="text" focus-auto>
 */
app.directive('focusAuto', function($document) {
    return {
        link: function(scope, element, attrs) {
            element[0].id = "J_focus_auto_"+new Date().getTime();
            document.body.addEventListener('touchstart',function(e){
                if(e.target.id!=element[0].id){
                    element[0].blur();
                }
            });
            element[0].focus();
        }
    }
})
//=====
//生成条形码指令
//
app.directive('barcode',function($document){
    return {
        link:function(scope,element,attrs){
            var id = "J_barcode"+new Date().getTime();
            element[0].id = id;
            JsBarcode("#"+id,scope.$parent.$eval(attrs.ngModel));
            scope.$watch(attrs.ngModel,function(newValue,oldValue){
                JsBarcode("#"+id,newValue); //重新绘图
            })
        }
    }
});
// =====
//过滤器，字面量转义输出
//=====
app.filter('transfer',function(){
    return function(input,fieldName){
        if(fieldName==undefined){
            alert("变量名称不能为空");
        }else{
            //定义字面量
            var dict  = {
                sex:{
                    "0":"男",
                    "1":"女"
                },
                ticketStatus:{
                    "0":"车票已过期",
                    "1":"车票有效"
                }
            };
            return dict[fieldName][input];
        }

    }
});


