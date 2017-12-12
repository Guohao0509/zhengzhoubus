"use strict";angular.module("ui.validate",[]).directive("uiValidate",function(){return{restrict:"A",require:"ngModel",link:function(scope,elm,attrs,ctrl){function apply_watch(watch){return angular.isString(watch)?void scope.$watch(watch,function(){angular.forEach(validators,function(validatorFn){validatorFn(ctrl.$modelValue)})}):angular.isArray(watch)?void angular.forEach(watch,function(expression){scope.$watch(expression,function(){angular.forEach(validators,function(validatorFn){validatorFn(ctrl.$modelValue)})})}):void(angular.isObject(watch)&&angular.forEach(watch,function(expression,validatorKey){angular.isString(expression)&&scope.$watch(expression,function(){validators[validatorKey](ctrl.$modelValue)}),angular.isArray(expression)&&angular.forEach(expression,function(intExpression){scope.$watch(intExpression,function(){validators[validatorKey](ctrl.$modelValue)})})}))}var validateFn,validators={},validateExpr=scope.$eval(attrs.uiValidate);validateExpr&&(angular.isString(validateExpr)&&(validateExpr={validator:validateExpr}),angular.forEach(validateExpr,function(exprssn,key){validateFn=function(valueToValidate){var expression=scope.$eval(exprssn,{$value:valueToValidate});return angular.isObject(expression)&&angular.isFunction(expression.then)?(expression.then(function(){ctrl.$setValidity(key,!0)},function(){ctrl.$setValidity(key,!1)}),valueToValidate):expression?(ctrl.$setValidity(key,!0),valueToValidate):(ctrl.$setValidity(key,!1),valueToValidate)},validators[key]=validateFn,ctrl.$formatters.push(validateFn),ctrl.$parsers.push(validateFn)}),attrs.uiValidateWatch&&apply_watch(scope.$eval(attrs.uiValidateWatch)))}}});