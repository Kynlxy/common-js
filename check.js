/**
 * Created by kyn on 18/1/8
 * 验证总控制器
 * InputValidators  验证器
 * validationStrategies 验证法则
 */
//输入验证器
function InputValidators(){
    this.validators = [];
    this.strategies = {};
}

//添加验证方法
//参数:
//  rule: 验证策略字符串
//  errMsg: 验证失败时显示的提示信息
//  value: 被验证的值
InputValidators.prototype.addValidator = function(rule, errMsg, value) {
    var that = this;
    var ruleElements = rule.split(":");

    this.validators.push(function() {
        var strategy = ruleElements.shift();
        var params = ruleElements;
        params.unshift(value);
        params.unshift(errMsg);

        return that.strategies[strategy].apply(that, params);
    });
};

//添加验证策略函数
//参数:
//  name: 策略名称
//  strategy: 策略函数
InputValidators.prototype.addValidationStrategy = function(name, strategy){
    this.strategies[name] = strategy;
};

//从策略对象导入验证策略函数
//参数:
//  strategies: 包含各种策略函数的对象
InputValidators.prototype.importStrategies = function(strategies) {
    for(var strategyName in strategies) {
        this.addValidationStrategy(strategyName, strategies[strategyName]);
    }
};

//验证失败时，将相关的错误信息打包返回
//参数:
//   errMsg: 验证失败时的提示消息
//    value: 被验证的值
InputValidators.prototype.buildInvalidObj = function( errMsg, value){
    return {
        'value': value,
        'errMsg': errMsg
    };
};

//开始验证
InputValidators.prototype.check = function() {
    for(var i = 0, validator; validator = this.validators[i++];){
        var result = validator();
        if(result) {
            return result;
        }
    }
};

//验证策略对象，包含默认的验证策略函数
var validationStrategies = {
    //是否为空
    isNoEmpty: function( errMsg, value) {
        if(value === '') {
            return this.buildInvalidObj( errMsg, value );
        }
    },
    //最短值
    minLength: function( errMsg, value, length) {
        if(value.length < length){
            return this.buildInvalidObj( errMsg, value);
        }
    },
    //最长值
    maxLength: function( errMsg, value, length) {
        if(value.length > length){
            return this.buildInvalidObj( errMsg, value);
        }
    },
    //是否是Email
    isMail: function( errMsg, value, length) {
        var reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        if(!reg.test(value)){
            return this.buildInvalidObj(errMsg, value);
        }
    },
    //是否是手机号
    isMobile: function(errMsg,value){
        var reg = /^13[0-9]{9}$|14[0-9]{9}|15[0-9]{9}$|17[0-9]{9}$|18[0-9]{9}$/;
        if (value == '' || !reg.test(value)) {
            return this.buildInvalidObj(errMsg, value);
        }
    },
    //是否是身份证号码
    isIdCardNo: function(errMsg,value){
        if(value == '' || !/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/i.test(value)) {
            return this.buildInvalidObj(errMsg, value);
        }
    },
    //是否相同
    isEqual: function(errMsg,value1,value2){
        if (value1 !== value2) {
            return this.buildInvalidObj(errMsg, value1);
        }
    },
    //是否不相同
    notEqual: function(errMsg,value1,value2){
        if (value1 == value2) {
            return this.buildInvalidObj(errMsg, value1);
        }
    },
    //是否为真
    isTrue: function(errMsg,value){
        if (value == false){
            return this.buildInvalidObj(errMsg, value);
        }
    },
    isCompare: function(errMsg,value){
        if (value > 0){
            return this.buildInvalidObj(errMsg, value);
        }
    },
    isWeixin:function(errMsg) {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {

        } else {
            return this.buildInvalidObj(errMsg);
        }
    },
}
