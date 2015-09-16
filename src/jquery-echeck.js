/**
 * @author Ezios
 * @class check
 * @extends jquery-1.8.3
 * @markdown
 * #校验插件
 * 版本 1.2.3 日期 2015-4-13
 * 校验条件列表详见Config options
 *
 * 示例：
 * 在需要校验的表单元素上加上校验条件data-check属性， 如data-check="max-len:10"
 *
 *     @example
 *
 */
/**
 * @cfg data-check 校验条件
 *      <p>多个条件用 | 隔开</p>
 * @cfg [data-check.must] 必填项
 * @cfg [data-check.n] 仅为数字
 * @cfg [data-check.mobile] 手机号
 * @cfg [data-check.max-len] 最大长度
 *
 *      data-check="max-len: 10"
 * @cfg [data-check.max-char-len] 字符最大长度 区分汉字和英文
 *
 *      data-check="max-char-len: 10"
 * @cfg [data-check.min-len] 最小长度
 *
 *      data-check="min-len: 10"
 * @cfg [data-check.min-char-len] 字符最小长度 区分汉字和英文
 *
 *      data-check="min-char-len: 10"
 * @cfg [data-check.fit] 校验指定name值的表单元素的值是否与校验元素相同，例如确认密码
 *
 *      data-check="fit: account"
 * @cfg [data-check.scope] 数字区间限制
 *
 *      data-check="scope: 1-10"
 * @cfg [data-check.idcard] 身份证
 *
 *      data-check="idcard"
 * @cfg [data-check.url] url地址
 *
 *      data-check="url"
 * @cfg [data-check.email] 电子邮箱
 *
 *      data-check="email"
 * @cfg [data-check.ip] ip地址
 *
 *      data-check="ip"
 * @cfg [data-check.custom] 自定义验证函数
 *
 *      在表单元素上定义函数名
 *      data-check="custom: functionName"
 *      在window对象上添加新函数
 *      --$control 校验元素dom
 *      function functionName($control){
 *          //CODE
 *          return {
 *              //'验证是否通过的标志'
 *              flag: false,
 *              //'验证失败时显示的信息'
 *              message: '验证失败'
 *          };
 *      }
 *
 */
;(function($) {
    "use strict";

    //默认配置项
    var defaults = {
        //正常提示样式
        tipCls: 'form-tip',
        //错误提示样式
        errorTipCls: 'error-tip',
        //控件错误样式
        errorControlCls: 'error-control',
        //下拉列表样式
        selectCls: 'ui-selectbox',
        //错误提示html
        errorTipHtml: '<span class="{{errorTipCls}}">{{tipString}}</span>\n'
    };
    var opts = {};
    var checkMethods ={
        /*计算字符串长度 中文为2*/
        countCharacters: function(str) {
            var totalCount = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                    totalCount++;
                } else {
                    totalCount += 2;
                }
            }
            return totalCount;
        },
        /*是否为空*/
        isEmpty: function(val){
            if($.trim(val).length === 0){
                return true;
            }else{
                return false;
            }
        },
        /*是否为数字*/
        isNumeric: function(val){
            if(checkMethods.isEmpty(val)){
                return true;
            }
            if($.isNumeric(val)){
                return true;
            }else{
                return false;
            }
        },
        /*是否为手机号码*/
        isMobile: function(val){
            if(checkMethods.isEmpty(val)){
                return true;
            }
            return !!val.match(/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/);
        },
        /*是否为身份证*/
        isIdcard: function(val) {
            var Wi = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1 ];    // 加权因子
            var ValideCode = [ 1, 0, 10, 9, 8, 7, 6, 5, 4, 3, 2 ];            // 身份证验证位值.10代表X
            function idCardValidate(idCard) {
                idCard = trim(idCard.replace(/ /g, ""));               //去掉字符串头尾空格
                if (idCard.length == 15) {
                    return isValidityBrithBy15IdCard(idCard);       //进行15位身份证的验证
                } else if (idCard.length == 18) {
                    var a_idCard = idCard.split("");                // 得到身份证数组
                    if(isValidityBrithBy18IdCard(idCard) && isTrueValidateCodeBy18IdCard(a_idCard)){   //进行18位身份证的基本验证和第18位的验证
                        return true;
                    }else {
                        return false;
                    }
                } else {
                    return false;
                }
            }
            /**
             * @private
             * 判断身份证号码为18位时最后的验证位是否正确
             */
            function isTrueValidateCodeBy18IdCard(a_idCard) {
                var sum = 0;                             // 声明加权求和变量
                var valCodePosition = 0;
                if (a_idCard[17].toLowerCase() == 'x') {
                    a_idCard[17] = 10;                    // 将最后位为x的验证码替换为10方便后续操作
                }
                for ( var i = 0; i < 17; i++) {
                    sum += Wi[i] * a_idCard[i];            // 加权求和
                }
                valCodePosition = sum % 11;                // 得到验证码所位置
                if (a_idCard[17] == ValideCode[valCodePosition]) {
                    return true;
                } else {
                    return false;
                }
            }
            /** @private
              * 验证18位数身份证号码中的生日是否是有效生日
              */
            function isValidityBrithBy18IdCard(idCard18){
                var year =  idCard18.substring(6,10);
                var month = idCard18.substring(10,12);
                var day = idCard18.substring(12,14);
                var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));
                // 这里用getFullYear()获取年份，避免千年虫问题
                if(temp_date.getFullYear()!=parseFloat(year) ||temp_date.getMonth()!=parseFloat(month)-1 ||temp_date.getDate()!=parseFloat(day)){
                        return false;
                }else{
                    return true;
                }
            }
            /**
            * @private
            * 验证15位数身份证号码中的生日是否是有效生日
            */
            function isValidityBrithBy15IdCard(idCard15){
              var year =  idCard15.substring(6,8);
              var month = idCard15.substring(8,10);
              var day = idCard15.substring(10,12);
              var temp_date = new Date(year,parseFloat(month)-1,parseFloat(day));
              // 对于老身份证中的你年龄则不需考虑千年虫问题而使用getYear()方法
              if(temp_date.getYear()!=parseFloat(year) ||temp_date.getMonth()!=parseFloat(month)-1 ||temp_date.getDate()!=parseFloat(day)){
                        return false;
                }else{
                    return true;
                }
            }
            //去掉字符串头尾空格
            function trim(str) {
                return str.replace(/(^\s*)|(\s*$)/g, "");
            }

            if(checkMethods.isEmpty(val)){
                return true;
            }

            return idCardValidate(val);
        },
        /*是否为URL*/
        isUrl: function(val){
            if(checkMethods.isEmpty(val)){
                return true;
            }
            var regExp = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

            if(regExp.test(val)){
                return true;
            }else{
                return false;
            }
        },
        /*是否为电子邮箱*/
        isEmail: function(val){
            if(checkMethods.isEmpty(val)){
                return true;
            }
            var regExp = /^[a-z\d]+(\.[a-z\d]+)*@([\da-z](-[\da-z])?)+(\.{1,2}[a-z]+)+$/;

            if(regExp.test(val)){
                return true;
            }else{
                return false;
            }
        },
        /*是否为ip*/
        isIp: function(val){
            if(checkMethods.isEmpty(val)){
                return true;
            }
            var regExp = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

            if(regExp.test(val)){
                return true;
            }else{
                return false;
            }
        }
    };
    var checkValidate = {
        'must': function (val){
            if (checkMethods.isEmpty(val)) {
                return {
                    isPass: false,
                    msg: '该项不能为空'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'n': function (val) {
            if (!checkMethods.isNumeric(val)) {
                return {
                    isPass: false,
                    msg: '请输入数字'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'mobile': function (val) {
            if (!checkMethods.isMobile(val)) {
                return {
                    isPass: false,
                    msg: '请输入正确的手机号码'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'idcard': function (val) {
            if (!checkMethods.isIdcard(val)) {
                return {
                    isPass: false,
                    msg: '请输入正确的身份证号码'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'url': function (val) {
            if (!checkMethods.isUrl(val)) {
                return {
                    isPass: false,
                    msg: '请输入正确的URL地址'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'email': function (val) {
            if (!checkMethods.isEmail(val)) {
                return {
                    isPass: false,
                    msg: '请输入正确的电子邮箱'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'ip': function (val) {
            if (!checkMethods.isIp(val)) {
                return {
                    isPass: false,
                    msg: '请输入正确的ip地址'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'max-len': function (val, limit) {
            if (val.length > parseInt(limit)) {
                return {
                    isPass: false,
                    msg: '长度不能大于 ' + limit + ' 个字符'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'max-char-len': function (val, limit) {
            limit = parseInt(limit);

            if (checkMethods.countCharacters(val) > limit) {
                return {
                    isPass: false,
                    msg: '汉字不能大于' + limit / 2 + '个, 英文不能大于' + limit + '个'
                };
            }else{
                return {
                    isPass: true
                };
            }
        },
        'min-len': function (val, limit) {
            limit = parseInt(limit);

            if (checkMethods.isEmpty(val)) {
                return {
                    isPass: true
                };
            } else if (val.length < limit) {
                return {
                    isPass: false,
                    msg: '长度不能小于' + limit + '个字符'
                };
            } else {
                return {
                    isPass: true
                };
            }
        },
        'min-char-len': function (val, limit) {
            limit = parseInt(limit);

            if (checkMethods.isEmpty(val)) {
                return {
                    isPass: true
                };
            } else if (checkMethods.countCharacters(val) < limit) {
                return {
                    isPass: false,
                    msg: '汉字不能小于' + limit / 2 + '个, 英文不能小于' + limit + '个'
                };
            } else {
                return {
                    isPass: true
                };
            }
        },
        'fit': function (val, limit) {
            if ($('[name=' + limit + ']').val() !== val) {
                return {
                    isPass: false,
                    msg: '两次输入的内容不一致'
                };
            } else {
                return {
                    isPass: true
                };
            }
        },
        'scope': function (val, limit) {
            var scope = limit.split('-');
            var min = Math.min(scope[0], scope[1]);
            var max = Math.max(scope[0], scope[1]);

            val = parseInt(val);

            if (val < min || val > max) {
                return {
                    isPass: false,
                    msg: '请输入范围在' + min + ' - ' + max + ' 的数字'
                };
            } else {
                return {
                    isPass: true
                };
            }
        }
    };
    var methods = {
        /**
         * 初始化
         * @param  {Object} config 参数列表
         * @return {[type]}          [description]
         */
        init: function (config) {
            return this.each(function(index, el) {
                var checking = new Checking(this, config);
            });
        },
        /**
         * 校验
         * @return {[type]} [description]
         */
        checkAll: function() {
            var $dom = $me.find('[data-check]');

            $dom.trigger('focus').trigger('blur');
        },
        /**
         * 为指定元素设置校验
         * @param {Object} checkArray 校验对象
         * 示例：
         *
         *     $(this).check('setCheck', {
         *         check: '*',
         *         title: '账户名'
         *     });
         */
        setCheck: function(checkArray) {
            if ($(this).length) {
                $(this).attr({
                    'data-check': checkArray.check
                });
            }
        },
        /**
         * 移除校验
         * 示例：
         *
         *     $(this).check('removeCheck');
         */
        removeCheck: function() {
            if (this) {
                $(this).removeAttr('data-check');
            }
        },
        /**
         * 启用校验
         * 示例：
         *
         *     $(this).check('enabledCheck');
         */
        enabledCheck: function() {
            if (this) {
                $(this).removeAttr('data-ignore');
            }
        },
        /**
         * 禁用校验
         * 示例：
         *
         *     $(this).check('disabledCheck');
         */
        disabledCheck: function() {
            if (this) {
                $(this).attr('data-ignore', 'true');
            }
        }
    };

    //修复IE6不支持indexOf函数
    if (!Array.indexOf) {
        Array.prototype.indexOf = function(obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        };
    }
    //修复chrome自动填充无法获取值
    if (navigator.userAgent.toLowerCase().indexOf("chrome") >= 0) {
        $(window).load(function(){
            $('input:-webkit-autofill').each(function(){
                var text = $(this).val();
                var name = $(this).attr('name');
                $(this).after(this.outerHTML).remove();
                $('input[name=' + name + ']').val(text);
            });
        });
    }

    /**
     * 校验类
     */
    function Checking (dom, config) {
        //引用
        var me = this;

        //jquery对象
        me.$me = $(dom);
        //配置
        me.opts = $.extend(true, {}, defaults, config || {});
        //查找列表
        me.$checkList = me.$me.find('[data-check]');
        //循环 剥离出规则 附加在其上
        me.$checkList.each(function(index, el) {
            var $this = $(this);
            //校验规则数组
            var checkRules = $.trim($this.data('check')).split('|');
            //序列化校验规则数组
            var serializeRules = [];

            for (var j = 0, rulesLen = checkRules.length; j < rulesLen; j++) {
                //没有包含:的规则
                if (checkRules[j].toString().indexOf(':') === -1) {
                    serializeRules.push({
                        name: checkRules[j]
                    });
                } else {
                    //带参规则
                    var paramsRule = checkRules[j].split(':');

                    serializeRules.push({
                        name: $.trim(paramsRule[0]),
                        value: $.trim(paramsRule[1])
                    });
                }
            }

            //存储校验规则
            $this.data('checkRules', serializeRules);
            //绑定事件
            $this.bind('blur', me.opts , checkControl);
        });
    }

    /**
     * 验证控件
     */
    function checkControl (event) {
        /*jshint validthis:true*/
        var $this = $(this);
        var checkRules = $this.data('checkRules');
        var opts = event.data;
        var isPass = true;
        var controlMachine = {
            isPass: 'true',
            msg: [],
            transition: function (isPass, msg) {
                switch(isPass){
                    case 'true':
                        //校验通过
                        this.msg = [];
                        this.isPass = 'true';

                        //清除错误提示
                        $this.nextAll('[data-checktip]').remove();
                        //显示正常提示
                        $this.nextAll('.' + opts.tipCls).show();
                        //清除控件错误样式
                        $this.removeClass(opts.errorControlCls);

                        break;
                    case 'false':
                        //校验失败
                        var $errorTip = '';

                        this.isPass = 'false';
                        this.msg.push(msg);

                        //生成提示
                        $errorTip = $(tpl(opts.errorTipHtml, {
                            errorTipCls: opts.errorTipCls,
                            tipString: this.msg.join(' ')
                        }));

                        $errorTip.attr('data-checktip', 'true');

                        //清除之前的提示
                        $this.nextAll('[data-checktip]').remove();
                        //隐藏正常提示
                        $this.nextAll('.' + opts.tipCls).hide();

                        //显示提示
                        $this.addClass(opts.errorControlCls);
                        $this.parent().append($errorTip);

                        break;
                }
            }
        };

        for (var i = 0, len = checkRules.length; i < len; i++) {
            var rules = checkRules[i];

            if(checkValidate[rules.name]){
                var result = checkValidate[rules.name]($this.val(), rules.value);

                if(result.isPass === false){
                    controlMachine.transition('false', result.msg);
                    isPass = false;
                }
            }else{
                $.error('校验规则 ' + checkRules[i].name + ' 不存在');
            }
        }

        if(isPass === true){
            controlMachine.transition('true');
        }
    }

    function tpl(template, data) {
        return template.replace(/{{(\w*?)}}/g, function ($1, $2) {
            if(data[$2]){
                return data[$2];
            }else{
                return '';
            }
        });
    }

    $.fn.check = function(method){
        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || !method){
            return methods.init.apply(this, arguments);
        } else { //未找到参数指明的方法
            $.error('错误"' + method + '"方法未定义');
        }
    };
})(jQuery);