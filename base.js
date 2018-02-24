/**
 * Created by kyn on 18/2/23.
 */
var BaseControl = {
    ajax: function (options) {
        /**
         * 传入方式默认为对象
         * */
        options = options || {};
        /**
         * 默认为GET请求
         * */
        options.type = (options.type || "GET").toUpperCase();
        /**
         * 返回值类型默认为json
         * */
        options.dataType = options.dataType || 'json';
        /**
         * 默认为异步请求
         * */
        options.async = options.async || true;
        /**
         * 对需要传入的参数的处理
         * */
        var params = this.getParams(options.data);
        var xhr;
        /**
         * 创建一个 ajax请求
         * W3C标准和IE标准
         */
        if (window.XMLHttpRequest) {
            /**
             * W3C标准
             * */
            xhr = new XMLHttpRequest();
        } else {
            /**
             * IE标准
             * @type {ActiveXObject}
             */
            xhr = new ActiveXObject('Microsoft.XMLHTTP')
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                var status = xhr.status;
                if (status >= 200 && status < 300) {
                    options.success && options.success(xhr.responseText, xhr.responseXML);
                } else {
                    options.fail && options.fail(status);
                }
            }
        };
        if (options.type == 'GET') {
            xhr.open("GET", options.url + '?' + params, options.async);
            xhr.send(null)
        } else if (options.type == 'POST') {
            /**
             *打开请求
             * */
            xhr.open('POST', options.url, options.async);
            /**
             * POST请求设置请求头
             * */
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            /**
             * 发送请求参数
             */
            xhr.send(params);
        }
    },
    getParams: function (data) {
        var arr = [];
        for (var param in data) {
            arr.push(encodeURIComponent(param) + '=' + encodeURIComponent(data[param]));
        }
        // console.log(arr);
        arr.push(('randomNumber=' + Math.random()).replace('.'));
        // console.log(arr);
        return arr.join('&');
    },
    getParam: function (b) {
        var c = document.location.search;
        if (!b) {
            return c
        }
        var d = new RegExp("[?&]" + b + "=([^&]+)", "g");
        var g = d.exec(c);
        var a = null;
        if (null != g) {
            try {
                a = decodeURIComponent(decodeURIComponent(g[1]))
            } catch (f) {
                try {
                    a = decodeURIComponent(g[1])
                } catch (f) {
                    a = g[1]
                }
            }
        }
        return a;
    },
    /**
     * 根据dom对象 数据源和 属性进行内容渲染
     */
    SetItemDom: function (_dom, json, k) {
        //front:前缀  back :后缀  format:是否格式化为千分位 len :显示长度 showstart 是截取字符串开始位置  default:默认填充文字 当数据对象为空时
        var _front = '', _back = '', _format = "0", _len = 0, _default = "";

        if (_dom.tagName == 'A') {
            var _href = decodeURI(_dom.getAttribute('href'));
            while (_href.indexOf('{' + k + '}') > 1) {
                _len++;
                _href = _href.replace('{' + k + '}', json[k]);
            }

            if (_len) {
                _dom.setAttribute('href', _href);
                _dom.setAttribute('ishaveK', 1);
            }
        } else if (_dom.tagName == 'IMG') {
            var _src = decodeURI(_dom.getAttribute('src'));
            if (typeof json[k] == "string" && (json[k].substr(0, 8) == 'https://' || json[k].substr(0, 7) == 'http://')) {
                _src = json[k];
                _len++;
            } else {
                while (_src.indexOf('{' + k + '}') >= 0) {
                    _src = _src.replace('{' + k + '}', json[k]);
                    _len++;
                }
            }

            if (_len) {
                _dom.setAttribute('src', _src);
                _dom.setAttribute('ishaveK', 1);
            }
        }
        if (_dom.getAttribute('ishaveK') == 1) return;
        ;  // 说明上面的代码以及处理过了，后续不需要再处理
        _back = _dom.getAttribute('kattr');         // _back 这个时候是需要高修改的属性的名称
        if (_back) { // 如果是要设置属性，那么这里替换属性中的数值即可
            _front = _dom.getAttribute('kval');
            if (!_front)
                _front = _dom.getAttribute(_back);
            while (_front.indexOf('{' + k + '}') != -1) {
                _front = _front.replace('{' + k + '}', json[k]);
            }
            if (_back == 'src' && typeof json[k] == "string" && (json[k].substr(0, 8) == 'https://' || json[k].substr(0, 7) == 'http://')) _front = json[k];
            _dom.setAttribute(_back, _front);
            _dom.setAttribute('ishaveK', 1);
        } else {
            if (_dom.tagName == 'SELECT') {
                _dom.value = json[k].toString();
                //兼容页面k.a 与k_a的情况
                if (_dom.id.split('.').length == 2) {
                    if (document.getElementById(_dom.id.replace(".", "_")))
                        document.getElementById(_dom.id.replace(".", "_")).value = _dom.value;
                }
            } else if ((_dom.type === 'text' || _dom.type === 'hidden') && typeof _dom.value === 'string') {
                _dom.value = json[k].toString();
                //兼容页面k.a 与k_a的情况
                if (_dom.id.split('.').length == 2) {
                    if (document.getElementById(_dom.id.replace(".", "_")))
                        document.getElementById(_dom.id.replace(".", "_")).value = _dom.value;
                }
            } else if (_dom.tagName == 'INPUT' && typeof _dom.checked === 'boolean') {
                if (_dom.value == json[k]) _dom.checked = true; else _dom.checked = false;
                //兼容页面k.a 与k_a的情况
                if (_dom.id.split('.').length == 2) {
                    if (document.getElementById(_dom.id.replace(".", "_")))
                        document.getElementById(_dom.id.replace(".", "_")).checked = _dom.checked;
                }
            } else if (typeof _dom.innerHTML !== 'undefined') {
                _front = _dom.getAttribute('front'); // 显示的前缀
                _back = _dom.getAttribute('back'); // 显示的后缀
                _len = _dom.getAttribute('showlen');
                _format = _dom.getAttribute('format');
                _default = _dom.getAttribute("default");
                if (!_front) _front = '';
                if (!_back) _back = '';
                if (!_default) _default = '';
                if (!_format) _format = '0';
                if (!_len) _len = 0;
                _len = _len * 1;
                if (_len) {
                    var _start = _dom.getAttribute('showstart');
                    _start = _start * 1;
                    if (!_start) _start = 0;   // showstart 是截取字符串开始位置
                    _dom.innerHTML = _front + json[k].toString().substr(_start, _len) + _back;
                    //兼容页面k.a 与k_a的情况
                    if (_dom.id.split('.').length == 2) {
                        if (document.getElementById(_dom.id.replace(".", "_")))
                            document.getElementById(_dom.id.replace(".", "_")).innerHTML = _dom.innerHTML;
                    }
                } else {
                    var _s = json[k].toString();

                    _len = _dom.getAttribute('ooqfw');
                    if (_len && _len != '' && !isNaN(_len)) {
                        //_s = moneyStr3(_s, parseInt(_len), '');
                        //_len = parseInt(_len.substr(2));
                        //if (_len) sprintf("%" + _len + "s", _s);
                        if (!isNaN(_s)) {
                            _s = Number(_s).toFixed(Number(_len));
                            if (Number(_len) > 0 && _s.indexOf(".") == -1) _s += ".00";
                        }
                    }
                    if (_format * 1 && !isNaN(_s)) {
                        //需要格式化
                        _s = Number(_s).toLocaleString();
                        if (_s.indexOf(".") == -1) _s += ".00";
                    }

                    //自动填充内容
                    if (_default.length > 0 && (!_s || _s.length == 0)) {
                        _s = _default;
                    }
                    _dom.innerHTML = _front + _s + _back;
                    //兼容页面k.a 与k_a的情况
                    if (_dom.id.split('.').length == 2) {
                        if (document.getElementById(_dom.id.replace(".", "_")))
                            document.getElementById(_dom.id.replace(".", "_")).innerHTML = _front + _s + _back;
                    }
                }
            }
        }
    },
    /**
     * 根据json数据内每一个层级的数据对象去页面内对应查找ID元素进行赋值
     */
    SetItemToK_Id: function (json, _pre) {
        if (!_pre) _pre = 'k.';
        for (var k in json) {
            if (json[k] == null) json[k] = '';
            if (typeof json[k] === 'string' || typeof json[k] === 'number') {
                var _dom = document.getElementById(_pre + k);   // 如果存在同 key 同名的 dom 对象  getElementById 只能获得第一个
                if (!_dom && json[k].toString().length < 20) {
                    _dom = document.getElementById(_pre + k + '_' + json[k]);   // 特殊用法用来处理 radio box的情况
                }
                if (!_dom) _dom = document.getElementById('k_' + k);  // 为了兼容老的

                if (_dom) {
                    if (_dom.getAttribute('ismore') == '1') {
                        var _d = $("[id='" + _dom.id + "']", document); // 这里针对有多个 id 相同的情况处理一下
                        if (_d.length > 1) {
                            //_d.html(json[k].toString());
                            for (var i = 1; i < _d.length; i++) {
                                this.SetItemDom(_d[i], json, k);
                            }
                        }
                    }
                    this.SetItemDom(_dom, json, k);
                } else if (!_dom && !isNaN(json[k] * 1)) {
                    _dom = document.getElementsByName(k + '[]');   // 这个情况是 checkbox 按位与的情况
                    if (_dom) {
                        for (var i = 0; i < _dom.length; i++) {
                            if (typeof _dom[i].checked === 'boolean') {
                                if (_dom[i].value & json[k]) {
                                    _dom[i].checked = true;
                                } else {
                                    _dom[i].checked = false;
                                }
                            }
                        }
                    }
                }
            } else if (json[k] && typeof json[k] === 'object') {
                //** 注意 这里跳过了数组，不去遍历数组能节约大量时间，这里一直是效率的瓶颈
                if (json[k] instanceof Array) {
                } else this.SetItemToK_Id(json[k], _pre + k + '.');
            }
        }
    },
    isWeixin: function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 写入cookies
     * @param key 键
     * @param val 值
     * @param day 存放多少天
     */
    setCookies: function (key, val, day) {
        //获取当前日期
        var expiresDate = new Date();
        //设置生存期，一天后过期
        expiresDate.setDate(expiresDate.getDate() + (day ? day : 1));
        document.cookie = key + "=" + val + ";expires= " + expiresDate.toGMTString();//标记已经访问了站点
    },
    /**
     * 获取cookies
     * @param key
     */
    getCookies: function (key) {
        var search = key + "=";
        var returnvalue = "";
        if (document.cookie.length > 0) {
            offset = document.cookie.indexOf(search);
            if (offset != -1) {
                // 已经存在cookies内
                offset += search.length;
                // set index of beginning of value
                end = document.cookie.indexOf(";", offset);
                // set index of end of cookie value
                if (end == -1)
                    end = document.cookie.length;
                returnvalue = unescape(document.cookie.substring(offset, end));
            }
        }
        return returnvalue;
    },
    /**
     * 删除cookies
     * @param key
     */
    delCookies: function (key) {
        //获取当前日期
        var expiresDate = new Date();
        //设置生存期，一天后过期
        expiresDate.setDate(expiresDate.getDate() - 100);
        document.cookie = key + "=" + val + ";expires= " + expiresDate.toGMTString();//标记已经访问了站点
    },
    /**
     * 清空所有cookies
     */
    delAllCookies: function () {
        //获取所有的cookies key
        var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
        if (keys) {
            for (var i = keys.length; i--;) {
                this.delCookies(keys[i]);
            }
        }
    },
    /**
     * 时间戳格式化为X天X小时X分X秒 的字符串形式
     * @param sec(long long int) :时间戳
     * @param targetId（string):显示容器id
     * @returns {*}
     */
    timeFormat: function (sec, targetId) {
        var _formatStr = "", _oldSec = sec;
        if (sec <= 0) {
            _formatStr = '已过期';
            document.getElementById(targetId).innerHTML = _formatStr;
            return;
        }
        var _day = Math.floor(sec / (24 * 3600));
        if (_day)_day = _day + '天'; else _day = '';
        var _hour = Math.floor((sec % (24 * 3600)) / 3600);
        if (_hour)_hour = _hour + '小时'; else _hour = '';
        var _min = Math.floor((sec % 3600) / 60);
        if (_min)_min = _min + '分'; else _min = '';
        var _sec = Math.floor(sec % 60);
        _sec = '<font color=red>' + _sec + '</font>' + '秒';
        _formatStr = _day + _hour + _min + _sec;
        document.getElementById(targetId).innerHTML = _formatStr;
        setTimeout(function () {
            BaseControl.timeFormat(--_oldSec, targetId);
        }, 1000);
    },
    /**
     * 公用处理数据---格式化金额  保留2位小数 千分位逗号
     * @param {type} number
     * @param {type} decimals
     * @param {type} thousands_sep
     * @param {type} dec_point
     * @param {type} roundtag  舍入参数，默认 "round" 四舍五入 ,"ceil" 向上取,"floor"向下取,
     * @returns {unresolved}
     */
    priceFormat: function (number, decimals, thousands_sep, dec_point, roundtag) {
        /*
         * 参数说明：
         * number：要格式化的数字
         * decimals：保留几位小数
         * dec_point：小数点符号
         * thousands_sep：千分位符号
         * roundtag:舍入参数，默认 "round" 四舍五入 ,"ceil" 向上取,"floor"向下取,
         * */
        //if(!number) return 0.00*1;
        number = (number + '').replace(/[^0-9+-Ee.]/g, '');
        roundtag = roundtag || "round"; //"ceil","floor","round"
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function (n, prec) {
                var s = n.toString();
                var sArr = s.split(".");
                var m = 0;
                try {
                    m += sArr[1].length;
                } catch (e) {
                }

                if (prec > m) {
                    return s;
                    /*'' + Number(s.replace(".", "")) / Math.pow(10, m);*/
                } else {
                    sArr[1] = Math[roundtag](Number(sArr[1]) / Math.pow(10, m - prec));
                    while (sArr[1].toString().length < prec) {
                        sArr[1] = '0' + sArr[1];
                    }
                    return sArr.join('.');
                }
            };
        s = (prec ? toFixedFix(n, prec) : '' + Math.floor(n)).split('.');
        var re = /(-?\d+)(\d{3})/;
        while (re.test(s[0])) {
            s[0] = s[0].replace(re, "$1" + sep + "$2");
        }

        if ((s[1] || '').length < prec) {
            s[1] = s[1] || '';
            s[1] += new Array(prec - s[1].length + 1).join('0');
        }
        return s.join(dec);
    },
    /**
     * 公用处理数据---格式化金额  保留2位小数 千分位逗号
     * @param {type} number
     * @param {type} decimals
     * @param {type} thousands_sep
     * @param {type} dec_point
     * @param {type} roundtag  舍入参数，默认 "round" 四舍五入 ,"ceil" 向上取,"floor"向下取,
     * @returns {unresolved}
     */
    priceFormatIng: function (number, decimals, thousands_sep, dec_point, roundtag) {
        /*
         * 参数说明：
         * number：要格式化的数字
         * decimals：保留几位小数
         * dec_point：小数点符号
         * thousands_sep：千分位符号
         * roundtag:舍入参数，默认 "round" 四舍五入 ,"ceil" 向上取,"floor"向下取,
         * */
        //if(!number) return 0.00*1;

        number = (number + '').replace(new RegExp(',', 'gm'), '');
        number = (number + '').replace(/[^0-9+-Ee.]/g, '');
        roundtag = roundtag || "round"; //"ceil","floor","round"
        var first = (number + '').substr(0, 1);
        if (first == '-' || first == '+') {
            number = (number + '').substr(1);
        }
        var n = !isFinite(+number) ? 0 : number,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
            dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
            s = '',
            toFixedFix = function (n, prec) {
                var s = n.toString();
                var sArr = s.split(".");
                var m = 0;
                try {
                    m += sArr[1].length;
                } catch (e) {
                }

                if (prec > m) {
                    return s;
                    /*'' + Number(s.replace(".", "")) / Math.pow(10, m);*/
                } else {
                    sArr[1] = Math[roundtag](Number(sArr[1]) / Math.pow(10, m - prec));
                    while (sArr[1].toString().length < prec) {
                        sArr[1] = '0' + sArr[1];
                    }
                    return sArr.join('.');
                }
            };
        s = (prec ? toFixedFix(n, prec) : '' + Math.floor(n)).split('.');
        var re = /(-?\d+)(\d{3})/;
        while (re.test(s[0])) {
            s[0] = s[0].replace(re, "$1" + sep + "$2");
        }
        if (!s[1]) {
            if (number.substr(-1, 1) == ".") {
                s[1] = '';
            }
        }

        /*if ((s[1] || '').length < prec) {
         s[1] = s[1] || '';
         s[1] += new Array(prec - s[1].length + 1).join('0');
         }*/
        if (first == '-' || first == '+') {
            return first + s.join(dec);
        }
        return s.join(dec);
    },
    deepClone: function (obj) {
        if (typeof obj != "object") {
            return obj;
        }

        var newObj = obj.constructor === Array ? [] : {};  //开辟一块新的内存空间

        for (var i  in  obj) {
            newObj [i] = deepClone(obj [i]);                 //通过递归实现深层的复制
        }

        return newObj;
    }
}
