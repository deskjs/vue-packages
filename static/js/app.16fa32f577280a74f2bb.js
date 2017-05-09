webpackJsonp([1],Array(35).concat([
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * jQuery UI Widget 1.10.3+amd
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */

(function (factory) {
    if (true) {
        // Register as an anonymous AMD module:
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else {
        // Browser globals:
        factory(jQuery);
    }
})(function ($, undefined) {
    var uuid = 0,
        slice = Array.prototype.slice,
        _cleanData = $.cleanData;
    $.cleanData = function (elems) {
        for (var i = 0, elem; (elem = elems[i]) != null; i++) {
            try {
                $(elem).triggerHandler("remove");
                // http://bugs.jquery.com/ticket/8235
            } catch (e) {}
        }
        _cleanData(elems);
    };

    $.widget = function (name, base, prototype) {
        var fullName,
            existingConstructor,
            constructor,
            basePrototype,

        // proxiedPrototype allows the provided prototype to remain unmodified
        // so that it can be used as a mixin for multiple widgets (#8876)
        proxiedPrototype = {},
            namespace = name.split(".")[0];

        name = name.split(".")[1];
        fullName = namespace + "-" + name;

        if (!prototype) {
            prototype = base;
            base = $.Widget;
        }

        // create selector for plugin
        $.expr[":"][fullName.toLowerCase()] = function (elem) {
            return !!$.data(elem, fullName);
        };

        $[namespace] = $[namespace] || {};
        existingConstructor = $[namespace][name];
        constructor = $[namespace][name] = function (options, element) {
            // allow instantiation without "new" keyword
            if (!this._createWidget) {
                return new constructor(options, element);
            }

            // allow instantiation without initializing for simple inheritance
            // must use "new" keyword (the code above always passes args)
            if (arguments.length) {
                this._createWidget(options, element);
            }
        };
        // extend with the existing constructor to carry over any static properties
        $.extend(constructor, existingConstructor, {
            version: prototype.version,
            // copy the object used to create the prototype in case we need to
            // redefine the widget later
            _proto: $.extend({}, prototype),
            // track widgets that inherit from this widget in case this widget is
            // redefined after a widget inherits from it
            _childConstructors: []
        });

        basePrototype = new base();
        // we need to make the options hash a property directly on the new instance
        // otherwise we'll modify the options hash on the prototype that we're
        // inheriting from
        basePrototype.options = $.widget.extend({}, basePrototype.options);
        $.each(prototype, function (prop, value) {
            if (!$.isFunction(value)) {
                proxiedPrototype[prop] = value;
                return;
            }
            proxiedPrototype[prop] = function () {
                var _super = function () {
                    return base.prototype[prop].apply(this, arguments);
                },
                    _superApply = function (args) {
                    return base.prototype[prop].apply(this, args);
                };
                return function () {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;

                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply(this, arguments);

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                };
            }();
        });
        constructor.prototype = $.widget.extend(basePrototype, {
            // TODO: remove support for widgetEventPrefix
            // always use the name + a colon as the prefix, e.g., draggable:start
            // don't prefix for widgets that aren't DOM-based
            widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
        }, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            widgetName: name,
            widgetFullName: fullName
        });

        // If this widget is being redefined then we need to find all widgets that
        // are inheriting from it and redefine all of them so that they inherit from
        // the new version of this widget. We're essentially trying to replace one
        // level in the prototype chain.
        if (existingConstructor) {
            $.each(existingConstructor._childConstructors, function (i, child) {
                var childPrototype = child.prototype;

                // redefine the child widget using the same prototype that was
                // originally used, but inherit from the new version of the base
                $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
            });
            // remove the list of existing child constructors from the old constructor
            // so the old child constructors can be garbage collected
            delete existingConstructor._childConstructors;
        } else {
            base._childConstructors.push(constructor);
        }

        $.widget.bridge(name, constructor);
    };

    $.widget.extend = function (target) {
        var input = slice.call(arguments, 1),
            inputIndex = 0,
            inputLength = input.length,
            key,
            value;
        for (; inputIndex < inputLength; inputIndex++) {
            for (key in input[inputIndex]) {
                value = input[inputIndex][key];
                if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
                    // Clone objects
                    if ($.isPlainObject(value)) {
                        target[key] = $.isPlainObject(target[key]) ? $.widget.extend({}, target[key], value) :
                        // Don't extend strings, arrays, etc. with objects
                        $.widget.extend({}, value);
                        // Copy everything else by reference
                    } else {
                        target[key] = value;
                    }
                }
            }
        }
        return target;
    };

    $.widget.bridge = function (name, object) {
        var fullName = object.prototype.widgetFullName || name;
        $.fn[name] = function (options) {
            var isMethodCall = typeof options === "string",
                args = slice.call(arguments, 1),
                returnValue = this;

            // allow multiple hashes to be passed on init
            options = !isMethodCall && args.length ? $.widget.extend.apply(null, [options].concat(args)) : options;

            if (isMethodCall) {
                this.each(function () {
                    var methodValue,
                        instance = $.data(this, fullName);
                    if (!instance) {
                        return $.error("cannot call methods on " + name + " prior to initialization; " + "attempted to call method '" + options + "'");
                    }
                    if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                        return $.error("no such method '" + options + "' for " + name + " widget instance");
                    }
                    methodValue = instance[options].apply(instance, args);
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function () {
                    var instance = $.data(this, fullName);
                    if (instance) {
                        instance.option(options || {})._init();
                    } else {
                        $.data(this, fullName, new object(options, this));
                    }
                });
            }

            return returnValue;
        };
    };

    $.Widget = function () /* options, element */{};
    $.Widget._childConstructors = [];

    $.Widget.prototype = {
        widgetName: "widget",
        widgetEventPrefix: "",
        defaultElement: "<div>",
        options: {
            disabled: false,

            // callbacks
            create: null
        },
        _createWidget: function (options, element) {
            element = $(element || this.defaultElement || this)[0];
            this.element = $(element);
            this.uuid = uuid++;
            this.eventNamespace = "." + this.widgetName + this.uuid;
            this.options = $.widget.extend({}, this.options, this._getCreateOptions(), options);

            this.bindings = $();
            this.hoverable = $();
            this.focusable = $();

            if (element !== this) {
                $.data(element, this.widgetFullName, this);
                this._on(true, this.element, {
                    remove: function (event) {
                        if (event.target === element) {
                            this.destroy();
                        }
                    }
                });
                this.document = $(element.style ?
                // element within the document
                element.ownerDocument :
                // element is window or document
                element.document || element);
                this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
            }

            this._create();
            this._trigger("create", null, this._getCreateEventData());
            this._init();
        },
        _getCreateOptions: $.noop,
        _getCreateEventData: $.noop,
        _create: $.noop,
        _init: $.noop,

        destroy: function () {
            this._destroy();
            // we can probably remove the unbind calls in 2.0
            // all event bindings should go through this._on()
            this.element.unbind(this.eventNamespace)
            // 1.9 BC for #7810
            // TODO remove dual storage
            .removeData(this.widgetName).removeData(this.widgetFullName)
            // support: jquery <1.6.3
            // http://bugs.jquery.com/ticket/9413
            .removeData($.camelCase(this.widgetFullName));
            this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled");

            // clean up events and states
            this.bindings.unbind(this.eventNamespace);
            this.hoverable.removeClass("ui-state-hover");
            this.focusable.removeClass("ui-state-focus");
        },
        _destroy: $.noop,

        widget: function () {
            return this.element;
        },

        option: function (key, value) {
            var options = key,
                parts,
                curOption,
                i;

            if (arguments.length === 0) {
                // don't return a reference to the internal hash
                return $.widget.extend({}, this.options);
            }

            if (typeof key === "string") {
                // handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
                options = {};
                parts = key.split(".");
                key = parts.shift();
                if (parts.length) {
                    curOption = options[key] = $.widget.extend({}, this.options[key]);
                    for (i = 0; i < parts.length - 1; i++) {
                        curOption[parts[i]] = curOption[parts[i]] || {};
                        curOption = curOption[parts[i]];
                    }
                    key = parts.pop();
                    if (value === undefined) {
                        return curOption[key] === undefined ? null : curOption[key];
                    }
                    curOption[key] = value;
                } else {
                    if (value === undefined) {
                        return this.options[key] === undefined ? null : this.options[key];
                    }
                    options[key] = value;
                }
            }

            this._setOptions(options);

            return this;
        },
        _setOptions: function (options) {
            var key;

            for (key in options) {
                this._setOption(key, options[key]);
            }

            return this;
        },
        _setOption: function (key, value) {
            this.options[key] = value;

            if (key === "disabled") {
                this.widget().toggleClass(this.widgetFullName + "-disabled ui-state-disabled", !!value).attr("aria-disabled", value);
                this.hoverable.removeClass("ui-state-hover");
                this.focusable.removeClass("ui-state-focus");
            }

            return this;
        },

        enable: function () {
            return this._setOption("disabled", false);
        },
        disable: function () {
            return this._setOption("disabled", true);
        },

        _on: function (suppressDisabledCheck, element, handlers) {
            var delegateElement,
                instance = this;

            // no suppressDisabledCheck flag, shuffle arguments
            if (typeof suppressDisabledCheck !== "boolean") {
                handlers = element;
                element = suppressDisabledCheck;
                suppressDisabledCheck = false;
            }

            // no element argument, shuffle and use this.element
            if (!handlers) {
                handlers = element;
                element = this.element;
                delegateElement = this.widget();
            } else {
                // accept selectors, DOM elements
                element = delegateElement = $(element);
                this.bindings = this.bindings.add(element);
            }

            $.each(handlers, function (event, handler) {
                function handlerProxy() {
                    // allow widgets to customize the disabled handling
                    // - disabled as an array instead of boolean
                    // - disabled class as method for disabling individual parts
                    if (!suppressDisabledCheck && (instance.options.disabled === true || $(this).hasClass("ui-state-disabled"))) {
                        return;
                    }
                    return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
                }

                // copy the guid so direct unbinding works
                if (typeof handler !== "string") {
                    handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || $.guid++;
                }

                var match = event.match(/^(\w+)\s*(.*)$/),
                    eventName = match[1] + instance.eventNamespace,
                    selector = match[2];
                if (selector) {
                    delegateElement.delegate(selector, eventName, handlerProxy);
                } else {
                    element.bind(eventName, handlerProxy);
                }
            });
        },

        _off: function (element, eventName) {
            eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
            element.unbind(eventName).undelegate(eventName);
        },

        _delay: function (handler, delay) {
            function handlerProxy() {
                return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
            }
            var instance = this;
            return setTimeout(handlerProxy, delay || 0);
        },

        _hoverable: function (element) {
            this.hoverable = this.hoverable.add(element);
            this._on(element, {
                mouseenter: function (event) {
                    $(event.currentTarget).addClass("ui-state-hover");
                },
                mouseleave: function (event) {
                    $(event.currentTarget).removeClass("ui-state-hover");
                }
            });
        },

        _focusable: function (element) {
            this.focusable = this.focusable.add(element);
            this._on(element, {
                focusin: function (event) {
                    $(event.currentTarget).addClass("ui-state-focus");
                },
                focusout: function (event) {
                    $(event.currentTarget).removeClass("ui-state-focus");
                }
            });
        },

        _trigger: function (type, event, data) {
            var prop,
                orig,
                callback = this.options[type];

            data = data || {};
            event = $.Event(event);
            event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
            // the original event may come from any element
            // so we need to reset the target on the new event
            event.target = this.element[0];

            // copy original event properties over to the new event
            orig = event.originalEvent;
            if (orig) {
                for (prop in orig) {
                    if (!(prop in event)) {
                        event[prop] = orig[prop];
                    }
                }
            }

            this.element.trigger(event, data);
            return !($.isFunction(callback) && callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
        }
    };

    $.each({ show: "fadeIn", hide: "fadeOut" }, function (method, defaultEffect) {
        $.Widget.prototype["_" + method] = function (element, options, callback) {
            if (typeof options === "string") {
                options = { effect: options };
            }
            var hasOptions,
                effectName = !options ? method : options === true || typeof options === "number" ? defaultEffect : options.effect || defaultEffect;
            options = options || {};
            if (typeof options === "number") {
                options = { duration: options };
            }
            hasOptions = !$.isEmptyObject(options);
            options.complete = callback;
            if (options.delay) {
                element.delay(options.delay);
            }
            if (hasOptions && $.effects && $.effects.effect[effectName]) {
                element[method](options);
            } else if (effectName !== method && element[effectName]) {
                element[effectName](options.duration, options.easing, callback);
            } else {
                element.queue(function (next) {
                    $(this)[method]();
                    if (callback) {
                        callback.call(element[0]);
                    }
                    next();
                });
            }
        };
    });
});

/***/ }),
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(113)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(123),
  /* template */
  __webpack_require__(95),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 66 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {/* harmony default export */ __webpack_exports__["a"] = ({
    initFilter: function (Vue) {
        //单向过滤器
        //年-月-日 时：分：秒
        Vue.filter('dateTimeFormat', function (value) {
            //to do
            if (value == "") {
                return "";
            }
            if (value == undefined) {
                return "";
            }
            var data = new Date(value);
            var year = data.getFullYear();
            var month = data.getMonth() >= 9 ? (data.getMonth() + 1).toString() : '0' + (data.getMonth() + 1);
            var day = data.getDate() > 9 ? data.getDate().toString() : '0' + data.getDate();
            var hours = data.getHours() > 9 ? data.getHours().toString() : '0' + data.getHours();
            var minutes = data.getMinutes() > 9 ? data.getMinutes().toString() : '0' + data.getMinutes();
            var ss = data.getSeconds() > 9 ? data.getSeconds().toString() : '0' + data.getSeconds();
            value = year + "/" + month + "/" + day + " " + hours + ":" + minutes + ":" + ss;
            return value;
        });
        //年-月-日
        Vue.filter('timeTransformTMD', function (value) {
            if (value == "") {
                return "未知";
            }
            if (value == undefined) {
                return "未知";
            }
            var data = new Date(value);
            var year = data.getFullYear();
            var month = data.getMonth() >= 9 ? (data.getMonth() + 1).toString() : '0' + (data.getMonth() + 1);
            var day = data.getDate() > 9 ? data.getDate().toString() : '0' + data.getDate();
            var hours = data.getHours() > 9 ? data.getHours().toString() : '0' + data.getHours();
            var minutes = data.getMinutes() > 9 ? data.getMinutes().toString() : '0' + data.getMinutes();
            var ss = data.getSeconds() > 9 ? data.getSeconds().toString() : '0' + data.getSeconds();
            value = year + "/" + month + "/" + day + " ";
            return value;
        });
        //年-月-日 时：分
        Vue.filter('timeTransformTMDHM', function (value) {
            //to do
            if (value == "0") {
                value = "长期有效";
            } else {
                var data = new Date(value);
                var year = data.getFullYear();
                var month = data.getMonth() >= 9 ? (data.getMonth() + 1).toString() : '0' + (data.getMonth() + 1);
                var day = data.getDate() > 9 ? data.getDate().toString() : '0' + data.getDate();
                var hours = data.getHours() > 9 ? data.getHours().toString() : '0' + data.getHours();
                var minutes = data.getMinutes() > 9 ? data.getMinutes().toString() : '0' + data.getMinutes();
                var ss = data.getSeconds() > 9 ? data.getSeconds().toString() : '0' + data.getSeconds();
                value = year + "/" + month + "/" + day + " " + hours + ":" + minutes;
            }
            return value;
        });
        // 时：分 :秒
        Vue.filter('timeTransformHMS', function (value) {
            //to do
            if (value == "0") {
                value = "长期有效";
            } else {
                var data = new Date(value);
                var year = data.getFullYear();
                var month = data.getMonth() >= 9 ? (data.getMonth() + 1).toString() : '0' + (data.getMonth() + 1);
                var day = data.getDate() > 9 ? data.getDate().toString() : '0' + data.getDate();
                var hours = data.getHours() > 9 ? data.getHours().toString() : '0' + data.getHours();
                var minutes = data.getMinutes() > 9 ? data.getMinutes().toString() : '0' + data.getMinutes();
                var ss = data.getSeconds() > 9 ? data.getSeconds().toString() : '0' + data.getSeconds();
                value = year + "/" + month + "/" + day + " ";
            }
            return value;
        });
        // 年.月.日 时:分
        Vue.filter('timeTransformYYYYMMDDhhmm', function (value) {
            //to do
            if (value == "0") {
                value = "长期有效";
            } else {
                var oDate = new Date(value);
                oYear = oDate.getFullYear();
                oMonth = oDate.getMonth() + 1;
                oDay = oDate.getDate();
                oHour = oDate.getHours();
                oMin = oDate.getMinutes();
                value = oYear + "." + oMonth + '.' + oDay + " " + oHour + ":" + oMin; //最后拼接时间  
            }
            return value;
        });

        //pvd时间转换
        Vue.filter('dateTimeFormatForPvd', function (value) {
            //to do
            var timeStr = "未知";
            if (value) {
                timeStr = value.replace("-", "/").replace("-", "/");
            }
            if (null == value) {
                timeStr = value;
            }
            return timeStr;
        });
        //pvd地址过滤
        Vue.filter('carAddressFormat', function (value) {
            //to do
            var addStr = "未知";
            if (value) {
                addStr = value;
            }
            return addStr;
        });

        //双向过滤器
        Vue.filter('currencyDisplay', {
            // model -> view
            // 在更新 `<input>` 元素之前格式化值
            read: function (val) {
                //to do
                return val;
            },
            // view -> model
            // 在写回数据之前格式化值
            write: function (val, oldVal) {
                //to do
                var number = +val.replace(/[^\d.]/g, '');
                return isNaN(number) ? 0 : parseFloat(number.toFixed(2));
            }
        });
        //双向过滤器
        Vue.filter('idCard', {
            // model -> view
            // 在更新 `<input>` 元素之前格式化值
            read: function (val) {
                //to do
                if (val.length >= 15 && /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(val)) {
                    return val;
                } else {
                    return "";
                }
            },
            // view -> model
            // 在写回数据之前格式化值
            write: function (val, oldVal) {
                //to do
                var str = val;
                if (val.length >= 15 && /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(val)) {
                    return val;
                } else {
                    return "";
                }
            }
        });
        Vue.filter('ifNUll', function (value) {
            //to do

            if (value === null || $.trim(value) === "") {
                return "未知";
            } else {
                return value;
            }
        });
        Vue.filter('ifPassed', function (value) {
            //to do

            if (value === 2) {
                return "已过期";
            } else {
                return "";
            }
        });
        // 年龄
        Vue.filter('ageTrans', function (value) {
            //to do
            if (value == "-1" || value == "" || value == null) {
                return "未知";
            } else {
                return value;
            }
        });
        // 性别
        Vue.filter('sexTrans', function (value) {
            //to do

            if (value == "1") {
                return "男";
            } else if (value == "2") {
                return "女";
            } else {
                return "未知";
            }
        });
        //设备类型
        Vue.filter('serviceType', function (value) {

            var type = Base.GetDictionaryValue("DEVICE_TYPE", value);
            if (!type) {
                type = "未知";
            }
            return type;
        });
        //设备状态
        Vue.filter('serviceStatus', function (value) {

            var status = Base.GetDictionaryValue("DEVICE_STATUS", value);
            if (!status) {
                status = "未知";
            }
            return status;
        });

        //报警规则
        Vue.filter('alarmType', function (value) {
            var alarm;
            //var status=Base.GetDictionaryValue("DEVICE_STATUS",value);
            if (value == "0") {
                alarm = "低阈值报警";
            } else if (value == "1") {
                alarm = "高阈值报警";
            }
            return alarm;
        });
        //基础库 人脸 是否微笑 是否戴眼镜 是否带太阳镜
        Vue.filter('ifAttractive', function (value) {
            var Attractive;
            //var status=Base.GetDictionaryValue("DEVICE_STATUS",value);
            if (value == "0") {
                Attractive = "无";
            } else if (value == "1") {
                Attractive = "有";
            } else {
                Attractive = "未知";
            }
            return Attractive;
        });
        //基础库 人脸 颜值
        Vue.filter('faceScore', function (value) {
            var Attractive;
            //var status=Base.GetDictionaryValue("DEVICE_STATUS",value);
            if (value == "-1") {
                value = "未知";
            }
            return value;
        });
        //服务管理
        Vue.filter('serverStatus', function (value) {
            if (value == "UP") {
                value = "正常";
            } else {
                value = "异常";
            }
            return value;
        });
        //天线类型
        Vue.filter('radioType', function (value) {
            //to do

            if (value == "0") {
                return "2.4G";
            } else if (value == "1") {
                return "5G";
            } else {
                return "未知";
            }
        });
        //是否关联用户
        Vue.filter('ifAssociated', function (value) {
            //to do

            if (value == "0") {
                return "未关联";
            } else if (value == "1") {
                return "关联";
            } else {
                return "未知";
            }
        });
        //以图搜图 比分类型判断
        Vue.filter('filterBaselibResultScoreType', function (score) {
            var num = null;
            if (score) {
                num = parseInt(score);
                if (num == 10000 || num == 100) {
                    return "most";
                } else if (num >= 90) {
                    return "high";
                } else if (num > 40 && num < 90) {
                    return "center";
                } else if (num <= 40) {
                    return "low";
                } else {
                    return null;
                }
            }
        });
        //以图搜图 比分渲染
        Vue.filter('filterBaselibResultScoreNum', function (score) {
            var num = null;
            if (score) {
                num = parseInt(score.toString().substring(0, 4) * 100) + "%";
            }
            return num;
        });
        //以图搜图 比分渲染
        Vue.filter('filterBaselibResultScoreNumForFace', function (score) {
            var num = null;
            if (score) {
                if ("100.0" == score || 100 == score) {
                    num = "100%";
                } else {
                    num = parseInt(score.toString().substring(0, 2) * 1) + "%";
                }
            }
            return num;
        });
        //报警信息 报警类型
        Vue.filter('ifAlarmType', function (value) {
            //to do

            if (value == "2") {
                return "人脸报警";
            } else if (value == "3") {
                return "车辆报警";
            } else if (value == "4") {
                return "人体报警";
            } else {
                return "未知";
            }
        });
        //报警信息 报警级别
        /*  Vue.filter('ifAlarmLevel', function(value) {
              //to do
               if (value == "0") {
                  return "报警级别：严重";
              }
          });*/
        //基础库颜色选择
        Vue.filter('colorTrans', function (value) {
            var colorArray = ["白", "灰", "黄", "粉", "红", "绿", "蓝", "棕", "黑", "紫"];
            if (Number(value) == -1) {
                return "其他";
            } else {
                return colorArray[Number(value)];
            }
        });
        //报警信息 行车速度
        Vue.filter('ifAlarmSpeed', function (value) {
            //to do

            if (value) {
                return value + 'km/h';
            } else {
                return "未知";
            }
        });

        Vue.filter('monitorImageFilter', function (value) {
            if (value == undefined || imageProxy + "undefined" == value || null == value) {}
            return value;
        });
        //imageUrlFilter
        Vue.filter('imageFaceDefaul', function (value) {
            if (value == undefined || imageProxy + "undefined" == value) {}
            return value;
        });
        //imageUrlFilter
        Vue.filter('imageBodyDefaul', function (value) {
            if (value == undefined || imageProxy + "undefined" == value) {}
            return value;
        });
        //imageUrlFilter
        Vue.filter('imageUploadDefaul', function (value) {
            if (value == undefined || imageProxy + "undefined" == value) {}
            return value;
        });
        //imageUrlFilter
        Vue.filter('imageDetailDefaul', function (value) {
            if (value == undefined || imageProxy + "undefined" == value) {}
            return value;
        });
        //车辆信息 汽车品牌
        Vue.filter('ifVehicleBrand', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("VehicleBrand", "VehicleBrand", value);
            } else {
                return "未知";
            }
        });
        //车辆信息, 车辆颜色
        Vue.filter('ifVehiclecolor', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("VehicleColor", "VehicleColor", value);
            } else {
                return "未知";
            }
        });
        //车辆信息, 车辆颜色---PCCtoPVD
        Vue.filter('ifVehiclecolorForMonitor', function (value) {
            //to do

            var PvdColorCode = Base.GetPvdDictionaryValue("VehicleColor-PCCToPVD", "VehicleColor-PCCToPVD", value);
            return Base.GetPvdDictionaryValue("VehicleColor", "VehicleColor", PvdColorCode);
        });
        //车辆信息 
        Vue.filter('ifVehicleNK', function (key) {
            //to do
            if (key == "0") {
                return "未知";
            }
            if ("undefined" == localStorage.dictPvdData || null == localStorage.dictPvdData) {
                return "未知";
            } else {
                var nksData = JSON.parse(localStorage.dictPvdData);
                var nks = nksData.VehicleNK;
                var years = [];
                for (var i = 0, l = nks.length; i < l; i++) {
                    if (key & nks[i].key) {
                        years.push(nks[i].value.replace("YEAR_", ""));
                    }
                }
                return years.join('|');
            }
        });
        //车辆信息 
        Vue.filter('ifVehicleSubBrand', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("VehicleSubBrand", "VehicleSubBrand", value);
            } else {
                return "未知";
            }
        });
        //车辆颜色 
        Vue.filter('ifPlateColor', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("PlateColor", "PlateColor", value);
            } else {
                return "未知";
            }
        });
        //车辆信息 
        Vue.filter('ifPlateType', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("PlateType", "PlateType", value);
            } else {
                return "未知";
            }
        });
        //报警级别 
        Vue.filter('ifAlarmLevel', function (value) {
            //to do
            if (value) {
                return Base.GetPvdDictionaryValue("AlarmLevel", "AlarmLevel", value);
            } else {
                return "未知";
            }
        });
        //报警类别 
        Vue.filter('isalarmType', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("AlarmType", "AlarmType", value);
            } else {
                return "未知";
            }
        });
        //车辆类型
        Vue.filter('ifVehicleType', function (value) {
            //to do

            if (value) {
                return Base.GetPvdDictionaryValue("VehicleType", "VehicleType", value);
            } else {
                return "未知";
            }
        });
        //图片前缀 
        Vue.filter('imgUrlProxyFilter', function (value) {
            //to do

            if (value) {
                return window.imageProxy + value + "&width=90";
            } else {
                return "未知";
            }
        });

        //实时监控摄像机布控筛选--人脸
        Vue.filter('monitorTaskFilterFace', function (mapping) {
            //to do
            var domClass = "icon-face-off";

            if (mapping.running && mapping.face) {
                domClass = "";
            }
            return domClass;
        });
        //实时监控摄像机布控筛选--人体
        Vue.filter('monitorTaskFilterBody', function (mapping) {
            //to do
            var domClass = "icon-body-off";

            if (mapping.running && mapping.body) {
                domClass = "";
            }
            return domClass;
        });

        //实时监控，车辆车牌过滤
        Vue.filter('carNumberFormat', function (carNum) {
            //to do
            var value = "";
            if ('-1' == carNum) {
                value = "未知";
            } else {
                value = carNum;
            }
            return value;
        });
        //实时监控摄像机布控筛选--车辆
        Vue.filter('monitorTaskFilterCar', function (mapping) {
            //to do
            var domClass = "icon-car-off";

            if (mapping.running && mapping.vehicle) {
                domClass = "";
            }
            return domClass;
        });

        //格式化数量为可读形式，如1000 格式后1,000
        Vue.filter('numFormatFilter', function (num) {
            if (!isNaN(num)) {
                var s = num;
                var n = 0;
                if (s) {
                    n = n >= 0 && n <= 20 ? n : 2;
                    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
                    var l = s.split(".")[0].split("").reverse();
                    t = "";
                    for (i = 0; i < l.length; i++) {
                        t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? "," : "");
                    }
                    return t.split("").reverse().join("");
                } else {
                    return 0;
                }
            } else {
                return 0;
            }
        });

        //关系挖掘根据数据分数大小 返回对应的class类
        Vue.filter('filterRelationsDataType', function (score) {
            var num = null;
            if (score) {
                num = score.toString().substring(0, 4) * 100;
                if (num == 10000 || num == 100) {
                    return "red";
                } else if (num >= 90) {
                    return "red";
                } else if (num > 50 && num < 90) {
                    return "yellow";
                } else if (num <= 50) {
                    return "blue";
                } else {
                    return null;
                }
            }
        });

        //民族

        Vue.filter('filterLibNation', function (num) {
            var nationDatas = JSON.parse(window.localStorage.nationData);
            var nationName = '';
            for (var i = 0; i < nationDatas.length; i++) {
                if (num == nationDatas[i].code) {
                    nationName = nationDatas[i].name;
                }
            }
            if (nationName == '') {
                return '未知';
            } else {
                return nationName;
            }
        });

        //用户管理 用户等级
        Vue.filter('ifUserLevel', function (value) {
            //to do

            if (value == "1") {
                return "管理员";
            } else if (value == "2") {
                return "普通用户";
            } else {
                return "未知";
            }
        });
        Vue.filter('libType', function (value) {
            return value == '0' ? "布控人员库" : '静态人员库';
        });
    }
});
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1)))

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

var dateTime = __webpack_require__(84);
var about = __webpack_require__(79);
var cascade = __webpack_require__(80);
//var notify = require('./packages/notify/notify.js');
var notifyCss = __webpack_require__(103);
var pagiNation = __webpack_require__(83);
var upLoader = __webpack_require__(85);
var dialog = __webpack_require__(82);
var detailsDialog = __webpack_require__(81);
const components = [dateTime, upLoader, cascade, pagiNation, dialog, detailsDialog, about];

var install = function (Vue, options) {
    if (install.installed) return;
    components.map(component => {
        Vue.component(component.name, component);
    });

    //Vue.prototype.$notify = window.notify;
};
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
};
// export default install;
module.exports = { install };

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! jQuery v2.1.3 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function (a, b) {
  "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function (a) {
    if (!a.document) throw new Error("jQuery requires a window with a document");return b(a);
  } : b(a);
}("undefined" != typeof window ? window : this, function (a, b) {
  var c = [],
      d = c.slice,
      e = c.concat,
      f = c.push,
      g = c.indexOf,
      h = {},
      i = h.toString,
      j = h.hasOwnProperty,
      k = {},
      l = a.document,
      m = "2.1.3",
      n = function (a, b) {
    return new n.fn.init(a, b);
  },
      o = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
      p = /^-ms-/,
      q = /-([\da-z])/gi,
      r = function (a, b) {
    return b.toUpperCase();
  };n.fn = n.prototype = { jquery: m, constructor: n, selector: "", length: 0, toArray: function () {
      return d.call(this);
    }, get: function (a) {
      return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this);
    }, pushStack: function (a) {
      var b = n.merge(this.constructor(), a);return b.prevObject = this, b.context = this.context, b;
    }, each: function (a, b) {
      return n.each(this, a, b);
    }, map: function (a) {
      return this.pushStack(n.map(this, function (b, c) {
        return a.call(b, c, b);
      }));
    }, slice: function () {
      return this.pushStack(d.apply(this, arguments));
    }, first: function () {
      return this.eq(0);
    }, last: function () {
      return this.eq(-1);
    }, eq: function (a) {
      var b = this.length,
          c = +a + (0 > a ? b : 0);return this.pushStack(c >= 0 && b > c ? [this[c]] : []);
    }, end: function () {
      return this.prevObject || this.constructor(null);
    }, push: f, sort: c.sort, splice: c.splice }, n.extend = n.fn.extend = function () {
    var a,
        b,
        c,
        d,
        e,
        f,
        g = arguments[0] || {},
        h = 1,
        i = arguments.length,
        j = !1;for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++) if (null != (a = arguments[h])) for (b in a) c = g[b], d = a[b], g !== d && (j && d && (n.isPlainObject(d) || (e = n.isArray(d))) ? (e ? (e = !1, f = c && n.isArray(c) ? c : []) : f = c && n.isPlainObject(c) ? c : {}, g[b] = n.extend(j, f, d)) : void 0 !== d && (g[b] = d));return g;
  }, n.extend({ expando: "jQuery" + (m + Math.random()).replace(/\D/g, ""), isReady: !0, error: function (a) {
      throw new Error(a);
    }, noop: function () {}, isFunction: function (a) {
      return "function" === n.type(a);
    }, isArray: Array.isArray, isWindow: function (a) {
      return null != a && a === a.window;
    }, isNumeric: function (a) {
      return !n.isArray(a) && a - parseFloat(a) + 1 >= 0;
    }, isPlainObject: function (a) {
      return "object" !== n.type(a) || a.nodeType || n.isWindow(a) ? !1 : a.constructor && !j.call(a.constructor.prototype, "isPrototypeOf") ? !1 : !0;
    }, isEmptyObject: function (a) {
      var b;for (b in a) return !1;return !0;
    }, type: function (a) {
      return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a;
    }, globalEval: function (a) {
      var b,
          c = eval;a = n.trim(a), a && (1 === a.indexOf("use strict") ? (b = l.createElement("script"), b.text = a, l.head.appendChild(b).parentNode.removeChild(b)) : c(a));
    }, camelCase: function (a) {
      return a.replace(p, "ms-").replace(q, r);
    }, nodeName: function (a, b) {
      return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase();
    }, each: function (a, b, c) {
      var d,
          e = 0,
          f = a.length,
          g = s(a);if (c) {
        if (g) {
          for (; f > e; e++) if (d = b.apply(a[e], c), d === !1) break;
        } else for (e in a) if (d = b.apply(a[e], c), d === !1) break;
      } else if (g) {
        for (; f > e; e++) if (d = b.call(a[e], e, a[e]), d === !1) break;
      } else for (e in a) if (d = b.call(a[e], e, a[e]), d === !1) break;return a;
    }, trim: function (a) {
      return null == a ? "" : (a + "").replace(o, "");
    }, makeArray: function (a, b) {
      var c = b || [];return null != a && (s(Object(a)) ? n.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c;
    }, inArray: function (a, b, c) {
      return null == b ? -1 : g.call(b, a, c);
    }, merge: function (a, b) {
      for (var c = +b.length, d = 0, e = a.length; c > d; d++) a[e++] = b[d];return a.length = e, a;
    }, grep: function (a, b, c) {
      for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++) d = !b(a[f], f), d !== h && e.push(a[f]);return e;
    }, map: function (a, b, c) {
      var d,
          f = 0,
          g = a.length,
          h = s(a),
          i = [];if (h) for (; g > f; f++) d = b(a[f], f, c), null != d && i.push(d);else for (f in a) d = b(a[f], f, c), null != d && i.push(d);return e.apply([], i);
    }, guid: 1, proxy: function (a, b) {
      var c, e, f;return "string" == typeof b && (c = a[b], b = a, a = c), n.isFunction(a) ? (e = d.call(arguments, 2), f = function () {
        return a.apply(b || this, e.concat(d.call(arguments)));
      }, f.guid = a.guid = a.guid || n.guid++, f) : void 0;
    }, now: Date.now, support: k }), n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (a, b) {
    h["[object " + b + "]"] = b.toLowerCase();
  });function s(a) {
    var b = a.length,
        c = n.type(a);return "function" === c || n.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a;
  }var t = function (a) {
    var b,
        c,
        d,
        e,
        f,
        g,
        h,
        i,
        j,
        k,
        l,
        m,
        n,
        o,
        p,
        q,
        r,
        s,
        t,
        u = "sizzle" + 1 * new Date(),
        v = a.document,
        w = 0,
        x = 0,
        y = hb(),
        z = hb(),
        A = hb(),
        B = function (a, b) {
      return a === b && (l = !0), 0;
    },
        C = 1 << 31,
        D = {}.hasOwnProperty,
        E = [],
        F = E.pop,
        G = E.push,
        H = E.push,
        I = E.slice,
        J = function (a, b) {
      for (var c = 0, d = a.length; d > c; c++) if (a[c] === b) return c;return -1;
    },
        K = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
        L = "[\\x20\\t\\r\\n\\f]",
        M = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
        N = M.replace("w", "w#"),
        O = "\\[" + L + "*(" + M + ")(?:" + L + "*([*^$|!~]?=)" + L + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + N + "))|)" + L + "*\\]",
        P = ":(" + M + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + O + ")*)|.*)\\)|)",
        Q = new RegExp(L + "+", "g"),
        R = new RegExp("^" + L + "+|((?:^|[^\\\\])(?:\\\\.)*)" + L + "+$", "g"),
        S = new RegExp("^" + L + "*," + L + "*"),
        T = new RegExp("^" + L + "*([>+~]|" + L + ")" + L + "*"),
        U = new RegExp("=" + L + "*([^\\]'\"]*?)" + L + "*\\]", "g"),
        V = new RegExp(P),
        W = new RegExp("^" + N + "$"),
        X = { ID: new RegExp("^#(" + M + ")"), CLASS: new RegExp("^\\.(" + M + ")"), TAG: new RegExp("^(" + M.replace("w", "w*") + ")"), ATTR: new RegExp("^" + O), PSEUDO: new RegExp("^" + P), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + L + "*(even|odd|(([+-]|)(\\d*)n|)" + L + "*(?:([+-]|)" + L + "*(\\d+)|))" + L + "*\\)|)", "i"), bool: new RegExp("^(?:" + K + ")$", "i"), needsContext: new RegExp("^" + L + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + L + "*((?:-\\d)?\\d*)" + L + "*\\)|)(?=[^-]|$)", "i") },
        Y = /^(?:input|select|textarea|button)$/i,
        Z = /^h\d$/i,
        $ = /^[^{]+\{\s*\[native \w/,
        _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
        ab = /[+~]/,
        bb = /'|\\/g,
        cb = new RegExp("\\\\([\\da-f]{1,6}" + L + "?|(" + L + ")|.)", "ig"),
        db = function (a, b, c) {
      var d = "0x" + b - 65536;return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320);
    },
        eb = function () {
      m();
    };try {
      H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType;
    } catch (fb) {
      H = { apply: E.length ? function (a, b) {
          G.apply(a, I.call(b));
        } : function (a, b) {
          var c = a.length,
              d = 0;while (a[c++] = b[d++]);a.length = c - 1;
        } };
    }function gb(a, b, d, e) {
      var f, h, j, k, l, o, r, s, w, x;if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], k = b.nodeType, "string" != typeof a || !a || 1 !== k && 9 !== k && 11 !== k) return d;if (!e && p) {
        if (11 !== k && (f = _.exec(a))) if (j = f[1]) {
          if (9 === k) {
            if (h = b.getElementById(j), !h || !h.parentNode) return d;if (h.id === j) return d.push(h), d;
          } else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j) return d.push(h), d;
        } else {
          if (f[2]) return H.apply(d, b.getElementsByTagName(a)), d;if ((j = f[3]) && c.getElementsByClassName) return H.apply(d, b.getElementsByClassName(j)), d;
        }if (c.qsa && (!q || !q.test(a))) {
          if (s = r = u, w = b, x = 1 !== k && a, 1 === k && "object" !== b.nodeName.toLowerCase()) {
            o = g(a), (r = b.getAttribute("id")) ? s = r.replace(bb, "\\$&") : b.setAttribute("id", s), s = "[id='" + s + "'] ", l = o.length;while (l--) o[l] = s + rb(o[l]);w = ab.test(a) && pb(b.parentNode) || b, x = o.join(",");
          }if (x) try {
            return H.apply(d, w.querySelectorAll(x)), d;
          } catch (y) {} finally {
            r || b.removeAttribute("id");
          }
        }
      }return i(a.replace(R, "$1"), b, d, e);
    }function hb() {
      var a = [];function b(c, e) {
        return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e;
      }return b;
    }function ib(a) {
      return a[u] = !0, a;
    }function jb(a) {
      var b = n.createElement("div");try {
        return !!a(b);
      } catch (c) {
        return !1;
      } finally {
        b.parentNode && b.parentNode.removeChild(b), b = null;
      }
    }function kb(a, b) {
      var c = a.split("|"),
          e = a.length;while (e--) d.attrHandle[c[e]] = b;
    }function lb(a, b) {
      var c = b && a,
          d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C);if (d) return d;if (c) while (c = c.nextSibling) if (c === b) return -1;return a ? 1 : -1;
    }function mb(a) {
      return function (b) {
        var c = b.nodeName.toLowerCase();return "input" === c && b.type === a;
      };
    }function nb(a) {
      return function (b) {
        var c = b.nodeName.toLowerCase();return ("input" === c || "button" === c) && b.type === a;
      };
    }function ob(a) {
      return ib(function (b) {
        return b = +b, ib(function (c, d) {
          var e,
              f = a([], c.length, b),
              g = f.length;while (g--) c[e = f[g]] && (c[e] = !(d[e] = c[e]));
        });
      });
    }function pb(a) {
      return a && "undefined" != typeof a.getElementsByTagName && a;
    }c = gb.support = {}, f = gb.isXML = function (a) {
      var b = a && (a.ownerDocument || a).documentElement;return b ? "HTML" !== b.nodeName : !1;
    }, m = gb.setDocument = function (a) {
      var b,
          e,
          g = a ? a.ownerDocument || a : v;return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = g.documentElement, e = g.defaultView, e && e !== e.top && (e.addEventListener ? e.addEventListener("unload", eb, !1) : e.attachEvent && e.attachEvent("onunload", eb)), p = !f(g), c.attributes = jb(function (a) {
        return a.className = "i", !a.getAttribute("className");
      }), c.getElementsByTagName = jb(function (a) {
        return a.appendChild(g.createComment("")), !a.getElementsByTagName("*").length;
      }), c.getElementsByClassName = $.test(g.getElementsByClassName), c.getById = jb(function (a) {
        return o.appendChild(a).id = u, !g.getElementsByName || !g.getElementsByName(u).length;
      }), c.getById ? (d.find.ID = function (a, b) {
        if ("undefined" != typeof b.getElementById && p) {
          var c = b.getElementById(a);return c && c.parentNode ? [c] : [];
        }
      }, d.filter.ID = function (a) {
        var b = a.replace(cb, db);return function (a) {
          return a.getAttribute("id") === b;
        };
      }) : (delete d.find.ID, d.filter.ID = function (a) {
        var b = a.replace(cb, db);return function (a) {
          var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id");return c && c.value === b;
        };
      }), d.find.TAG = c.getElementsByTagName ? function (a, b) {
        return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0;
      } : function (a, b) {
        var c,
            d = [],
            e = 0,
            f = b.getElementsByTagName(a);if ("*" === a) {
          while (c = f[e++]) 1 === c.nodeType && d.push(c);return d;
        }return f;
      }, d.find.CLASS = c.getElementsByClassName && function (a, b) {
        return p ? b.getElementsByClassName(a) : void 0;
      }, r = [], q = [], (c.qsa = $.test(g.querySelectorAll)) && (jb(function (a) {
        o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\f]' msallowcapture=''><option selected=''></option></select>", a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + L + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + L + "*(?:value|" + K + ")"), a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]");
      }), jb(function (a) {
        var b = g.createElement("input");b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + L + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:");
      })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && jb(function (a) {
        c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", P);
      }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function (a, b) {
        var c = 9 === a.nodeType ? a.documentElement : a,
            d = b && b.parentNode;return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d)));
      } : function (a, b) {
        if (b) while (b = b.parentNode) if (b === a) return !0;return !1;
      }, B = b ? function (a, b) {
        if (a === b) return l = !0, 0;var d = !a.compareDocumentPosition - !b.compareDocumentPosition;return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === g || a.ownerDocument === v && t(v, a) ? -1 : b === g || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1);
      } : function (a, b) {
        if (a === b) return l = !0, 0;var c,
            d = 0,
            e = a.parentNode,
            f = b.parentNode,
            h = [a],
            i = [b];if (!e || !f) return a === g ? -1 : b === g ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0;if (e === f) return lb(a, b);c = a;while (c = c.parentNode) h.unshift(c);c = b;while (c = c.parentNode) i.unshift(c);while (h[d] === i[d]) d++;return d ? lb(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0;
      }, g) : n;
    }, gb.matches = function (a, b) {
      return gb(a, null, null, b);
    }, gb.matchesSelector = function (a, b) {
      if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, "='$1']"), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b))) try {
        var d = s.call(a, b);if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType) return d;
      } catch (e) {}return gb(b, n, null, [a]).length > 0;
    }, gb.contains = function (a, b) {
      return (a.ownerDocument || a) !== n && m(a), t(a, b);
    }, gb.attr = function (a, b) {
      (a.ownerDocument || a) !== n && m(a);var e = d.attrHandle[b.toLowerCase()],
          f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0;return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null;
    }, gb.error = function (a) {
      throw new Error("Syntax error, unrecognized expression: " + a);
    }, gb.uniqueSort = function (a) {
      var b,
          d = [],
          e = 0,
          f = 0;if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
        while (b = a[f++]) b === a[f] && (e = d.push(f));while (e--) a.splice(d[e], 1);
      }return k = null, a;
    }, e = gb.getText = function (a) {
      var b,
          c = "",
          d = 0,
          f = a.nodeType;if (f) {
        if (1 === f || 9 === f || 11 === f) {
          if ("string" == typeof a.textContent) return a.textContent;for (a = a.firstChild; a; a = a.nextSibling) c += e(a);
        } else if (3 === f || 4 === f) return a.nodeValue;
      } else while (b = a[d++]) c += e(b);return c;
    }, d = gb.selectors = { cacheLength: 50, createPseudo: ib, match: X, attrHandle: {}, find: {}, relative: { ">": { dir: "parentNode", first: !0 }, " ": { dir: "parentNode" }, "+": { dir: "previousSibling", first: !0 }, "~": { dir: "previousSibling" } }, preFilter: { ATTR: function (a) {
          return a[1] = a[1].replace(cb, db), a[3] = (a[3] || a[4] || a[5] || "").replace(cb, db), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4);
        }, CHILD: function (a) {
          return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || gb.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && gb.error(a[0]), a;
        }, PSEUDO: function (a) {
          var b,
              c = !a[6] && a[2];return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3));
        } }, filter: { TAG: function (a) {
          var b = a.replace(cb, db).toLowerCase();return "*" === a ? function () {
            return !0;
          } : function (a) {
            return a.nodeName && a.nodeName.toLowerCase() === b;
          };
        }, CLASS: function (a) {
          var b = y[a + " "];return b || (b = new RegExp("(^|" + L + ")" + a + "(" + L + "|$)")) && y(a, function (a) {
            return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || "");
          });
        }, ATTR: function (a, b, c) {
          return function (d) {
            var e = gb.attr(d, a);return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(Q, " ") + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0;
          };
        }, CHILD: function (a, b, c, d, e) {
          var f = "nth" !== a.slice(0, 3),
              g = "last" !== a.slice(-4),
              h = "of-type" === b;return 1 === d && 0 === e ? function (a) {
            return !!a.parentNode;
          } : function (b, c, i) {
            var j,
                k,
                l,
                m,
                n,
                o,
                p = f !== g ? "nextSibling" : "previousSibling",
                q = b.parentNode,
                r = h && b.nodeName.toLowerCase(),
                s = !i && !h;if (q) {
              if (f) {
                while (p) {
                  l = b;while (l = l[p]) if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) return !1;o = p = "only" === a && !o && "nextSibling";
                }return !0;
              }if (o = [g ? q.firstChild : q.lastChild], g && s) {
                k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], l = n && q.childNodes[n];while (l = ++n && l && l[p] || (m = n = 0) || o.pop()) if (1 === l.nodeType && ++m && l === b) {
                  k[a] = [w, n, m];break;
                }
              } else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w) m = j[1];else while (l = ++n && l && l[p] || (m = n = 0) || o.pop()) if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (s && ((l[u] || (l[u] = {}))[a] = [w, m]), l === b)) break;return m -= e, m === d || m % d === 0 && m / d >= 0;
            }
          };
        }, PSEUDO: function (a, b) {
          var c,
              e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || gb.error("unsupported pseudo: " + a);return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ib(function (a, c) {
            var d,
                f = e(a, b),
                g = f.length;while (g--) d = J(a, f[g]), a[d] = !(c[d] = f[g]);
          }) : function (a) {
            return e(a, 0, c);
          }) : e;
        } }, pseudos: { not: ib(function (a) {
          var b = [],
              c = [],
              d = h(a.replace(R, "$1"));return d[u] ? ib(function (a, b, c, e) {
            var f,
                g = d(a, null, e, []),
                h = a.length;while (h--) (f = g[h]) && (a[h] = !(b[h] = f));
          }) : function (a, e, f) {
            return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop();
          };
        }), has: ib(function (a) {
          return function (b) {
            return gb(a, b).length > 0;
          };
        }), contains: ib(function (a) {
          return a = a.replace(cb, db), function (b) {
            return (b.textContent || b.innerText || e(b)).indexOf(a) > -1;
          };
        }), lang: ib(function (a) {
          return W.test(a || "") || gb.error("unsupported lang: " + a), a = a.replace(cb, db).toLowerCase(), function (b) {
            var c;do if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang")) return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-"); while ((b = b.parentNode) && 1 === b.nodeType);return !1;
          };
        }), target: function (b) {
          var c = a.location && a.location.hash;return c && c.slice(1) === b.id;
        }, root: function (a) {
          return a === o;
        }, focus: function (a) {
          return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex);
        }, enabled: function (a) {
          return a.disabled === !1;
        }, disabled: function (a) {
          return a.disabled === !0;
        }, checked: function (a) {
          var b = a.nodeName.toLowerCase();return "input" === b && !!a.checked || "option" === b && !!a.selected;
        }, selected: function (a) {
          return a.parentNode && a.parentNode.selectedIndex, a.selected === !0;
        }, empty: function (a) {
          for (a = a.firstChild; a; a = a.nextSibling) if (a.nodeType < 6) return !1;return !0;
        }, parent: function (a) {
          return !d.pseudos.empty(a);
        }, header: function (a) {
          return Z.test(a.nodeName);
        }, input: function (a) {
          return Y.test(a.nodeName);
        }, button: function (a) {
          var b = a.nodeName.toLowerCase();return "input" === b && "button" === a.type || "button" === b;
        }, text: function (a) {
          var b;return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase());
        }, first: ob(function () {
          return [0];
        }), last: ob(function (a, b) {
          return [b - 1];
        }), eq: ob(function (a, b, c) {
          return [0 > c ? c + b : c];
        }), even: ob(function (a, b) {
          for (var c = 0; b > c; c += 2) a.push(c);return a;
        }), odd: ob(function (a, b) {
          for (var c = 1; b > c; c += 2) a.push(c);return a;
        }), lt: ob(function (a, b, c) {
          for (var d = 0 > c ? c + b : c; --d >= 0;) a.push(d);return a;
        }), gt: ob(function (a, b, c) {
          for (var d = 0 > c ? c + b : c; ++d < b;) a.push(d);return a;
        }) } }, d.pseudos.nth = d.pseudos.eq;for (b in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 }) d.pseudos[b] = mb(b);for (b in { submit: !0, reset: !0 }) d.pseudos[b] = nb(b);function qb() {}qb.prototype = d.filters = d.pseudos, d.setFilters = new qb(), g = gb.tokenize = function (a, b) {
      var c,
          e,
          f,
          g,
          h,
          i,
          j,
          k = z[a + " "];if (k) return b ? 0 : k.slice(0);h = a, i = [], j = d.preFilter;while (h) {
        (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({ value: c, type: e[0].replace(R, " ") }), h = h.slice(c.length));for (g in d.filter) !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({ value: c, type: g, matches: e }), h = h.slice(c.length));if (!c) break;
      }return b ? h.length : h ? gb.error(a) : z(a, i).slice(0);
    };function rb(a) {
      for (var b = 0, c = a.length, d = ""; c > b; b++) d += a[b].value;return d;
    }function sb(a, b, c) {
      var d = b.dir,
          e = c && "parentNode" === d,
          f = x++;return b.first ? function (b, c, f) {
        while (b = b[d]) if (1 === b.nodeType || e) return a(b, c, f);
      } : function (b, c, g) {
        var h,
            i,
            j = [w, f];if (g) {
          while (b = b[d]) if ((1 === b.nodeType || e) && a(b, c, g)) return !0;
        } else while (b = b[d]) if (1 === b.nodeType || e) {
          if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f) return j[2] = h[2];if (i[d] = j, j[2] = a(b, c, g)) return !0;
        }
      };
    }function tb(a) {
      return a.length > 1 ? function (b, c, d) {
        var e = a.length;while (e--) if (!a[e](b, c, d)) return !1;return !0;
      } : a[0];
    }function ub(a, b, c) {
      for (var d = 0, e = b.length; e > d; d++) gb(a, b[d], c);return c;
    }function vb(a, b, c, d, e) {
      for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++) (f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h));return g;
    }function wb(a, b, c, d, e, f) {
      return d && !d[u] && (d = wb(d)), e && !e[u] && (e = wb(e, f)), ib(function (f, g, h, i) {
        var j,
            k,
            l,
            m = [],
            n = [],
            o = g.length,
            p = f || ub(b || "*", h.nodeType ? [h] : h, []),
            q = !a || !f && b ? p : vb(p, m, a, h, i),
            r = c ? e || (f ? a : o || d) ? [] : g : q;if (c && c(q, r, h, i), d) {
          j = vb(r, n), d(j, [], h, i), k = j.length;while (k--) (l = j[k]) && (r[n[k]] = !(q[n[k]] = l));
        }if (f) {
          if (e || a) {
            if (e) {
              j = [], k = r.length;while (k--) (l = r[k]) && j.push(q[k] = l);e(null, r = [], j, i);
            }k = r.length;while (k--) (l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l));
          }
        } else r = vb(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r);
      });
    }function xb(a) {
      for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = sb(function (a) {
        return a === b;
      }, h, !0), l = sb(function (a) {
        return J(b, a) > -1;
      }, h, !0), m = [function (a, c, d) {
        var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d));return b = null, e;
      }]; f > i; i++) if (c = d.relative[a[i].type]) m = [sb(tb(m), c)];else {
        if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
          for (e = ++i; f > e; e++) if (d.relative[a[e].type]) break;return wb(i > 1 && tb(m), i > 1 && rb(a.slice(0, i - 1).concat({ value: " " === a[i - 2].type ? "*" : "" })).replace(R, "$1"), c, e > i && xb(a.slice(i, e)), f > e && xb(a = a.slice(e)), f > e && rb(a));
        }m.push(c);
      }return tb(m);
    }function yb(a, b) {
      var c = b.length > 0,
          e = a.length > 0,
          f = function (f, g, h, i, k) {
        var l,
            m,
            o,
            p = 0,
            q = "0",
            r = f && [],
            s = [],
            t = j,
            u = f || e && d.find.TAG("*", k),
            v = w += null == t ? 1 : Math.random() || .1,
            x = u.length;for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) {
          if (e && l) {
            m = 0;while (o = a[m++]) if (o(l, g, h)) {
              i.push(l);break;
            }k && (w = v);
          }c && ((l = !o && l) && p--, f && r.push(l));
        }if (p += q, c && q !== p) {
          m = 0;while (o = b[m++]) o(r, s, g, h);if (f) {
            if (p > 0) while (q--) r[q] || s[q] || (s[q] = F.call(i));s = vb(s);
          }H.apply(i, s), k && !f && s.length > 0 && p + b.length > 1 && gb.uniqueSort(i);
        }return k && (w = v, j = t), r;
      };return c ? ib(f) : f;
    }return h = gb.compile = function (a, b) {
      var c,
          d = [],
          e = [],
          f = A[a + " "];if (!f) {
        b || (b = g(a)), c = b.length;while (c--) f = xb(b[c]), f[u] ? d.push(f) : e.push(f);f = A(a, yb(e, d)), f.selector = a;
      }return f;
    }, i = gb.select = function (a, b, e, f) {
      var i,
          j,
          k,
          l,
          m,
          n = "function" == typeof a && a,
          o = !f && g(a = n.selector || a);if (e = e || [], 1 === o.length) {
        if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
          if (b = (d.find.ID(k.matches[0].replace(cb, db), b) || [])[0], !b) return e;n && (b = b.parentNode), a = a.slice(j.shift().value.length);
        }i = X.needsContext.test(a) ? 0 : j.length;while (i--) {
          if (k = j[i], d.relative[l = k.type]) break;if ((m = d.find[l]) && (f = m(k.matches[0].replace(cb, db), ab.test(j[0].type) && pb(b.parentNode) || b))) {
            if (j.splice(i, 1), a = f.length && rb(j), !a) return H.apply(e, f), e;break;
          }
        }
      }return (n || h(a, o))(f, b, !p, e, ab.test(a) && pb(b.parentNode) || b), e;
    }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = jb(function (a) {
      return 1 & a.compareDocumentPosition(n.createElement("div"));
    }), jb(function (a) {
      return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href");
    }) || kb("type|href|height|width", function (a, b, c) {
      return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2);
    }), c.attributes && jb(function (a) {
      return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value");
    }) || kb("value", function (a, b, c) {
      return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue;
    }), jb(function (a) {
      return null == a.getAttribute("disabled");
    }) || kb(K, function (a, b, c) {
      var d;return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null;
    }), gb;
  }(a);n.find = t, n.expr = t.selectors, n.expr[":"] = n.expr.pseudos, n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains;var u = n.expr.match.needsContext,
      v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
      w = /^.[^:#\[\.,]*$/;function x(a, b, c) {
    if (n.isFunction(b)) return n.grep(a, function (a, d) {
      return !!b.call(a, d, a) !== c;
    });if (b.nodeType) return n.grep(a, function (a) {
      return a === b !== c;
    });if ("string" == typeof b) {
      if (w.test(b)) return n.filter(b, a, c);b = n.filter(b, a);
    }return n.grep(a, function (a) {
      return g.call(b, a) >= 0 !== c;
    });
  }n.filter = function (a, b, c) {
    var d = b[0];return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function (a) {
      return 1 === a.nodeType;
    }));
  }, n.fn.extend({ find: function (a) {
      var b,
          c = this.length,
          d = [],
          e = this;if ("string" != typeof a) return this.pushStack(n(a).filter(function () {
        for (b = 0; c > b; b++) if (n.contains(e[b], this)) return !0;
      }));for (b = 0; c > b; b++) n.find(a, e[b], d);return d = this.pushStack(c > 1 ? n.unique(d) : d), d.selector = this.selector ? this.selector + " " + a : a, d;
    }, filter: function (a) {
      return this.pushStack(x(this, a || [], !1));
    }, not: function (a) {
      return this.pushStack(x(this, a || [], !0));
    }, is: function (a) {
      return !!x(this, "string" == typeof a && u.test(a) ? n(a) : a || [], !1).length;
    } });var y,
      z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
      A = n.fn.init = function (a, b) {
    var c, d;if (!a) return this;if ("string" == typeof a) {
      if (c = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : z.exec(a), !c || !c[1] && b) return !b || b.jquery ? (b || y).find(a) : this.constructor(b).find(a);if (c[1]) {
        if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : l, !0)), v.test(c[1]) && n.isPlainObject(b)) for (c in b) n.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);return this;
      }return d = l.getElementById(c[2]), d && d.parentNode && (this.length = 1, this[0] = d), this.context = l, this.selector = a, this;
    }return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? "undefined" != typeof y.ready ? y.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this));
  };A.prototype = n.fn, y = n(l);var B = /^(?:parents|prev(?:Until|All))/,
      C = { children: !0, contents: !0, next: !0, prev: !0 };n.extend({ dir: function (a, b, c) {
      var d = [],
          e = void 0 !== c;while ((a = a[b]) && 9 !== a.nodeType) if (1 === a.nodeType) {
        if (e && n(a).is(c)) break;d.push(a);
      }return d;
    }, sibling: function (a, b) {
      for (var c = []; a; a = a.nextSibling) 1 === a.nodeType && a !== b && c.push(a);return c;
    } }), n.fn.extend({ has: function (a) {
      var b = n(a, this),
          c = b.length;return this.filter(function () {
        for (var a = 0; c > a; a++) if (n.contains(this, b[a])) return !0;
      });
    }, closest: function (a, b) {
      for (var c, d = 0, e = this.length, f = [], g = u.test(a) || "string" != typeof a ? n(a, b || this.context) : 0; e > d; d++) for (c = this[d]; c && c !== b; c = c.parentNode) if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) {
        f.push(c);break;
      }return this.pushStack(f.length > 1 ? n.unique(f) : f);
    }, index: function (a) {
      return a ? "string" == typeof a ? g.call(n(a), this[0]) : g.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
    }, add: function (a, b) {
      return this.pushStack(n.unique(n.merge(this.get(), n(a, b))));
    }, addBack: function (a) {
      return this.add(null == a ? this.prevObject : this.prevObject.filter(a));
    } });function D(a, b) {
    while ((a = a[b]) && 1 !== a.nodeType);return a;
  }n.each({ parent: function (a) {
      var b = a.parentNode;return b && 11 !== b.nodeType ? b : null;
    }, parents: function (a) {
      return n.dir(a, "parentNode");
    }, parentsUntil: function (a, b, c) {
      return n.dir(a, "parentNode", c);
    }, next: function (a) {
      return D(a, "nextSibling");
    }, prev: function (a) {
      return D(a, "previousSibling");
    }, nextAll: function (a) {
      return n.dir(a, "nextSibling");
    }, prevAll: function (a) {
      return n.dir(a, "previousSibling");
    }, nextUntil: function (a, b, c) {
      return n.dir(a, "nextSibling", c);
    }, prevUntil: function (a, b, c) {
      return n.dir(a, "previousSibling", c);
    }, siblings: function (a) {
      return n.sibling((a.parentNode || {}).firstChild, a);
    }, children: function (a) {
      return n.sibling(a.firstChild);
    }, contents: function (a) {
      return a.contentDocument || n.merge([], a.childNodes);
    } }, function (a, b) {
    n.fn[a] = function (c, d) {
      var e = n.map(this, b, c);return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = n.filter(d, e)), this.length > 1 && (C[a] || n.unique(e), B.test(a) && e.reverse()), this.pushStack(e);
    };
  });var E = /\S+/g,
      F = {};function G(a) {
    var b = F[a] = {};return n.each(a.match(E) || [], function (a, c) {
      b[c] = !0;
    }), b;
  }n.Callbacks = function (a) {
    a = "string" == typeof a ? F[a] || G(a) : n.extend({}, a);var b,
        c,
        d,
        e,
        f,
        g,
        h = [],
        i = !a.once && [],
        j = function (l) {
      for (b = a.memory && l, c = !0, g = e || 0, e = 0, f = h.length, d = !0; h && f > g; g++) if (h[g].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
        b = !1;break;
      }d = !1, h && (i ? i.length && j(i.shift()) : b ? h = [] : k.disable());
    },
        k = { add: function () {
        if (h) {
          var c = h.length;!function g(b) {
            n.each(b, function (b, c) {
              var d = n.type(c);"function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && g(c);
            });
          }(arguments), d ? f = h.length : b && (e = c, j(b));
        }return this;
      }, remove: function () {
        return h && n.each(arguments, function (a, b) {
          var c;while ((c = n.inArray(b, h, c)) > -1) h.splice(c, 1), d && (f >= c && f--, g >= c && g--);
        }), this;
      }, has: function (a) {
        return a ? n.inArray(a, h) > -1 : !(!h || !h.length);
      }, empty: function () {
        return h = [], f = 0, this;
      }, disable: function () {
        return h = i = b = void 0, this;
      }, disabled: function () {
        return !h;
      }, lock: function () {
        return i = void 0, b || k.disable(), this;
      }, locked: function () {
        return !i;
      }, fireWith: function (a, b) {
        return !h || c && !i || (b = b || [], b = [a, b.slice ? b.slice() : b], d ? i.push(b) : j(b)), this;
      }, fire: function () {
        return k.fireWith(this, arguments), this;
      }, fired: function () {
        return !!c;
      } };return k;
  }, n.extend({ Deferred: function (a) {
      var b = [["resolve", "done", n.Callbacks("once memory"), "resolved"], ["reject", "fail", n.Callbacks("once memory"), "rejected"], ["notify", "progress", n.Callbacks("memory")]],
          c = "pending",
          d = { state: function () {
          return c;
        }, always: function () {
          return e.done(arguments).fail(arguments), this;
        }, then: function () {
          var a = arguments;return n.Deferred(function (c) {
            n.each(b, function (b, f) {
              var g = n.isFunction(a[b]) && a[b];e[f[1]](function () {
                var a = g && g.apply(this, arguments);a && n.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments);
              });
            }), a = null;
          }).promise();
        }, promise: function (a) {
          return null != a ? n.extend(a, d) : d;
        } },
          e = {};return d.pipe = d.then, n.each(b, function (a, f) {
        var g = f[2],
            h = f[3];d[f[1]] = g.add, h && g.add(function () {
          c = h;
        }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () {
          return e[f[0] + "With"](this === e ? d : this, arguments), this;
        }, e[f[0] + "With"] = g.fireWith;
      }), d.promise(e), a && a.call(e, e), e;
    }, when: function (a) {
      var b = 0,
          c = d.call(arguments),
          e = c.length,
          f = 1 !== e || a && n.isFunction(a.promise) ? e : 0,
          g = 1 === f ? a : n.Deferred(),
          h = function (a, b, c) {
        return function (e) {
          b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c);
        };
      },
          i,
          j,
          k;if (e > 1) for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++) c[b] && n.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f;return f || g.resolveWith(k, c), g.promise();
    } });var H;n.fn.ready = function (a) {
    return n.ready.promise().done(a), this;
  }, n.extend({ isReady: !1, readyWait: 1, holdReady: function (a) {
      a ? n.readyWait++ : n.ready(!0);
    }, ready: function (a) {
      (a === !0 ? --n.readyWait : n.isReady) || (n.isReady = !0, a !== !0 && --n.readyWait > 0 || (H.resolveWith(l, [n]), n.fn.triggerHandler && (n(l).triggerHandler("ready"), n(l).off("ready"))));
    } });function I() {
    l.removeEventListener("DOMContentLoaded", I, !1), a.removeEventListener("load", I, !1), n.ready();
  }n.ready.promise = function (b) {
    return H || (H = n.Deferred(), "complete" === l.readyState ? setTimeout(n.ready) : (l.addEventListener("DOMContentLoaded", I, !1), a.addEventListener("load", I, !1))), H.promise(b);
  }, n.ready.promise();var J = n.access = function (a, b, c, d, e, f, g) {
    var h = 0,
        i = a.length,
        j = null == c;if ("object" === n.type(c)) {
      e = !0;for (h in c) n.access(a, b, h, c[h], !0, f, g);
    } else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function (a, b, c) {
      return j.call(n(a), c);
    })), b)) for (; i > h; h++) b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c)));return e ? a : j ? b.call(a) : i ? b(a[0], c) : f;
  };n.acceptData = function (a) {
    return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType;
  };function K() {
    Object.defineProperty(this.cache = {}, 0, { get: function () {
        return {};
      } }), this.expando = n.expando + K.uid++;
  }K.uid = 1, K.accepts = n.acceptData, K.prototype = { key: function (a) {
      if (!K.accepts(a)) return 0;var b = {},
          c = a[this.expando];if (!c) {
        c = K.uid++;try {
          b[this.expando] = { value: c }, Object.defineProperties(a, b);
        } catch (d) {
          b[this.expando] = c, n.extend(a, b);
        }
      }return this.cache[c] || (this.cache[c] = {}), c;
    }, set: function (a, b, c) {
      var d,
          e = this.key(a),
          f = this.cache[e];if ("string" == typeof b) f[b] = c;else if (n.isEmptyObject(f)) n.extend(this.cache[e], b);else for (d in b) f[d] = b[d];return f;
    }, get: function (a, b) {
      var c = this.cache[this.key(a)];return void 0 === b ? c : c[b];
    }, access: function (a, b, c) {
      var d;return void 0 === b || b && "string" == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, n.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b);
    }, remove: function (a, b) {
      var c,
          d,
          e,
          f = this.key(a),
          g = this.cache[f];if (void 0 === b) this.cache[f] = {};else {
        n.isArray(b) ? d = b.concat(b.map(n.camelCase)) : (e = n.camelCase(b), b in g ? d = [b, e] : (d = e, d = d in g ? [d] : d.match(E) || [])), c = d.length;while (c--) delete g[d[c]];
      }
    }, hasData: function (a) {
      return !n.isEmptyObject(this.cache[a[this.expando]] || {});
    }, discard: function (a) {
      a[this.expando] && delete this.cache[a[this.expando]];
    } };var L = new K(),
      M = new K(),
      N = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
      O = /([A-Z])/g;function P(a, b, c) {
    var d;if (void 0 === c && 1 === a.nodeType) if (d = "data-" + b.replace(O, "-$1").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) {
      try {
        c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : N.test(c) ? n.parseJSON(c) : c;
      } catch (e) {}M.set(a, b, c);
    } else c = void 0;return c;
  }n.extend({ hasData: function (a) {
      return M.hasData(a) || L.hasData(a);
    }, data: function (a, b, c) {
      return M.access(a, b, c);
    }, removeData: function (a, b) {
      M.remove(a, b);
    }, _data: function (a, b, c) {
      return L.access(a, b, c);
    }, _removeData: function (a, b) {
      L.remove(a, b);
    } }), n.fn.extend({ data: function (a, b) {
      var c,
          d,
          e,
          f = this[0],
          g = f && f.attributes;if (void 0 === a) {
        if (this.length && (e = M.get(f), 1 === f.nodeType && !L.get(f, "hasDataAttrs"))) {
          c = g.length;while (c--) g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = n.camelCase(d.slice(5)), P(f, d, e[d])));L.set(f, "hasDataAttrs", !0);
        }return e;
      }return "object" == typeof a ? this.each(function () {
        M.set(this, a);
      }) : J(this, function (b) {
        var c,
            d = n.camelCase(a);if (f && void 0 === b) {
          if (c = M.get(f, a), void 0 !== c) return c;if (c = M.get(f, d), void 0 !== c) return c;if (c = P(f, d, void 0), void 0 !== c) return c;
        } else this.each(function () {
          var c = M.get(this, d);M.set(this, d, b), -1 !== a.indexOf("-") && void 0 !== c && M.set(this, a, b);
        });
      }, null, b, arguments.length > 1, null, !0);
    }, removeData: function (a) {
      return this.each(function () {
        M.remove(this, a);
      });
    } }), n.extend({ queue: function (a, b, c) {
      var d;return a ? (b = (b || "fx") + "queue", d = L.get(a, b), c && (!d || n.isArray(c) ? d = L.access(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0;
    }, dequeue: function (a, b) {
      b = b || "fx";var c = n.queue(a, b),
          d = c.length,
          e = c.shift(),
          f = n._queueHooks(a, b),
          g = function () {
        n.dequeue(a, b);
      };"inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire();
    }, _queueHooks: function (a, b) {
      var c = b + "queueHooks";return L.get(a, c) || L.access(a, c, { empty: n.Callbacks("once memory").add(function () {
          L.remove(a, [b + "queue", c]);
        }) });
    } }), n.fn.extend({ queue: function (a, b) {
      var c = 2;return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? n.queue(this[0], a) : void 0 === b ? this : this.each(function () {
        var c = n.queue(this, a, b);n._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && n.dequeue(this, a);
      });
    }, dequeue: function (a) {
      return this.each(function () {
        n.dequeue(this, a);
      });
    }, clearQueue: function (a) {
      return this.queue(a || "fx", []);
    }, promise: function (a, b) {
      var c,
          d = 1,
          e = n.Deferred(),
          f = this,
          g = this.length,
          h = function () {
        --d || e.resolveWith(f, [f]);
      };"string" != typeof a && (b = a, a = void 0), a = a || "fx";while (g--) c = L.get(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h));return h(), e.promise(b);
    } });var Q = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
      R = ["Top", "Right", "Bottom", "Left"],
      S = function (a, b) {
    return a = b || a, "none" === n.css(a, "display") || !n.contains(a.ownerDocument, a);
  },
      T = /^(?:checkbox|radio)$/i;!function () {
    var a = l.createDocumentFragment(),
        b = a.appendChild(l.createElement("div")),
        c = l.createElement("input");c.setAttribute("type", "radio"), c.setAttribute("checked", "checked"), c.setAttribute("name", "t"), b.appendChild(c), k.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", k.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue;
  }();var U = "undefined";k.focusinBubbles = "onfocusin" in a;var V = /^key/,
      W = /^(?:mouse|pointer|contextmenu)|click/,
      X = /^(?:focusinfocus|focusoutblur)$/,
      Y = /^([^.]*)(?:\.(.+)|)$/;function Z() {
    return !0;
  }function $() {
    return !1;
  }function _() {
    try {
      return l.activeElement;
    } catch (a) {}
  }n.event = { global: {}, add: function (a, b, c, d, e) {
      var f,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          o,
          p,
          q,
          r = L.get(a);if (r) {
        c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = n.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function (b) {
          return typeof n !== U && n.event.triggered !== b.type ? n.event.dispatch.apply(a, arguments) : void 0;
        }), b = (b || "").match(E) || [""], j = b.length;while (j--) h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o && (l = n.event.special[o] || {}, o = (e ? l.delegateType : l.bindType) || o, l = n.event.special[o] || {}, k = n.extend({ type: o, origType: q, data: d, handler: c, guid: c.guid, selector: e, needsContext: e && n.expr.match.needsContext.test(e), namespace: p.join(".") }, f), (m = i[o]) || (m = i[o] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(o, g, !1)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), n.event.global[o] = !0);
      }
    }, remove: function (a, b, c, d, e) {
      var f,
          g,
          h,
          i,
          j,
          k,
          l,
          m,
          o,
          p,
          q,
          r = L.hasData(a) && L.get(a);if (r && (i = r.events)) {
        b = (b || "").match(E) || [""], j = b.length;while (j--) if (h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) {
          l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = i[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length;while (f--) k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k));g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete i[o]);
        } else for (o in i) n.event.remove(a, o + b[j], c, d, !0);n.isEmptyObject(i) && (delete r.handle, L.remove(a, "events"));
      }
    }, trigger: function (b, c, d, e) {
      var f,
          g,
          h,
          i,
          k,
          m,
          o,
          p = [d || l],
          q = j.call(b, "type") ? b.type : b,
          r = j.call(b, "namespace") ? b.namespace.split(".") : [];if (g = h = d = d || l, 3 !== d.nodeType && 8 !== d.nodeType && !X.test(q + n.event.triggered) && (q.indexOf(".") >= 0 && (r = q.split("."), q = r.shift(), r.sort()), k = q.indexOf(":") < 0 && "on" + q, b = b[n.expando] ? b : new n.Event(q, "object" == typeof b && b), b.isTrigger = e ? 2 : 3, b.namespace = r.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + r.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : n.makeArray(c, [b]), o = n.event.special[q] || {}, e || !o.trigger || o.trigger.apply(d, c) !== !1)) {
        if (!e && !o.noBubble && !n.isWindow(d)) {
          for (i = o.delegateType || q, X.test(i + q) || (g = g.parentNode); g; g = g.parentNode) p.push(g), h = g;h === (d.ownerDocument || l) && p.push(h.defaultView || h.parentWindow || a);
        }f = 0;while ((g = p[f++]) && !b.isPropagationStopped()) b.type = f > 1 ? i : o.bindType || q, m = (L.get(g, "events") || {})[b.type] && L.get(g, "handle"), m && m.apply(g, c), m = k && g[k], m && m.apply && n.acceptData(g) && (b.result = m.apply(g, c), b.result === !1 && b.preventDefault());return b.type = q, e || b.isDefaultPrevented() || o._default && o._default.apply(p.pop(), c) !== !1 || !n.acceptData(d) || k && n.isFunction(d[q]) && !n.isWindow(d) && (h = d[k], h && (d[k] = null), n.event.triggered = q, d[q](), n.event.triggered = void 0, h && (d[k] = h)), b.result;
      }
    }, dispatch: function (a) {
      a = n.event.fix(a);var b,
          c,
          e,
          f,
          g,
          h = [],
          i = d.call(arguments),
          j = (L.get(this, "events") || {})[a.type] || [],
          k = n.event.special[a.type] || {};if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
        h = n.event.handlers.call(this, a, j), b = 0;while ((f = h[b++]) && !a.isPropagationStopped()) {
          a.currentTarget = f.elem, c = 0;while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped()) (!a.namespace_re || a.namespace_re.test(g.namespace)) && (a.handleObj = g, a.data = g.data, e = ((n.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== e && (a.result = e) === !1 && (a.preventDefault(), a.stopPropagation()));
        }return k.postDispatch && k.postDispatch.call(this, a), a.result;
      }
    }, handlers: function (a, b) {
      var c,
          d,
          e,
          f,
          g = [],
          h = b.delegateCount,
          i = a.target;if (h && i.nodeType && (!a.button || "click" !== a.type)) for (; i !== this; i = i.parentNode || this) if (i.disabled !== !0 || "click" !== a.type) {
        for (d = [], c = 0; h > c; c++) f = b[c], e = f.selector + " ", void 0 === d[e] && (d[e] = f.needsContext ? n(e, this).index(i) >= 0 : n.find(e, this, null, [i]).length), d[e] && d.push(f);d.length && g.push({ elem: i, handlers: d });
      }return h < b.length && g.push({ elem: this, handlers: b.slice(h) }), g;
    }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: { props: "char charCode key keyCode".split(" "), filter: function (a, b) {
        return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a;
      } }, mouseHooks: { props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function (a, b) {
        var c,
            d,
            e,
            f = b.button;return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || l, d = c.documentElement, e = c.body, a.pageX = b.clientX + (d && d.scrollLeft || e && e.scrollLeft || 0) - (d && d.clientLeft || e && e.clientLeft || 0), a.pageY = b.clientY + (d && d.scrollTop || e && e.scrollTop || 0) - (d && d.clientTop || e && e.clientTop || 0)), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a;
      } }, fix: function (a) {
      if (a[n.expando]) return a;var b,
          c,
          d,
          e = a.type,
          f = a,
          g = this.fixHooks[e];g || (this.fixHooks[e] = g = W.test(e) ? this.mouseHooks : V.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new n.Event(f), b = d.length;while (b--) c = d[b], a[c] = f[c];return a.target || (a.target = l), 3 === a.target.nodeType && (a.target = a.target.parentNode), g.filter ? g.filter(a, f) : a;
    }, special: { load: { noBubble: !0 }, focus: { trigger: function () {
          return this !== _() && this.focus ? (this.focus(), !1) : void 0;
        }, delegateType: "focusin" }, blur: { trigger: function () {
          return this === _() && this.blur ? (this.blur(), !1) : void 0;
        }, delegateType: "focusout" }, click: { trigger: function () {
          return "checkbox" === this.type && this.click && n.nodeName(this, "input") ? (this.click(), !1) : void 0;
        }, _default: function (a) {
          return n.nodeName(a.target, "a");
        } }, beforeunload: { postDispatch: function (a) {
          void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result);
        } } }, simulate: function (a, b, c, d) {
      var e = n.extend(new n.Event(), c, { type: a, isSimulated: !0, originalEvent: {} });d ? n.event.trigger(e, null, b) : n.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault();
    } }, n.removeEvent = function (a, b, c) {
    a.removeEventListener && a.removeEventListener(b, c, !1);
  }, n.Event = function (a, b) {
    return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? Z : $) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void (this[n.expando] = !0)) : new n.Event(a, b);
  }, n.Event.prototype = { isDefaultPrevented: $, isPropagationStopped: $, isImmediatePropagationStopped: $, preventDefault: function () {
      var a = this.originalEvent;this.isDefaultPrevented = Z, a && a.preventDefault && a.preventDefault();
    }, stopPropagation: function () {
      var a = this.originalEvent;this.isPropagationStopped = Z, a && a.stopPropagation && a.stopPropagation();
    }, stopImmediatePropagation: function () {
      var a = this.originalEvent;this.isImmediatePropagationStopped = Z, a && a.stopImmediatePropagation && a.stopImmediatePropagation(), this.stopPropagation();
    } }, n.each({ mouseenter: "mouseover", mouseleave: "mouseout", pointerenter: "pointerover", pointerleave: "pointerout" }, function (a, b) {
    n.event.special[a] = { delegateType: b, bindType: b, handle: function (a) {
        var c,
            d = this,
            e = a.relatedTarget,
            f = a.handleObj;return (!e || e !== d && !n.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c;
      } };
  }), k.focusinBubbles || n.each({ focus: "focusin", blur: "focusout" }, function (a, b) {
    var c = function (a) {
      n.event.simulate(b, a.target, n.event.fix(a), !0);
    };n.event.special[b] = { setup: function () {
        var d = this.ownerDocument || this,
            e = L.access(d, b);e || d.addEventListener(a, c, !0), L.access(d, b, (e || 0) + 1);
      }, teardown: function () {
        var d = this.ownerDocument || this,
            e = L.access(d, b) - 1;e ? L.access(d, b, e) : (d.removeEventListener(a, c, !0), L.remove(d, b));
      } };
  }), n.fn.extend({ on: function (a, b, c, d, e) {
      var f, g;if ("object" == typeof a) {
        "string" != typeof b && (c = c || b, b = void 0);for (g in a) this.on(g, b, c, a[g], e);return this;
      }if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1) d = $;else if (!d) return this;return 1 === e && (f = d, d = function (a) {
        return n().off(a), f.apply(this, arguments);
      }, d.guid = f.guid || (f.guid = n.guid++)), this.each(function () {
        n.event.add(this, a, d, c, b);
      });
    }, one: function (a, b, c, d) {
      return this.on(a, b, c, d, 1);
    }, off: function (a, b, c) {
      var d, e;if (a && a.preventDefault && a.handleObj) return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this;if ("object" == typeof a) {
        for (e in a) this.off(e, b, a[e]);return this;
      }return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = $), this.each(function () {
        n.event.remove(this, a, c, b);
      });
    }, trigger: function (a, b) {
      return this.each(function () {
        n.event.trigger(a, b, this);
      });
    }, triggerHandler: function (a, b) {
      var c = this[0];return c ? n.event.trigger(a, b, c, !0) : void 0;
    } });var ab = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
      bb = /<([\w:]+)/,
      cb = /<|&#?\w+;/,
      db = /<(?:script|style|link)/i,
      eb = /checked\s*(?:[^=]|=\s*.checked.)/i,
      fb = /^$|\/(?:java|ecma)script/i,
      gb = /^true\/(.*)/,
      hb = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
      ib = { option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""] };ib.optgroup = ib.option, ib.tbody = ib.tfoot = ib.colgroup = ib.caption = ib.thead, ib.th = ib.td;function jb(a, b) {
    return n.nodeName(a, "table") && n.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a;
  }function kb(a) {
    return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a;
  }function lb(a) {
    var b = gb.exec(a.type);return b ? a.type = b[1] : a.removeAttribute("type"), a;
  }function mb(a, b) {
    for (var c = 0, d = a.length; d > c; c++) L.set(a[c], "globalEval", !b || L.get(b[c], "globalEval"));
  }function nb(a, b) {
    var c, d, e, f, g, h, i, j;if (1 === b.nodeType) {
      if (L.hasData(a) && (f = L.access(a), g = L.set(b, f), j = f.events)) {
        delete g.handle, g.events = {};for (e in j) for (c = 0, d = j[e].length; d > c; c++) n.event.add(b, e, j[e][c]);
      }M.hasData(a) && (h = M.access(a), i = n.extend({}, h), M.set(b, i));
    }
  }function ob(a, b) {
    var c = a.getElementsByTagName ? a.getElementsByTagName(b || "*") : a.querySelectorAll ? a.querySelectorAll(b || "*") : [];return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], c) : c;
  }function pb(a, b) {
    var c = b.nodeName.toLowerCase();"input" === c && T.test(a.type) ? b.checked = a.checked : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue);
  }n.extend({ clone: function (a, b, c) {
      var d,
          e,
          f,
          g,
          h = a.cloneNode(!0),
          i = n.contains(a.ownerDocument, a);if (!(k.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a))) for (g = ob(h), f = ob(a), d = 0, e = f.length; e > d; d++) pb(f[d], g[d]);if (b) if (c) for (f = f || ob(a), g = g || ob(h), d = 0, e = f.length; e > d; d++) nb(f[d], g[d]);else nb(a, h);return g = ob(h, "script"), g.length > 0 && mb(g, !i && ob(a, "script")), h;
    }, buildFragment: function (a, b, c, d) {
      for (var e, f, g, h, i, j, k = b.createDocumentFragment(), l = [], m = 0, o = a.length; o > m; m++) if (e = a[m], e || 0 === e) if ("object" === n.type(e)) n.merge(l, e.nodeType ? [e] : e);else if (cb.test(e)) {
        f = f || k.appendChild(b.createElement("div")), g = (bb.exec(e) || ["", ""])[1].toLowerCase(), h = ib[g] || ib._default, f.innerHTML = h[1] + e.replace(ab, "<$1></$2>") + h[2], j = h[0];while (j--) f = f.lastChild;n.merge(l, f.childNodes), f = k.firstChild, f.textContent = "";
      } else l.push(b.createTextNode(e));k.textContent = "", m = 0;while (e = l[m++]) if ((!d || -1 === n.inArray(e, d)) && (i = n.contains(e.ownerDocument, e), f = ob(k.appendChild(e), "script"), i && mb(f), c)) {
        j = 0;while (e = f[j++]) fb.test(e.type || "") && c.push(e);
      }return k;
    }, cleanData: function (a) {
      for (var b, c, d, e, f = n.event.special, g = 0; void 0 !== (c = a[g]); g++) {
        if (n.acceptData(c) && (e = c[L.expando], e && (b = L.cache[e]))) {
          if (b.events) for (d in b.events) f[d] ? n.event.remove(c, d) : n.removeEvent(c, d, b.handle);L.cache[e] && delete L.cache[e];
        }delete M.cache[c[M.expando]];
      }
    } }), n.fn.extend({ text: function (a) {
      return J(this, function (a) {
        return void 0 === a ? n.text(this) : this.empty().each(function () {
          (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = a);
        });
      }, null, a, arguments.length);
    }, append: function () {
      return this.domManip(arguments, function (a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = jb(this, a);b.appendChild(a);
        }
      });
    }, prepend: function () {
      return this.domManip(arguments, function (a) {
        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
          var b = jb(this, a);b.insertBefore(a, b.firstChild);
        }
      });
    }, before: function () {
      return this.domManip(arguments, function (a) {
        this.parentNode && this.parentNode.insertBefore(a, this);
      });
    }, after: function () {
      return this.domManip(arguments, function (a) {
        this.parentNode && this.parentNode.insertBefore(a, this.nextSibling);
      });
    }, remove: function (a, b) {
      for (var c, d = a ? n.filter(a, this) : this, e = 0; null != (c = d[e]); e++) b || 1 !== c.nodeType || n.cleanData(ob(c)), c.parentNode && (b && n.contains(c.ownerDocument, c) && mb(ob(c, "script")), c.parentNode.removeChild(c));return this;
    }, empty: function () {
      for (var a, b = 0; null != (a = this[b]); b++) 1 === a.nodeType && (n.cleanData(ob(a, !1)), a.textContent = "");return this;
    }, clone: function (a, b) {
      return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () {
        return n.clone(this, a, b);
      });
    }, html: function (a) {
      return J(this, function (a) {
        var b = this[0] || {},
            c = 0,
            d = this.length;if (void 0 === a && 1 === b.nodeType) return b.innerHTML;if ("string" == typeof a && !db.test(a) && !ib[(bb.exec(a) || ["", ""])[1].toLowerCase()]) {
          a = a.replace(ab, "<$1></$2>");try {
            for (; d > c; c++) b = this[c] || {}, 1 === b.nodeType && (n.cleanData(ob(b, !1)), b.innerHTML = a);b = 0;
          } catch (e) {}
        }b && this.empty().append(a);
      }, null, a, arguments.length);
    }, replaceWith: function () {
      var a = arguments[0];return this.domManip(arguments, function (b) {
        a = this.parentNode, n.cleanData(ob(this)), a && a.replaceChild(b, this);
      }), a && (a.length || a.nodeType) ? this : this.remove();
    }, detach: function (a) {
      return this.remove(a, !0);
    }, domManip: function (a, b) {
      a = e.apply([], a);var c,
          d,
          f,
          g,
          h,
          i,
          j = 0,
          l = this.length,
          m = this,
          o = l - 1,
          p = a[0],
          q = n.isFunction(p);if (q || l > 1 && "string" == typeof p && !k.checkClone && eb.test(p)) return this.each(function (c) {
        var d = m.eq(c);q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b);
      });if (l && (c = n.buildFragment(a, this[0].ownerDocument, !1, this), d = c.firstChild, 1 === c.childNodes.length && (c = d), d)) {
        for (f = n.map(ob(c, "script"), kb), g = f.length; l > j; j++) h = c, j !== o && (h = n.clone(h, !0, !0), g && n.merge(f, ob(h, "script"))), b.call(this[j], h, j);if (g) for (i = f[f.length - 1].ownerDocument, n.map(f, lb), j = 0; g > j; j++) h = f[j], fb.test(h.type || "") && !L.access(h, "globalEval") && n.contains(i, h) && (h.src ? n._evalUrl && n._evalUrl(h.src) : n.globalEval(h.textContent.replace(hb, "")));
      }return this;
    } }), n.each({ appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith" }, function (a, b) {
    n.fn[a] = function (a) {
      for (var c, d = [], e = n(a), g = e.length - 1, h = 0; g >= h; h++) c = h === g ? this : this.clone(!0), n(e[h])[b](c), f.apply(d, c.get());return this.pushStack(d);
    };
  });var qb,
      rb = {};function sb(b, c) {
    var d,
        e = n(c.createElement(b)).appendTo(c.body),
        f = a.getDefaultComputedStyle && (d = a.getDefaultComputedStyle(e[0])) ? d.display : n.css(e[0], "display");return e.detach(), f;
  }function tb(a) {
    var b = l,
        c = rb[a];return c || (c = sb(a, b), "none" !== c && c || (qb = (qb || n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = qb[0].contentDocument, b.write(), b.close(), c = sb(a, b), qb.detach()), rb[a] = c), c;
  }var ub = /^margin/,
      vb = new RegExp("^(" + Q + ")(?!px)[a-z%]+$", "i"),
      wb = function (b) {
    return b.ownerDocument.defaultView.opener ? b.ownerDocument.defaultView.getComputedStyle(b, null) : a.getComputedStyle(b, null);
  };function xb(a, b, c) {
    var d,
        e,
        f,
        g,
        h = a.style;return c = c || wb(a), c && (g = c.getPropertyValue(b) || c[b]), c && ("" !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), vb.test(g) && ub.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 !== g ? g + "" : g;
  }function yb(a, b) {
    return { get: function () {
        return a() ? void delete this.get : (this.get = b).apply(this, arguments);
      } };
  }!function () {
    var b,
        c,
        d = l.documentElement,
        e = l.createElement("div"),
        f = l.createElement("div");if (f.style) {
      f.style.backgroundClip = "content-box", f.cloneNode(!0).style.backgroundClip = "", k.clearCloneStyle = "content-box" === f.style.backgroundClip, e.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute", e.appendChild(f);function g() {
        f.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", f.innerHTML = "", d.appendChild(e);var g = a.getComputedStyle(f, null);b = "1%" !== g.top, c = "4px" === g.width, d.removeChild(e);
      }a.getComputedStyle && n.extend(k, { pixelPosition: function () {
          return g(), b;
        }, boxSizingReliable: function () {
          return null == c && g(), c;
        }, reliableMarginRight: function () {
          var b,
              c = f.appendChild(l.createElement("div"));return c.style.cssText = f.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", c.style.marginRight = c.style.width = "0", f.style.width = "1px", d.appendChild(e), b = !parseFloat(a.getComputedStyle(c, null).marginRight), d.removeChild(e), f.removeChild(c), b;
        } });
    }
  }(), n.swap = function (a, b, c, d) {
    var e,
        f,
        g = {};for (f in b) g[f] = a.style[f], a.style[f] = b[f];e = c.apply(a, d || []);for (f in b) a.style[f] = g[f];return e;
  };var zb = /^(none|table(?!-c[ea]).+)/,
      Ab = new RegExp("^(" + Q + ")(.*)$", "i"),
      Bb = new RegExp("^([+-])=(" + Q + ")", "i"),
      Cb = { position: "absolute", visibility: "hidden", display: "block" },
      Db = { letterSpacing: "0", fontWeight: "400" },
      Eb = ["Webkit", "O", "Moz", "ms"];function Fb(a, b) {
    if (b in a) return b;var c = b[0].toUpperCase() + b.slice(1),
        d = b,
        e = Eb.length;while (e--) if (b = Eb[e] + c, b in a) return b;return d;
  }function Gb(a, b, c) {
    var d = Ab.exec(b);return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b;
  }function Hb(a, b, c, d, e) {
    for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2) "margin" === c && (g += n.css(a, c + R[f], !0, e)), d ? ("content" === c && (g -= n.css(a, "padding" + R[f], !0, e)), "margin" !== c && (g -= n.css(a, "border" + R[f] + "Width", !0, e))) : (g += n.css(a, "padding" + R[f], !0, e), "padding" !== c && (g += n.css(a, "border" + R[f] + "Width", !0, e)));return g;
  }function Ib(a, b, c) {
    var d = !0,
        e = "width" === b ? a.offsetWidth : a.offsetHeight,
        f = wb(a),
        g = "border-box" === n.css(a, "boxSizing", !1, f);if (0 >= e || null == e) {
      if (e = xb(a, b, f), (0 > e || null == e) && (e = a.style[b]), vb.test(e)) return e;d = g && (k.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0;
    }return e + Hb(a, b, c || (g ? "border" : "content"), d, f) + "px";
  }function Jb(a, b) {
    for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++) d = a[g], d.style && (f[g] = L.get(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && S(d) && (f[g] = L.access(d, "olddisplay", tb(d.nodeName)))) : (e = S(d), "none" === c && e || L.set(d, "olddisplay", e ? c : n.css(d, "display"))));for (g = 0; h > g; g++) d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none"));return a;
  }n.extend({ cssHooks: { opacity: { get: function (a, b) {
          if (b) {
            var c = xb(a, "opacity");return "" === c ? "1" : c;
          }
        } } }, cssNumber: { columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 }, cssProps: { "float": "cssFloat" }, style: function (a, b, c, d) {
      if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
        var e,
            f,
            g,
            h = n.camelCase(b),
            i = a.style;return b = n.cssProps[h] || (n.cssProps[h] = Fb(i, h)), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c ? g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, "string" === f && (e = Bb.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(n.css(a, b)), f = "number"), null != c && c === c && ("number" !== f || n.cssNumber[h] || (c += "px"), k.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), g && "set" in g && void 0 === (c = g.set(a, c, d)) || (i[b] = c)), void 0);
      }
    }, css: function (a, b, c, d) {
      var e,
          f,
          g,
          h = n.camelCase(b);return b = n.cssProps[h] || (n.cssProps[h] = Fb(a.style, h)), g = n.cssHooks[b] || n.cssHooks[h], g && "get" in g && (e = g.get(a, !0, c)), void 0 === e && (e = xb(a, b, d)), "normal" === e && b in Db && (e = Db[b]), "" === c || c ? (f = parseFloat(e), c === !0 || n.isNumeric(f) ? f || 0 : e) : e;
    } }), n.each(["height", "width"], function (a, b) {
    n.cssHooks[b] = { get: function (a, c, d) {
        return c ? zb.test(n.css(a, "display")) && 0 === a.offsetWidth ? n.swap(a, Cb, function () {
          return Ib(a, b, d);
        }) : Ib(a, b, d) : void 0;
      }, set: function (a, c, d) {
        var e = d && wb(a);return Gb(a, c, d ? Hb(a, b, d, "border-box" === n.css(a, "boxSizing", !1, e), e) : 0);
      } };
  }), n.cssHooks.marginRight = yb(k.reliableMarginRight, function (a, b) {
    return b ? n.swap(a, { display: "inline-block" }, xb, [a, "marginRight"]) : void 0;
  }), n.each({ margin: "", padding: "", border: "Width" }, function (a, b) {
    n.cssHooks[a + b] = { expand: function (c) {
        for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++) e[a + R[d] + b] = f[d] || f[d - 2] || f[0];return e;
      } }, ub.test(a) || (n.cssHooks[a + b].set = Gb);
  }), n.fn.extend({ css: function (a, b) {
      return J(this, function (a, b, c) {
        var d,
            e,
            f = {},
            g = 0;if (n.isArray(b)) {
          for (d = wb(a), e = b.length; e > g; g++) f[b[g]] = n.css(a, b[g], !1, d);return f;
        }return void 0 !== c ? n.style(a, b, c) : n.css(a, b);
      }, a, b, arguments.length > 1);
    }, show: function () {
      return Jb(this, !0);
    }, hide: function () {
      return Jb(this);
    }, toggle: function (a) {
      return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function () {
        S(this) ? n(this).show() : n(this).hide();
      });
    } });function Kb(a, b, c, d, e) {
    return new Kb.prototype.init(a, b, c, d, e);
  }n.Tween = Kb, Kb.prototype = { constructor: Kb, init: function (a, b, c, d, e, f) {
      this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? "" : "px");
    }, cur: function () {
      var a = Kb.propHooks[this.prop];return a && a.get ? a.get(this) : Kb.propHooks._default.get(this);
    }, run: function (a) {
      var b,
          c = Kb.propHooks[this.prop];return this.pos = b = this.options.duration ? n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Kb.propHooks._default.set(this), this;
    } }, Kb.prototype.init.prototype = Kb.prototype, Kb.propHooks = { _default: { get: function (a) {
        var b;return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = n.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop];
      }, set: function (a) {
        n.fx.step[a.prop] ? n.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[n.cssProps[a.prop]] || n.cssHooks[a.prop]) ? n.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now;
      } } }, Kb.propHooks.scrollTop = Kb.propHooks.scrollLeft = { set: function (a) {
      a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now);
    } }, n.easing = { linear: function (a) {
      return a;
    }, swing: function (a) {
      return .5 - Math.cos(a * Math.PI) / 2;
    } }, n.fx = Kb.prototype.init, n.fx.step = {};var Lb,
      Mb,
      Nb = /^(?:toggle|show|hide)$/,
      Ob = new RegExp("^(?:([+-])=|)(" + Q + ")([a-z%]*)$", "i"),
      Pb = /queueHooks$/,
      Qb = [Vb],
      Rb = { "*": [function (a, b) {
      var c = this.createTween(a, b),
          d = c.cur(),
          e = Ob.exec(b),
          f = e && e[3] || (n.cssNumber[a] ? "" : "px"),
          g = (n.cssNumber[a] || "px" !== f && +d) && Ob.exec(n.css(c.elem, a)),
          h = 1,
          i = 20;if (g && g[3] !== f) {
        f = f || g[3], e = e || [], g = +d || 1;do h = h || ".5", g /= h, n.style(c.elem, a, g + f); while (h !== (h = c.cur() / d) && 1 !== h && --i);
      }return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c;
    }] };function Sb() {
    return setTimeout(function () {
      Lb = void 0;
    }), Lb = n.now();
  }function Tb(a, b) {
    var c,
        d = 0,
        e = { height: a };for (b = b ? 1 : 0; 4 > d; d += 2 - b) c = R[d], e["margin" + c] = e["padding" + c] = a;return b && (e.opacity = e.width = a), e;
  }function Ub(a, b, c) {
    for (var d, e = (Rb[b] || []).concat(Rb["*"]), f = 0, g = e.length; g > f; f++) if (d = e[f].call(c, b, a)) return d;
  }function Vb(a, b, c) {
    var d,
        e,
        f,
        g,
        h,
        i,
        j,
        k,
        l = this,
        m = {},
        o = a.style,
        p = a.nodeType && S(a),
        q = L.get(a, "fxshow");c.queue || (h = n._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () {
      h.unqueued || i();
    }), h.unqueued++, l.always(function () {
      l.always(function () {
        h.unqueued--, n.queue(a, "fx").length || h.empty.fire();
      });
    })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [o.overflow, o.overflowX, o.overflowY], j = n.css(a, "display"), k = "none" === j ? L.get(a, "olddisplay") || tb(a.nodeName) : j, "inline" === k && "none" === n.css(a, "float") && (o.display = "inline-block")), c.overflow && (o.overflow = "hidden", l.always(function () {
      o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2];
    }));for (d in b) if (e = b[d], Nb.exec(e)) {
      if (delete b[d], f = f || "toggle" === e, e === (p ? "hide" : "show")) {
        if ("show" !== e || !q || void 0 === q[d]) continue;p = !0;
      }m[d] = q && q[d] || n.style(a, d);
    } else j = void 0;if (n.isEmptyObject(m)) "inline" === ("none" === j ? tb(a.nodeName) : j) && (o.display = j);else {
      q ? "hidden" in q && (p = q.hidden) : q = L.access(a, "fxshow", {}), f && (q.hidden = !p), p ? n(a).show() : l.done(function () {
        n(a).hide();
      }), l.done(function () {
        var b;L.remove(a, "fxshow");for (b in m) n.style(a, b, m[b]);
      });for (d in m) g = Ub(p ? q[d] : 0, d, l), d in q || (q[d] = g.start, p && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0));
    }
  }function Wb(a, b) {
    var c, d, e, f, g;for (c in a) if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && "expand" in g) {
      f = g.expand(f), delete a[d];for (c in f) c in a || (a[c] = f[c], b[c] = e);
    } else b[d] = e;
  }function Xb(a, b, c) {
    var d,
        e,
        f = 0,
        g = Qb.length,
        h = n.Deferred().always(function () {
      delete i.elem;
    }),
        i = function () {
      if (e) return !1;for (var b = Lb || Sb(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++) j.tweens[g].run(f);return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1);
    },
        j = h.promise({ elem: a, props: n.extend({}, b), opts: n.extend(!0, { specialEasing: {} }, c), originalProperties: b, originalOptions: c, startTime: Lb || Sb(), duration: c.duration, tweens: [], createTween: function (b, c) {
        var d = n.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing);return j.tweens.push(d), d;
      }, stop: function (b) {
        var c = 0,
            d = b ? j.tweens.length : 0;if (e) return this;for (e = !0; d > c; c++) j.tweens[c].run(1);return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this;
      } }),
        k = j.props;for (Wb(k, j.opts.specialEasing); g > f; f++) if (d = Qb[f].call(j, a, k, j.opts)) return d;return n.map(k, Ub, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, { elem: a, anim: j, queue: j.opts.queue })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always);
  }n.Animation = n.extend(Xb, { tweener: function (a, b) {
      n.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" ");for (var c, d = 0, e = a.length; e > d; d++) c = a[d], Rb[c] = Rb[c] || [], Rb[c].unshift(b);
    }, prefilter: function (a, b) {
      b ? Qb.unshift(a) : Qb.push(a);
    } }), n.speed = function (a, b, c) {
    var d = a && "object" == typeof a ? n.extend({}, a) : { complete: c || !c && b || n.isFunction(a) && a, duration: a, easing: c && b || b && !n.isFunction(b) && b };return d.duration = n.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function () {
      n.isFunction(d.old) && d.old.call(this), d.queue && n.dequeue(this, d.queue);
    }, d;
  }, n.fn.extend({ fadeTo: function (a, b, c, d) {
      return this.filter(S).css("opacity", 0).show().end().animate({ opacity: b }, a, c, d);
    }, animate: function (a, b, c, d) {
      var e = n.isEmptyObject(a),
          f = n.speed(b, c, d),
          g = function () {
        var b = Xb(this, n.extend({}, a), f);(e || L.get(this, "finish")) && b.stop(!0);
      };return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g);
    }, stop: function (a, b, c) {
      var d = function (a) {
        var b = a.stop;delete a.stop, b(c);
      };return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function () {
        var b = !0,
            e = null != a && a + "queueHooks",
            f = n.timers,
            g = L.get(this);if (e) g[e] && g[e].stop && d(g[e]);else for (e in g) g[e] && g[e].stop && Pb.test(e) && d(g[e]);for (e = f.length; e--;) f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1));(b || !c) && n.dequeue(this, a);
      });
    }, finish: function (a) {
      return a !== !1 && (a = a || "fx"), this.each(function () {
        var b,
            c = L.get(this),
            d = c[a + "queue"],
            e = c[a + "queueHooks"],
            f = n.timers,
            g = d ? d.length : 0;for (c.finish = !0, n.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;) f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1));for (b = 0; g > b; b++) d[b] && d[b].finish && d[b].finish.call(this);delete c.finish;
      });
    } }), n.each(["toggle", "show", "hide"], function (a, b) {
    var c = n.fn[b];n.fn[b] = function (a, d, e) {
      return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(Tb(b, !0), a, d, e);
    };
  }), n.each({ slideDown: Tb("show"), slideUp: Tb("hide"), slideToggle: Tb("toggle"), fadeIn: { opacity: "show" }, fadeOut: { opacity: "hide" }, fadeToggle: { opacity: "toggle" } }, function (a, b) {
    n.fn[a] = function (a, c, d) {
      return this.animate(b, a, c, d);
    };
  }), n.timers = [], n.fx.tick = function () {
    var a,
        b = 0,
        c = n.timers;for (Lb = n.now(); b < c.length; b++) a = c[b], a() || c[b] !== a || c.splice(b--, 1);c.length || n.fx.stop(), Lb = void 0;
  }, n.fx.timer = function (a) {
    n.timers.push(a), a() ? n.fx.start() : n.timers.pop();
  }, n.fx.interval = 13, n.fx.start = function () {
    Mb || (Mb = setInterval(n.fx.tick, n.fx.interval));
  }, n.fx.stop = function () {
    clearInterval(Mb), Mb = null;
  }, n.fx.speeds = { slow: 600, fast: 200, _default: 400 }, n.fn.delay = function (a, b) {
    return a = n.fx ? n.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function (b, c) {
      var d = setTimeout(b, a);c.stop = function () {
        clearTimeout(d);
      };
    });
  }, function () {
    var a = l.createElement("input"),
        b = l.createElement("select"),
        c = b.appendChild(l.createElement("option"));a.type = "checkbox", k.checkOn = "" !== a.value, k.optSelected = c.selected, b.disabled = !0, k.optDisabled = !c.disabled, a = l.createElement("input"), a.value = "t", a.type = "radio", k.radioValue = "t" === a.value;
  }();var Yb,
      Zb,
      $b = n.expr.attrHandle;n.fn.extend({ attr: function (a, b) {
      return J(this, n.attr, a, b, arguments.length > 1);
    }, removeAttr: function (a) {
      return this.each(function () {
        n.removeAttr(this, a);
      });
    } }), n.extend({ attr: function (a, b, c) {
      var d,
          e,
          f = a.nodeType;if (a && 3 !== f && 8 !== f && 2 !== f) return typeof a.getAttribute === U ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), d = n.attrHooks[b] || (n.expr.match.bool.test(b) ? Zb : Yb)), void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = n.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), c) : void n.removeAttr(a, b));
    }, removeAttr: function (a, b) {
      var c,
          d,
          e = 0,
          f = b && b.match(E);if (f && 1 === a.nodeType) while (c = f[e++]) d = n.propFix[c] || c, n.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c);
    }, attrHooks: { type: { set: function (a, b) {
          if (!k.radioValue && "radio" === b && n.nodeName(a, "input")) {
            var c = a.value;return a.setAttribute("type", b), c && (a.value = c), b;
          }
        } } } }), Zb = { set: function (a, b, c) {
      return b === !1 ? n.removeAttr(a, c) : a.setAttribute(c, c), c;
    } }, n.each(n.expr.match.bool.source.match(/\w+/g), function (a, b) {
    var c = $b[b] || n.find.attr;$b[b] = function (a, b, d) {
      var e, f;return d || (f = $b[b], $b[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, $b[b] = f), e;
    };
  });var _b = /^(?:input|select|textarea|button)$/i;n.fn.extend({ prop: function (a, b) {
      return J(this, n.prop, a, b, arguments.length > 1);
    }, removeProp: function (a) {
      return this.each(function () {
        delete this[n.propFix[a] || a];
      });
    } }), n.extend({ propFix: { "for": "htmlFor", "class": "className" }, prop: function (a, b, c) {
      var d,
          e,
          f,
          g = a.nodeType;if (a && 3 !== g && 8 !== g && 2 !== g) return f = 1 !== g || !n.isXMLDoc(a), f && (b = n.propFix[b] || b, e = n.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b];
    }, propHooks: { tabIndex: { get: function (a) {
          return a.hasAttribute("tabindex") || _b.test(a.nodeName) || a.href ? a.tabIndex : -1;
        } } } }), k.optSelected || (n.propHooks.selected = { get: function (a) {
      var b = a.parentNode;return b && b.parentNode && b.parentNode.selectedIndex, null;
    } }), n.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
    n.propFix[this.toLowerCase()] = this;
  });var ac = /[\t\r\n\f]/g;n.fn.extend({ addClass: function (a) {
      var b,
          c,
          d,
          e,
          f,
          g,
          h = "string" == typeof a && a,
          i = 0,
          j = this.length;if (n.isFunction(a)) return this.each(function (b) {
        n(this).addClass(a.call(this, b, this.className));
      });if (h) for (b = (a || "").match(E) || []; j > i; i++) if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ac, " ") : " ")) {
        f = 0;while (e = b[f++]) d.indexOf(" " + e + " ") < 0 && (d += e + " ");g = n.trim(d), c.className !== g && (c.className = g);
      }return this;
    }, removeClass: function (a) {
      var b,
          c,
          d,
          e,
          f,
          g,
          h = 0 === arguments.length || "string" == typeof a && a,
          i = 0,
          j = this.length;if (n.isFunction(a)) return this.each(function (b) {
        n(this).removeClass(a.call(this, b, this.className));
      });if (h) for (b = (a || "").match(E) || []; j > i; i++) if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ac, " ") : "")) {
        f = 0;while (e = b[f++]) while (d.indexOf(" " + e + " ") >= 0) d = d.replace(" " + e + " ", " ");g = a ? n.trim(d) : "", c.className !== g && (c.className = g);
      }return this;
    }, toggleClass: function (a, b) {
      var c = typeof a;return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(n.isFunction(a) ? function (c) {
        n(this).toggleClass(a.call(this, c, this.className, b), b);
      } : function () {
        if ("string" === c) {
          var b,
              d = 0,
              e = n(this),
              f = a.match(E) || [];while (b = f[d++]) e.hasClass(b) ? e.removeClass(b) : e.addClass(b);
        } else (c === U || "boolean" === c) && (this.className && L.set(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : L.get(this, "__className__") || "");
      });
    }, hasClass: function (a) {
      for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++) if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(ac, " ").indexOf(b) >= 0) return !0;return !1;
    } });var bc = /\r/g;n.fn.extend({ val: function (a) {
      var b,
          c,
          d,
          e = this[0];{
        if (arguments.length) return d = n.isFunction(a), this.each(function (c) {
          var e;1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : n.isArray(e) && (e = n.map(e, function (a) {
            return null == a ? "" : a + "";
          })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e));
        });if (e) return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(bc, "") : null == c ? "" : c);
      }
    } }), n.extend({ valHooks: { option: { get: function (a) {
          var b = n.find.attr(a, "value");return null != b ? b : n.trim(n.text(a));
        } }, select: { get: function (a) {
          for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++) if (c = d[i], !(!c.selected && i !== e || (k.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && n.nodeName(c.parentNode, "optgroup"))) {
            if (b = n(c).val(), f) return b;g.push(b);
          }return g;
        }, set: function (a, b) {
          var c,
              d,
              e = a.options,
              f = n.makeArray(b),
              g = e.length;while (g--) d = e[g], (d.selected = n.inArray(d.value, f) >= 0) && (c = !0);return c || (a.selectedIndex = -1), f;
        } } } }), n.each(["radio", "checkbox"], function () {
    n.valHooks[this] = { set: function (a, b) {
        return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) >= 0 : void 0;
      } }, k.checkOn || (n.valHooks[this].get = function (a) {
      return null === a.getAttribute("value") ? "on" : a.value;
    });
  }), n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (a, b) {
    n.fn[b] = function (a, c) {
      return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b);
    };
  }), n.fn.extend({ hover: function (a, b) {
      return this.mouseenter(a).mouseleave(b || a);
    }, bind: function (a, b, c) {
      return this.on(a, null, b, c);
    }, unbind: function (a, b) {
      return this.off(a, null, b);
    }, delegate: function (a, b, c, d) {
      return this.on(b, a, c, d);
    }, undelegate: function (a, b, c) {
      return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c);
    } });var cc = n.now(),
      dc = /\?/;n.parseJSON = function (a) {
    return JSON.parse(a + "");
  }, n.parseXML = function (a) {
    var b, c;if (!a || "string" != typeof a) return null;try {
      c = new DOMParser(), b = c.parseFromString(a, "text/xml");
    } catch (d) {
      b = void 0;
    }return (!b || b.getElementsByTagName("parsererror").length) && n.error("Invalid XML: " + a), b;
  };var ec = /#.*$/,
      fc = /([?&])_=[^&]*/,
      gc = /^(.*?):[ \t]*([^\r\n]*)$/gm,
      hc = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
      ic = /^(?:GET|HEAD)$/,
      jc = /^\/\//,
      kc = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
      lc = {},
      mc = {},
      nc = "*/".concat("*"),
      oc = a.location.href,
      pc = kc.exec(oc.toLowerCase()) || [];function qc(a) {
    return function (b, c) {
      "string" != typeof b && (c = b, b = "*");var d,
          e = 0,
          f = b.toLowerCase().match(E) || [];if (n.isFunction(c)) while (d = f[e++]) "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c);
    };
  }function rc(a, b, c, d) {
    var e = {},
        f = a === mc;function g(h) {
      var i;return e[h] = !0, n.each(a[h] || [], function (a, h) {
        var j = h(b, c, d);return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1);
      }), i;
    }return g(b.dataTypes[0]) || !e["*"] && g("*");
  }function sc(a, b) {
    var c,
        d,
        e = n.ajaxSettings.flatOptions || {};for (c in b) void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]);return d && n.extend(!0, a, d), a;
  }function tc(a, b, c) {
    var d,
        e,
        f,
        g,
        h = a.contents,
        i = a.dataTypes;while ("*" === i[0]) i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type"));if (d) for (e in h) if (h[e] && h[e].test(d)) {
      i.unshift(e);break;
    }if (i[0] in c) f = i[0];else {
      for (e in c) {
        if (!i[0] || a.converters[e + " " + i[0]]) {
          f = e;break;
        }g || (g = e);
      }f = f || g;
    }return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0;
  }function uc(a, b, c, d) {
    var e,
        f,
        g,
        h,
        i,
        j = {},
        k = a.dataTypes.slice();if (k[1]) for (g in a.converters) j[g.toLowerCase()] = a.converters[g];f = k.shift();while (f) if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift()) if ("*" === f) f = i;else if ("*" !== i && i !== f) {
      if (g = j[i + " " + f] || j["* " + f], !g) for (e in j) if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
        g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));break;
      }if (g !== !0) if (g && a["throws"]) b = g(b);else try {
        b = g(b);
      } catch (l) {
        return { state: "parsererror", error: g ? l : "No conversion from " + i + " to " + f };
      }
    }return { state: "success", data: b };
  }n.extend({ active: 0, lastModified: {}, etag: {}, ajaxSettings: { url: oc, type: "GET", isLocal: hc.test(pc[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: { "*": nc, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript" }, contents: { xml: /xml/, html: /html/, json: /json/ }, responseFields: { xml: "responseXML", text: "responseText", json: "responseJSON" }, converters: { "* text": String, "text html": !0, "text json": n.parseJSON, "text xml": n.parseXML }, flatOptions: { url: !0, context: !0 } }, ajaxSetup: function (a, b) {
      return b ? sc(sc(a, n.ajaxSettings), b) : sc(n.ajaxSettings, a);
    }, ajaxPrefilter: qc(lc), ajaxTransport: qc(mc), ajax: function (a, b) {
      "object" == typeof a && (b = a, a = void 0), b = b || {};var c,
          d,
          e,
          f,
          g,
          h,
          i,
          j,
          k = n.ajaxSetup({}, b),
          l = k.context || k,
          m = k.context && (l.nodeType || l.jquery) ? n(l) : n.event,
          o = n.Deferred(),
          p = n.Callbacks("once memory"),
          q = k.statusCode || {},
          r = {},
          s = {},
          t = 0,
          u = "canceled",
          v = { readyState: 0, getResponseHeader: function (a) {
          var b;if (2 === t) {
            if (!f) {
              f = {};while (b = gc.exec(e)) f[b[1].toLowerCase()] = b[2];
            }b = f[a.toLowerCase()];
          }return null == b ? null : b;
        }, getAllResponseHeaders: function () {
          return 2 === t ? e : null;
        }, setRequestHeader: function (a, b) {
          var c = a.toLowerCase();return t || (a = s[c] = s[c] || a, r[a] = b), this;
        }, overrideMimeType: function (a) {
          return t || (k.mimeType = a), this;
        }, statusCode: function (a) {
          var b;if (a) if (2 > t) for (b in a) q[b] = [q[b], a[b]];else v.always(a[v.status]);return this;
        }, abort: function (a) {
          var b = a || u;return c && c.abort(b), x(0, b), this;
        } };if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || oc) + "").replace(ec, "").replace(jc, pc[1] + "//"), k.type = b.method || b.type || k.method || k.type, k.dataTypes = n.trim(k.dataType || "*").toLowerCase().match(E) || [""], null == k.crossDomain && (h = kc.exec(k.url.toLowerCase()), k.crossDomain = !(!h || h[1] === pc[1] && h[2] === pc[2] && (h[3] || ("http:" === h[1] ? "80" : "443")) === (pc[3] || ("http:" === pc[1] ? "80" : "443")))), k.data && k.processData && "string" != typeof k.data && (k.data = n.param(k.data, k.traditional)), rc(lc, k, b, v), 2 === t) return v;i = n.event && k.global, i && 0 === n.active++ && n.event.trigger("ajaxStart"), k.type = k.type.toUpperCase(), k.hasContent = !ic.test(k.type), d = k.url, k.hasContent || (k.data && (d = k.url += (dc.test(d) ? "&" : "?") + k.data, delete k.data), k.cache === !1 && (k.url = fc.test(d) ? d.replace(fc, "$1_=" + cc++) : d + (dc.test(d) ? "&" : "?") + "_=" + cc++)), k.ifModified && (n.lastModified[d] && v.setRequestHeader("If-Modified-Since", n.lastModified[d]), n.etag[d] && v.setRequestHeader("If-None-Match", n.etag[d])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + nc + "; q=0.01" : "") : k.accepts["*"]);for (j in k.headers) v.setRequestHeader(j, k.headers[j]);if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t)) return v.abort();u = "abort";for (j in { success: 1, error: 1, complete: 1 }) v[j](k[j]);if (c = rc(mc, k, b, v)) {
        v.readyState = 1, i && m.trigger("ajaxSend", [v, k]), k.async && k.timeout > 0 && (g = setTimeout(function () {
          v.abort("timeout");
        }, k.timeout));try {
          t = 1, c.send(r, x);
        } catch (w) {
          if (!(2 > t)) throw w;x(-1, w);
        }
      } else x(-1, "No Transport");function x(a, b, f, h) {
        var j,
            r,
            s,
            u,
            w,
            x = b;2 !== t && (t = 2, g && clearTimeout(g), c = void 0, e = h || "", v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, f && (u = tc(k, v, f)), u = uc(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (n.lastModified[d] = w), w = v.getResponseHeader("etag"), w && (n.etag[d] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + "", j ? o.resolveWith(l, [r, x, v]) : o.rejectWith(l, [v, x, s]), v.statusCode(q), q = void 0, i && m.trigger(j ? "ajaxSuccess" : "ajaxError", [v, k, j ? r : s]), p.fireWith(l, [v, x]), i && (m.trigger("ajaxComplete", [v, k]), --n.active || n.event.trigger("ajaxStop")));
      }return v;
    }, getJSON: function (a, b, c) {
      return n.get(a, b, c, "json");
    }, getScript: function (a, b) {
      return n.get(a, void 0, b, "script");
    } }), n.each(["get", "post"], function (a, b) {
    n[b] = function (a, c, d, e) {
      return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax({ url: a, type: b, dataType: e, data: c, success: d });
    };
  }), n._evalUrl = function (a) {
    return n.ajax({ url: a, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0 });
  }, n.fn.extend({ wrapAll: function (a) {
      var b;return n.isFunction(a) ? this.each(function (b) {
        n(this).wrapAll(a.call(this, b));
      }) : (this[0] && (b = n(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function () {
        var a = this;while (a.firstElementChild) a = a.firstElementChild;return a;
      }).append(this)), this);
    }, wrapInner: function (a) {
      return this.each(n.isFunction(a) ? function (b) {
        n(this).wrapInner(a.call(this, b));
      } : function () {
        var b = n(this),
            c = b.contents();c.length ? c.wrapAll(a) : b.append(a);
      });
    }, wrap: function (a) {
      var b = n.isFunction(a);return this.each(function (c) {
        n(this).wrapAll(b ? a.call(this, c) : a);
      });
    }, unwrap: function () {
      return this.parent().each(function () {
        n.nodeName(this, "body") || n(this).replaceWith(this.childNodes);
      }).end();
    } }), n.expr.filters.hidden = function (a) {
    return a.offsetWidth <= 0 && a.offsetHeight <= 0;
  }, n.expr.filters.visible = function (a) {
    return !n.expr.filters.hidden(a);
  };var vc = /%20/g,
      wc = /\[\]$/,
      xc = /\r?\n/g,
      yc = /^(?:submit|button|image|reset|file)$/i,
      zc = /^(?:input|select|textarea|keygen)/i;function Ac(a, b, c, d) {
    var e;if (n.isArray(b)) n.each(b, function (b, e) {
      c || wc.test(a) ? d(a, e) : Ac(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d);
    });else if (c || "object" !== n.type(b)) d(a, b);else for (e in b) Ac(a + "[" + e + "]", b[e], c, d);
  }n.param = function (a, b) {
    var c,
        d = [],
        e = function (a, b) {
      b = n.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b);
    };if (void 0 === b && (b = n.ajaxSettings && n.ajaxSettings.traditional), n.isArray(a) || a.jquery && !n.isPlainObject(a)) n.each(a, function () {
      e(this.name, this.value);
    });else for (c in a) Ac(c, a[c], b, e);return d.join("&").replace(vc, "+");
  }, n.fn.extend({ serialize: function () {
      return n.param(this.serializeArray());
    }, serializeArray: function () {
      return this.map(function () {
        var a = n.prop(this, "elements");return a ? n.makeArray(a) : this;
      }).filter(function () {
        var a = this.type;return this.name && !n(this).is(":disabled") && zc.test(this.nodeName) && !yc.test(a) && (this.checked || !T.test(a));
      }).map(function (a, b) {
        var c = n(this).val();return null == c ? null : n.isArray(c) ? n.map(c, function (a) {
          return { name: b.name, value: a.replace(xc, "\r\n") };
        }) : { name: b.name, value: c.replace(xc, "\r\n") };
      }).get();
    } }), n.ajaxSettings.xhr = function () {
    try {
      return new XMLHttpRequest();
    } catch (a) {}
  };var Bc = 0,
      Cc = {},
      Dc = { 0: 200, 1223: 204 },
      Ec = n.ajaxSettings.xhr();a.attachEvent && a.attachEvent("onunload", function () {
    for (var a in Cc) Cc[a]();
  }), k.cors = !!Ec && "withCredentials" in Ec, k.ajax = Ec = !!Ec, n.ajaxTransport(function (a) {
    var b;return k.cors || Ec && !a.crossDomain ? { send: function (c, d) {
        var e,
            f = a.xhr(),
            g = ++Bc;if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields) for (e in a.xhrFields) f[e] = a.xhrFields[e];a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest");for (e in c) f.setRequestHeader(e, c[e]);b = function (a) {
          return function () {
            b && (delete Cc[g], b = f.onload = f.onerror = null, "abort" === a ? f.abort() : "error" === a ? d(f.status, f.statusText) : d(Dc[f.status] || f.status, f.statusText, "string" == typeof f.responseText ? { text: f.responseText } : void 0, f.getAllResponseHeaders()));
          };
        }, f.onload = b(), f.onerror = b("error"), b = Cc[g] = b("abort");try {
          f.send(a.hasContent && a.data || null);
        } catch (h) {
          if (b) throw h;
        }
      }, abort: function () {
        b && b();
      } } : void 0;
  }), n.ajaxSetup({ accepts: { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" }, contents: { script: /(?:java|ecma)script/ }, converters: { "text script": function (a) {
        return n.globalEval(a), a;
      } } }), n.ajaxPrefilter("script", function (a) {
    void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET");
  }), n.ajaxTransport("script", function (a) {
    if (a.crossDomain) {
      var b, c;return { send: function (d, e) {
          b = n("<script>").prop({ async: !0, charset: a.scriptCharset, src: a.url }).on("load error", c = function (a) {
            b.remove(), c = null, a && e("error" === a.type ? 404 : 200, a.type);
          }), l.head.appendChild(b[0]);
        }, abort: function () {
          c && c();
        } };
    }
  });var Fc = [],
      Gc = /(=)\?(?=&|$)|\?\?/;n.ajaxSetup({ jsonp: "callback", jsonpCallback: function () {
      var a = Fc.pop() || n.expando + "_" + cc++;return this[a] = !0, a;
    } }), n.ajaxPrefilter("json jsonp", function (b, c, d) {
    var e,
        f,
        g,
        h = b.jsonp !== !1 && (Gc.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && Gc.test(b.data) && "data");return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Gc, "$1" + e) : b.jsonp !== !1 && (b.url += (dc.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function () {
      return g || n.error(e + " was not called"), g[0];
    }, b.dataTypes[0] = "json", f = a[e], a[e] = function () {
      g = arguments;
    }, d.always(function () {
      a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Fc.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0;
    }), "script") : void 0;
  }), n.parseHTML = function (a, b, c) {
    if (!a || "string" != typeof a) return null;"boolean" == typeof b && (c = b, b = !1), b = b || l;var d = v.exec(a),
        e = !c && [];return d ? [b.createElement(d[1])] : (d = n.buildFragment([a], b, e), e && e.length && n(e).remove(), n.merge([], d.childNodes));
  };var Hc = n.fn.load;n.fn.load = function (a, b, c) {
    if ("string" != typeof a && Hc) return Hc.apply(this, arguments);var d,
        e,
        f,
        g = this,
        h = a.indexOf(" ");return h >= 0 && (d = n.trim(a.slice(h)), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && n.ajax({ url: a, type: e, dataType: "html", data: b }).done(function (a) {
      f = arguments, g.html(d ? n("<div>").append(n.parseHTML(a)).find(d) : a);
    }).complete(c && function (a, b) {
      g.each(c, f || [a.responseText, b, a]);
    }), this;
  }, n.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (a, b) {
    n.fn[b] = function (a) {
      return this.on(b, a);
    };
  }), n.expr.filters.animated = function (a) {
    return n.grep(n.timers, function (b) {
      return a === b.elem;
    }).length;
  };var Ic = a.document.documentElement;function Jc(a) {
    return n.isWindow(a) ? a : 9 === a.nodeType && a.defaultView;
  }n.offset = { setOffset: function (a, b, c) {
      var d,
          e,
          f,
          g,
          h,
          i,
          j,
          k = n.css(a, "position"),
          l = n(a),
          m = {};"static" === k && (a.style.position = "relative"), h = l.offset(), f = n.css(a, "top"), i = n.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m);
    } }, n.fn.extend({ offset: function (a) {
      if (arguments.length) return void 0 === a ? this : this.each(function (b) {
        n.offset.setOffset(this, a, b);
      });var b,
          c,
          d = this[0],
          e = { top: 0, left: 0 },
          f = d && d.ownerDocument;if (f) return b = f.documentElement, n.contains(b, d) ? (typeof d.getBoundingClientRect !== U && (e = d.getBoundingClientRect()), c = Jc(f), { top: e.top + c.pageYOffset - b.clientTop, left: e.left + c.pageXOffset - b.clientLeft }) : e;
    }, position: function () {
      if (this[0]) {
        var a,
            b,
            c = this[0],
            d = { top: 0, left: 0 };return "fixed" === n.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], "html") || (d = a.offset()), d.top += n.css(a[0], "borderTopWidth", !0), d.left += n.css(a[0], "borderLeftWidth", !0)), { top: b.top - d.top - n.css(c, "marginTop", !0), left: b.left - d.left - n.css(c, "marginLeft", !0) };
      }
    }, offsetParent: function () {
      return this.map(function () {
        var a = this.offsetParent || Ic;while (a && !n.nodeName(a, "html") && "static" === n.css(a, "position")) a = a.offsetParent;return a || Ic;
      });
    } }), n.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (b, c) {
    var d = "pageYOffset" === c;n.fn[b] = function (e) {
      return J(this, function (b, e, f) {
        var g = Jc(b);return void 0 === f ? g ? g[c] : b[e] : void (g ? g.scrollTo(d ? a.pageXOffset : f, d ? f : a.pageYOffset) : b[e] = f);
      }, b, e, arguments.length, null);
    };
  }), n.each(["top", "left"], function (a, b) {
    n.cssHooks[b] = yb(k.pixelPosition, function (a, c) {
      return c ? (c = xb(a, b), vb.test(c) ? n(a).position()[b] + "px" : c) : void 0;
    });
  }), n.each({ Height: "height", Width: "width" }, function (a, b) {
    n.each({ padding: "inner" + a, content: b, "": "outer" + a }, function (c, d) {
      n.fn[d] = function (d, e) {
        var f = arguments.length && (c || "boolean" != typeof d),
            g = c || (d === !0 || e === !0 ? "margin" : "border");return J(this, function (b, c, d) {
          var e;return n.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g);
        }, b, f ? d : void 0, f, null);
      };
    });
  }), n.fn.size = function () {
    return this.length;
  }, n.fn.andSelf = n.fn.addBack, "function" == "function" && __webpack_require__(120) && !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
    return n;
  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));var Kc = a.jQuery,
      Lc = a.$;return n.noConflict = function (b) {
    return a.$ === n && (a.$ = Lc), b && a.jQuery === n && (a.jQuery = Kc), n;
  }, typeof b === U && (a.jQuery = a.$ = n), n;
});
//# sourceMappingURL=jquery.min.map

/***/ }),
/* 69 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_vue_router__ = __webpack_require__(122);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_src_components_index__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_src_components_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_src_components_index__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_src_components_timePick__ = __webpack_require__(77);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_src_components_timePick___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_src_components_timePick__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_src_components_cascade__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_src_components_cascade___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_src_components_cascade__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_src_components_uploader__ = __webpack_require__(78);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_src_components_uploader___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_src_components_uploader__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_src_components_pagination__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_src_components_pagination___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_src_components_pagination__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_src_components_dialog__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_src_components_dialog___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7_src_components_dialog__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_src_components_about__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8_src_components_about___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8_src_components_about__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_src_components_detailsDialog__ = __webpack_require__(73);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9_src_components_detailsDialog___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9_src_components_detailsDialog__);










__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]);

/* harmony default export */ __webpack_exports__["a"] = (new __WEBPACK_IMPORTED_MODULE_1_vue_router__["a" /* default */]({
    routes: [{
        path: '/',
        name: 'Hello',
        component: __WEBPACK_IMPORTED_MODULE_2_src_components_index___default.a,
        children: [{
            path: "/",
            name: "timePick",
            component: __WEBPACK_IMPORTED_MODULE_3_src_components_timePick___default.a
        }, {
            path: "/cascade",
            name: "cascade",
            component: __WEBPACK_IMPORTED_MODULE_4_src_components_cascade___default.a
        }, {
            path: "/uploader",
            name: "uploader",
            component: __WEBPACK_IMPORTED_MODULE_5_src_components_uploader___default.a
        }, {
            path: "/pagination",
            name: "pagination",
            component: __WEBPACK_IMPORTED_MODULE_6_src_components_pagination___default.a
        }, {
            path: "/dialog",
            name: "dialog",
            component: __WEBPACK_IMPORTED_MODULE_7_src_components_dialog___default.a
        }, {
            path: "/detailsDialog",
            name: "detailsDialog",
            component: __WEBPACK_IMPORTED_MODULE_9_src_components_detailsDialog___default.a
        }, {
            path: "/about",
            name: "about",
            component: __WEBPACK_IMPORTED_MODULE_8_src_components_about___default.a
        }]
    }]
}));

/***/ }),
/* 70 */,
/* 71 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(112)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(124),
  /* template */
  __webpack_require__(94),
  /* scopeId */
  "data-v-498d09de",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(117)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(125),
  /* template */
  __webpack_require__(99),
  /* scopeId */
  "data-v-ccf97090",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(110)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(126),
  /* template */
  __webpack_require__(92),
  /* scopeId */
  "data-v-45c991a4",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(108)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(127),
  /* template */
  __webpack_require__(90),
  /* scopeId */
  "data-v-3279f418",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(105)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(128),
  /* template */
  __webpack_require__(87),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(106)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(129),
  /* template */
  __webpack_require__(88),
  /* scopeId */
  "data-v-1974c574",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(114)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(130),
  /* template */
  __webpack_require__(96),
  /* scopeId */
  "data-v-5203d93a",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(107)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(131),
  /* template */
  __webpack_require__(89),
  /* scopeId */
  "data-v-239a6f1a",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(119)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(132),
  /* template */
  __webpack_require__(101),
  /* scopeId */
  "data-v-ee5e8a04",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(111)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(133),
  /* template */
  __webpack_require__(93),
  /* scopeId */
  "data-v-49303368",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(118)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(134),
  /* template */
  __webpack_require__(100),
  /* scopeId */
  "data-v-ed16c42a",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(109)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(135),
  /* template */
  __webpack_require__(91),
  /* scopeId */
  "data-v-38f520bc",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(116)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(136),
  /* template */
  __webpack_require__(98),
  /* scopeId */
  "data-v-947e23fc",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(115)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(137),
  /* template */
  __webpack_require__(97),
  /* scopeId */
  "data-v-6eed6126",
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {


/* styles */
__webpack_require__(104)

var Component = __webpack_require__(3)(
  /* script */
  __webpack_require__(138),
  /* template */
  __webpack_require__(86),
  /* scopeId */
  null,
  /* cssModules */
  null
)

module.exports = Component.exports


/***/ }),
/* 86 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('label', {
    staticClass: "upLoaderFile",
    class: _vm.dataClass,
    style: (_vm.dataStyle),
    attrs: {
      "for": _vm.dataId
    }
  }, [_c('input', {
    staticClass: "dishidden fileSelectUpButton",
    attrs: {
      "type": "file",
      "name": "file",
      "id": _vm.dataId,
      "multiple": ""
    }
  }), _vm._v(" "), _vm._t("textWord", [_vm._v("上传")])], 2)
},staticRenderFns: []}

/***/ }),
/* 87 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('div', {
    staticClass: "hello"
  }, [_c('div', {
    attrs: {
      "id": "header"
    }
  }, [_c('a', {
    attrs: {
      "id": "logo",
      "href": "/"
    }
  }, [_c('span', [_vm._v(_vm._s(_vm.msg))])])])]), _vm._v(" "), _c('div', {
    attrs: {
      "id": "main"
    }
  }, [_c('div', {
    staticClass: "sidebar"
  }, [_c('ul', {
    staticClass: "menu-root"
  }, [_c('li', [_c('router-link', {
    attrs: {
      "to": "/"
    }
  }, [_vm._v("时间组件(posa-date-picker)")])], 1), _vm._v(" "), _c('li', [_c('router-link', {
    attrs: {
      "to": "/uploader"
    }
  }, [_vm._v("上传组件(posa-uploader)")])], 1), _vm._v(" "), _c('li', [_c('router-link', {
    attrs: {
      "to": "/cascade"
    }
  }, [_vm._v("三级联动(posa-cascade)")])], 1), _vm._v(" "), _c('li', [_c('router-link', {
    attrs: {
      "to": "/pagination"
    }
  }, [_vm._v("分页组件(posa-pagi-nation)")])], 1), _vm._v(" "), _c('li', [_c('router-link', {
    attrs: {
      "to": "/about"
    }
  }, [_vm._v("About")])], 1), _vm._v(" "), _c('li', [_c('router-link', {
    attrs: {
      "to": "/dialog"
    }
  }, [_vm._v("dialog组件(posa-dialog)")])], 1), _vm._v(" "), _c('li', [_c('router-link', {
    attrs: {
      "to": "/detailsDialog"
    }
  }, [_vm._v("dialogDetail组件(posa-dialog-detail)")])], 1)])]), _vm._v(" "), _c('div', {
    staticClass: "content"
  }, [_c('h1', {
    staticStyle: {
      "text-align": "left"
    }
  }, [_vm._v(_vm._s(_vm.msg))]), _vm._v(" "), _c('router-view')], 1)])])
},staticRenderFns: []}

/***/ }),
/* 88 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('posa-pagi-nation')], 1)
},staticRenderFns: []}

/***/ }),
/* 89 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('posa-uploader')], 1)
},staticRenderFns: []}

/***/ }),
/* 90 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "container-dialog"
  }, [_c('posa-dialog')], 1)
},staticRenderFns: []}

/***/ }),
/* 91 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return (_vm.response.dialogShow) ? _c('div', {
    staticClass: "model-dialog",
    class: {
      'modelAfter': _vm.bounceInUp
    }
  }, [_c('div', {
    staticClass: "dialog-main",
    class: {
      'bounceInUp': _vm.bounceInUp, 'bounceOutDown': _vm.bounceOutDown
    }
  }, [_c('p', {
    staticClass: "dialog-title-box"
  }, [_c('span', {
    staticClass: "dialog-title"
  }, [_vm._v(_vm._s(_vm.response.title))]), _vm._v(" "), _c('a', {
    staticClass: "fr icon-dialog-close",
    attrs: {
      "href": "javascript:void(0)"
    },
    on: {
      "click": _vm.closeDialog
    }
  })]), _vm._v(" "), _c('div', {
    staticStyle: {
      "height": "100%"
    }
  }, [_vm._t("libBox"), _vm._v(" "), _vm._t("realTimeBox")], 2)])]) : _vm._e()
},staticRenderFns: []}

/***/ }),
/* 92 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticStyle: {
      "width": "1500px",
      "margin-left": "-200px"
    }
  }, [_c('div', {
    staticClass: "list-content baselibBodyBox"
  }, [_c('div', {
    staticClass: "listItem"
  }, [_c('div', {
    staticClass: "details-content-item",
    on: {
      "click": _vm.showDetail
    }
  }, [_c('img', {
    attrs: {
      "src": "https://sf-sponsor.b0.upaiyun.com/4ea23eebe5bf3d21b6a8cfe99591a734.gif"
    }
  })])])]), _vm._v(" "), _c('posa-details-dialog', {
    attrs: {
      "details": _vm.detailsData,
      "detailindex": _vm.detailIndex,
      "isshow": _vm.isShowDetails,
      "detailtype": 'body',
      "pageheight": _vm.eventHeight
    },
    on: {
      "close-dialog": _vm.closeDialog
    }
  })], 1)
},staticRenderFns: []}

/***/ }),
/* 93 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _vm._m(0)
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    attrs: {
      "id": "cascade"
    }
  }, [_c('select', {
    staticClass: "prov",
    attrs: {
      "id": "prov",
      "name": "require"
    }
  }), _vm._v(" "), _c('select', {
    staticClass: "city",
    attrs: {
      "id": "city",
      "disabled": "disabled",
      "transition": "opacityfadeindown"
    }
  }), _vm._v(" "), _c('select', {
    staticClass: "dist",
    attrs: {
      "id": "dist",
      "disabled": "disabled",
      "transition": "opacityfadeindown"
    }
  }), _vm._v(" "), _c('input', {
    staticClass: "detail detailinput",
    attrs: {
      "id": "detail",
      "placeholder": "详细地址",
      "transition": "opacityfadeindown",
      "maxlength": "60"
    }
  })])
}]}

/***/ }),
/* 94 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('posa-about')], 1)
},staticRenderFns: []}

/***/ }),
/* 95 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    attrs: {
      "id": "app"
    }
  }, [_c('router-view')], 1)
},staticRenderFns: []}

/***/ }),
/* 96 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('posa-date-picker', {
    attrs: {
      "datetimeopt": _vm.searchData.dateTimeStart
    }
  })], 1)
},staticRenderFns: []}

/***/ }),
/* 97 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "datetime-area"
  }, [_c('input', {
    staticClass: "datetime-input",
    attrs: {
      "id": _vm.datetimeopt.id,
      "readonly": "",
      "type": "text",
      "placeholder": _vm.datetimeopt.placeholder
    }
  })])
},staticRenderFns: []}

/***/ }),
/* 98 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "page-content"
  }, [_c('div', {
    staticClass: "page-bar"
  }, [(1 != _vm.all) ? _c('ul', [_c('li', [(_vm.cutShow) ? _c('a', {
    on: {
      "click": _vm.cut
    }
  }, [_vm._v("<上一页")]) : _vm._e()]), _vm._v(" "), _vm._l((_vm.indexs), function(index) {
    return _c('li', {
      class: {
        active: _vm.cur == index
      }
    }, [_c('a', {
      on: {
        "click": function($event) {
          _vm.btnClick(index)
        }
      }
    }, [_vm._v(_vm._s(index))])])
  }), _vm._v(" "), _c('li', [_c('a', {
    on: {
      "click": _vm.add
    }
  }, [_vm._v("下一页>")])])], 2) : _vm._e()])])
},staticRenderFns: []}

/***/ }),
/* 99 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('posa-cascade')], 1)
},staticRenderFns: []}

/***/ }),
/* 100 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', [_c('div', {
    staticClass: "details-main"
  }, [_c('a', {
    staticClass: "detail-btn-close",
    attrs: {
      "href": "javascript:void(0)",
      "id": "detailClose_btn"
    },
    on: {
      "click": _vm.closeDialog
    }
  }), _vm._v(" "), _vm._t("default", [_c('div', {
    staticClass: "details-content"
  }, [_c('div', {
    staticClass: "left-pre"
  }, [_c('div', {
    staticClass: "left-pre-imge icon-last icon13441 icon-last-active",
    on: {
      "click": _vm.upClick
    }
  })]), _vm._v(" "), _c('div', {
    staticClass: "left-content",
    attrs: {
      "id": "showInfoBox"
    }
  }, [_c('div', {
    staticClass: "detailsImg",
    style: ({
      'background-image': 'url(' + this.details[this.detailindex].imageUrl + ')'
    }),
    attrs: {
      "id": "imgShowBox"
    }
  }), _vm._v(" "), _c('div', {
    attrs: {
      "id": "videoShowBox"
    }
  }, [_c('iframe', {
    staticClass: "videoImg",
    attrs: {
      "id": "videoImgBg",
      "scrolling": "no",
      "frameborder": "0",
      "align": "center"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "ocxBox",
    attrs: {
      "id": "ocxBox"
    }
  }), _vm._v(" "), _c('div', {
    staticClass: "videoTool"
  }, [_vm._m(0), _vm._v(" "), _c('div', {
    staticClass: "v_playInfo"
  }, [_c('div', {
    staticClass: "v_btnBox"
  }, [_c('a', {
    staticClass: "v_playBtn",
    attrs: {
      "href": "javascript:void(0)",
      "id": "v_playBtn",
      "title": "播放视频"
    },
    on: {
      "click": _vm.playVideo
    }
  }), _vm._v(" "), _c('a', {
    staticClass: "v_playOrPauseBtn v_PauseIcon",
    attrs: {
      "href": "javascript:void(0)",
      "id": "v_playOrPauseBtn"
    },
    on: {
      "click": _vm.playOrPauseVideo
    }
  }), _vm._v(" "), _c('a', {
    staticClass: "v_playSeepdBtn v_playSeepdLeftBtn",
    attrs: {
      "href": "javascript:void(0)",
      "title": "慢速播放"
    },
    on: {
      "click": _vm.playSpeedLeft
    }
  }), _vm._v(" "), _c('a', {
    staticClass: "v_playSeepdBtn v_playSeepdRightBtn",
    attrs: {
      "href": "javascript:void(0)",
      "title": "快速播放"
    },
    on: {
      "click": _vm.playSpeedRight
    }
  }), _vm._v(" "), _c('span', {
    attrs: {
      "id": "v_playInfoTxt"
    }
  })]), _vm._v(" "), _c('a', {
    staticClass: "v_fullBtn",
    attrs: {
      "href": "javascript:void(0)",
      "title": "全屏"
    },
    on: {
      "click": _vm.playFullWindow
    }
  }), _vm._v(" "), _vm._m(1)])])], 1)]), _vm._v(" "), _c('div', {
    staticClass: "vertical-bar"
  }), _vm._v(" "), _c('div', {
    staticClass: "right-content"
  }, [_c('div', {
    staticClass: "imageTools"
  }, [_vm._m(2), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.details[this.detailindex].searchImageUrl),
      expression: "this.details[this.detailindex].searchImageUrl"
    }],
    staticClass: "toolsContent"
  }, [_c('a', {
    staticClass: "toolLink",
    attrs: {
      "href": "javascript:void(0)",
      "title": "以图搜图"
    },
    on: {
      "click": function($event) {
        _vm.linkToBaselibSearch(this.details[this.detailindex].searchImageUrl)
      }
    }
  }, [_c('i', {
    staticClass: "searchImg"
  })]), _vm._v(" "), _c('i', {
    staticClass: "toolTips"
  }, [_vm._v("以图搜图")])])]), _vm._v(" "), _c('div', {
    staticClass: "lc-container"
  }, [_c('div', {
    staticClass: "top-title"
  }, [_c('p', [_vm._v(_vm._s(this.details[this.detailindex].imageName))])]), _vm._v(" "), _c('div', {
    staticClass: "cross-Line"
  }), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.detailtype == 'car'),
      expression: "this.detailtype=='car'"
    }],
    staticClass: "bottom-container"
  }, [_c('p', [_vm._v("车牌颜色："), _c('span', [_vm._v(_vm._s(_vm._f("ifPlateColor")(this.details[this.detailindex].color_Plate)))])]), _vm._v(" "), _c('p', [_vm._v("车牌类型："), _c('span', [_vm._v(_vm._s(_vm._f("ifPlateType")(this.details[this.detailindex].type_Plate)))])]), _vm._v(" "), _c('p', [_vm._v("车辆品牌："), _c('span', [_vm._v(_vm._s(_vm._f("ifVehicleBrand")(this.details[this.detailindex].sBrand)))])]), _vm._v(" "), _c('p', [_vm._v("车辆颜色："), _c('span', [_vm._v(_vm._s(_vm._f("ifVehiclecolor")(this.details[this.detailindex].vehicleColor)))])]), _vm._v(" "), _c('p', [_vm._v("车型子类："), _c('span', [_vm._v(_vm._s(_vm._f("ifVehicleSubBrand")(this.details[this.detailindex].sSubBrand)))])]), _vm._v(" "), _c('p', [_vm._v("行驶速度："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].passSpeed) + " km/h")])]), _vm._v(" "), _c('p', [_vm._v("通过卡口："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].passAddress))])]), _vm._v(" "), _c('p', [_vm._v("通过时间："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].passTime))])])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.detailtype == 'face'),
      expression: "this.detailtype=='face'"
    }],
    staticClass: "bottom-container"
  }, [_c('p', [_vm._v("类别："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].imageName))])]), _vm._v(" "), _c('p', [_vm._v("性别："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].sex))])]), _vm._v(" "), _c('p', [_vm._v("年龄："), _c('span', [_vm._v(_vm._s(_vm._f("faceScore")(this.details[this.detailindex].age)))])]), _vm._v(" "), _c('p', [_vm._v("经过时间："), _c('span', [_vm._v(_vm._s(_vm._f("dateTimeFormat")(this.details[this.detailindex].time)))])]), _vm._v(" "), _c('p', [_vm._v("拍摄地点："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].deviceName))])]), _vm._v(" "), _c('p', [_vm._v("微笑："), _c('span', [_vm._v(_vm._s(_vm._f("ifAttractive")(this.details[this.detailindex].smile)))])]), _vm._v(" "), _c('p', [_vm._v("眼镜："), _c('span', [_vm._v(_vm._s(_vm._f("ifAttractive")(this.details[this.detailindex].eyeGlass)))])]), _vm._v(" "), _c('p', [_vm._v("太阳镜："), _c('span', [_vm._v(_vm._s(_vm._f("ifAttractive")(this.details[this.detailindex].sunGlass)))])]), _vm._v(" "), _c('p', [_vm._v("颜值："), _c('span', [_vm._v(_vm._s(_vm._f("faceScore")(this.details[this.detailindex].attractive)))])])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.detailtype == 'body'),
      expression: "this.detailtype=='body'"
    }],
    staticClass: "bottom-container"
  }, [_c('p', [_vm._v("类别："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].imageName))])]), _vm._v(" "), _c('p', [_vm._v("经过时间："), _c('span', [_vm._v(_vm._s(_vm._f("dateTimeFormat")(this.details[this.detailindex].time)))])]), _vm._v(" "), _c('p', [_vm._v("拍摄地点："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].deviceName))])]), _vm._v(" "), _c('p', [_vm._v("上身颜色："), _c('span', [_vm._v(_vm._s(_vm._f("colorTrans")(this.details[this.detailindex].upperColor)))])]), _vm._v(" "), _c('p', [_vm._v("下身颜色："), _c('span', [_vm._v(_vm._s(_vm._f("colorTrans")(this.details[this.detailindex].lowerColor)))])]), _vm._v(" "), _c('p', [_vm._v("描述："), _c('span', [_vm._v(_vm._s(_vm._f("ifNUll")(this.details[this.detailindex].remark)))])])]), _vm._v(" "), _c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: (this.detailtype == 'upload'),
      expression: "this.detailtype=='upload'"
    }],
    staticClass: "bottom-container"
  }, [_c('p', [_vm._v("类别："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].imageType))])]), _vm._v(" "), _c('p', [_vm._v("上传人："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].userName))])]), _vm._v(" "), _c('p', [_vm._v("拍摄地点："), _c('span', [_vm._v(_vm._s(this.details[this.detailindex].deviceName))])]), _vm._v(" "), _c('p', [_vm._v("创建时间："), _c('span', [_vm._v(_vm._s(_vm._f("dateTimeFormat")(this.details[this.detailindex].createTime)))])]), _vm._v(" "), _c('p', [_vm._v("描述："), _c('span', [_vm._v(_vm._s(_vm._f("ifNUll")(this.details[this.detailindex].remark)))])]), _vm._v(" "), _c('p', [_vm._v("拍摄时间："), _c('span', {
    staticStyle: {
      "color": "#2d87f9!important"
    }
  }, [_vm._v(_vm._s(_vm._f("dateTimeFormat")(this.details[this.detailindex].time)))])])])])]), _vm._v(" "), _c('div', {
    staticClass: "right-pre"
  }, [_c('div', {
    staticClass: "right-pre-imge icon-next icon13441 icon-next-active",
    on: {
      "click": _vm.downClick
    }
  })])])])], 2)])
},staticRenderFns: [function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "v_playbar",
    attrs: {
      "id": "v_playbar",
      "alt": "进度条"
    }
  }, [_c('div', {
    staticClass: "v_curbar",
    attrs: {
      "id": "v_curbar"
    }
  })])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('span', {
    staticClass: "v_time"
  }, [_c('em', {
    attrs: {
      "id": "v_t_cur"
    }
  }, [_vm._v("00:00")]), _vm._v("/"), _c('em', {
    attrs: {
      "id": "v_t_total"
    }
  }, [_vm._v("00:00")])])
},function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "toolsContent"
  }, [_c('a', {
    attrs: {
      "id": "pic1",
      "target": "_blank",
      "title": "下载"
    }
  }, [_c('i', {
    staticClass: "downloadImg"
  })]), _vm._v(" "), _c('i', {
    staticClass: "toolTips"
  }, [_vm._v("下载")])])
}]}

/***/ }),
/* 101 */
/***/ (function(module, exports) {

module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
  return _c('div', {
    staticClass: "app-info"
  }, [_c('span', [_vm._v("应用：" + _vm._s(_vm.info.name))]), _vm._v(" "), _c('span', [_vm._v("版本：" + _vm._s(_vm.info.version))]), _vm._v(" "), _c('span', [_vm._v("简介：" + _vm._s(_vm.info.description))])])
},staticRenderFns: []}

/***/ }),
/* 102 */,
/* 103 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 104 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 105 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 106 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 107 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 108 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 109 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 110 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 111 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 112 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 113 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 114 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 115 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 116 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 117 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 118 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 119 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 120 */,
/* 121 */,
/* 122 */,
/* 123 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//


/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'app'
});

/***/ }),
/* 124 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'hello',
    data() {
        return {};
    }
});

/***/ }),
/* 125 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'hello',
    data() {
        return {
            msg: 'VDT开发组件',
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    }
});

/***/ }),
/* 126 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: '',
    data() {
        return {
            eventHeight: 20,
            isShowDetails: false,
            detailIndex: 0,
            msg: 'VDT开发组件',
            detailsData: [{
                imageUrl: "https://sf-sponsor.b0.upaiyun.com/4ea23eebe5bf3d21b6a8cfe99591a734.gif",
                imageName: "人体",
                time: 1494319214187,
                upperColor: "红",
                lowerColor: "蓝",
                deviceName: "火车站",
                remark: "2333333333333",
                lineCount: 1,
                lineAllCount: 6
            }],
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    },
    mounted: function () {
        // body...
        var details = {
            imageUrl: "https://sf-sponsor.b0.upaiyun.com/4ea23eebe5bf3d21b6a8cfe99591a734.gif",
            imageName: "人体",
            time: 1494319214187,
            upperColor: "红",
            lowerColor: "蓝",
            deviceName: "火车站",
            remark: "2333333333333",
            lineCount: 1,
            lineAllCount: 6
        };

        this.detailsData.push(details);
    },
    methods: {
        showDetail: function () {
            this.isShowDetails = true;
        },
        closeDialog: function () {
            this.isShowDetails = false;
        }
    }
});

/***/ }),
/* 127 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: '',
    data() {
        return {
            msg: 'VDT开发组件',
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    }
});

/***/ }),
/* 128 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'hello',
    data() {
        return {
            msg: 'VDT开发组件',
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    }
});

/***/ }),
/* 129 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: '',
    data() {
        return {
            msg: 'VDT开发组件',
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    }
});

/***/ }),
/* 130 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'hello',
    data() {
        return {
            msg: 'VDT开发组件',
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    }
});

/***/ }),
/* 131 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: 'hello',
    data() {
        return {
            msg: 'VDT开发组件',
            searchData: {
                name: "",
                dateTimeStart: {
                    id: "startTime",
                    placeholder: "开始时间" //同步时间插件的时间
                },
                dateTimeEnd: {
                    id: "endTime",
                    placeholder: "结束时间" //同步时间插件的时间
                }
            }
        };
    }
});

/***/ }),
/* 132 */
/***/ (function(module, exports) {

//
//
//
//
//
//
//

module.exports = {
    name: "posaAbout",
    props: ['message'],
    data: function () {
        return {
            info: {
                name: "视频大数据.mock",
                version: "1.0.0.mock",
                description: "视频大数据.mock"
            }
        };
    },
    compiled: function () {}

};

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//
//
//
//
//
//
//
//
//
//
//
//

var citySelect = __webpack_require__(141);
var data = __webpack_require__(140).data;

function oo() {
    return {
        prov: "",
        city: "",
        dist: "",
        detail: ""
    };
};
module.exports = {
    //父组件数据的属性,
    name: "posaCascade",
    props: {
        value: {
            type: String,
            default: ""
        },
        cascadeopt: {
            type: Object,
            default: oo
        }
    },
    //数据对象
    data: function () {
        return {};
    },
    computed: {},
    methods: {},
    compiled: function () {},
    watch: {
        'cascadeopt': {
            handler: function (valtemp, oldVal) {
                var self = this;
                var setting = {
                    prov: self.cascadeopt.prov || '',
                    city: self.cascadeopt.city || '',
                    dist: self.cascadeopt.dist || '',
                    detail: self.cascadeopt.detail || '',
                    required: false,
                    url: data,
                    bind: function (val) {
                        // self.cascadeopt = val;
                        self.$emit("input", val);
                    }
                };
                $("#cascade").citySelect(setting);
            },
            deep: true
        }
    },
    mounted: function () {
        var self = this;
        var setting = {
            prov: self.cascadeopt.prov || '',
            city: self.cascadeopt.city || '',
            dist: self.cascadeopt.dist || '',
            detail: self.cascadeopt.detail || '',
            required: false,
            url: data,
            bind: function (val) {
                self.$emit("input", val);
                // self.cascadeopt = val;
            }
        };
        $("#cascade").citySelect(setting);
    }
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 134 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($, jQuery) {Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__checkPlayer_check_player_js__ = __webpack_require__(142);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__checkPlayer_check_player_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__checkPlayer_check_player_js__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

var v_playInterval;
var v_playCloseInterval;
var page_this;

/* harmony default export */ __webpack_exports__["default"] = ({
    name: "posaDetailsDialog",
    props: ['details', "detailindex", "isshow", "detailtype", "pageheight"],
    mounted: function () {
        var self = this;
        page_this = this;
    },
    watch: {
        'isshow': function (val) {
            if (val) {
                this.showDialog();
                $(".details-main").slideDown(500);
                // $(".details-main").css({
                //     "left": "-30px",
                //     "width": document.getElementsByClassName("viewTypeContent")[0].offsetWidth
                // });
                var self = this;
                document.onkeydown = function (e) {
                    var ev = e || window.event || arguments.callee.caller.arguments[0];
                    if (ev.keyCode == 27) {

                        //判断当前是否为全屏播放，如果是，关闭全屏，如果不是则关闭details页面
                        if ($("#videoShowBox").attr('display') == 'block') {
                            var playOCX = document.getElementById("PlAY_OCX");
                            var bool = playOCX.IsControlFullScreen();
                        }

                        if (bool) {
                            playOCX.RestoreControlScreenShow(); //设置非全屏
                        } else {
                            self.closeDialog();
                        }
                    } else if (ev.keyCode == 37) {

                        self.upClick();
                    } else if (ev.keyCode == 39) {

                        self.downClick();
                    }
                };
            } else {
                $(".details-main").slideUp(500);
                clearPalyerInfo(0);
                $(".details-content-item .detailContent").removeClass("bg-c33");
            }
        },
        "detailindex": function () {
            debugger;
            this.showDialog();
            //添加未安装ocx提示
            this.$nextTick(function () {
                if ($("#videoShowBox").css("display") == "block") {
                    var isCanPlay = new __WEBPACK_IMPORTED_MODULE_0__checkPlayer_check_player_js___default.a().checkPlayerForDown(); //chk是否安装ocx控件
                }
            });
            if ($(".baselib-Container").scrollTop == self.pageheight && self.isshow) {
                $(".details-main").slideDown(500, function () {
                    $(".auxiliary-height").css("height", "0px");
                    $(".pageZoneHoldHigh").css("height", "0px");
                });
            }
        }
    },
    data: function () {
        return {};
    },
    methods: {
        linkToBaselibSearch: function (img) {
            var self = this;
            loading.showLoading("正在检索，请稍候...");
            self.$dispatch('baseLibImgSearchForDetails', img);
        },
        showDialog: function () {

            $(".details-content-item .detailContent").removeClass("bg-c33");
            $(".details-content-item .detailMain").removeClass("fc-cff");
            var appendAllIndex = this.details[this.detailindex].lineAllCount / 6;
            var appendIndex = this.details[this.detailindex].lineCount;
            var lineNumber = 1 + Math.floor(this.detailindex / (this.details[this.detailindex].lineCount / 6));
            if (this.details[this.detailindex].lineCount == appendAllIndex * 6) {
                appendIndex = (1 + Math.floor(this.detailindex / (this.details[this.detailindex].lineCount / 6))) * (this.details[this.detailindex].lineCount / 6) - 1;
            } else if (this.details[this.detailindex].lineCount < appendAllIndex * 6) {
                //不铺满时的计算
                var detailindexTemp = this.detailindex > 1 ? this.detailindex : 1;
                appendIndex = Math.ceil(detailindexTemp * 1.01 / appendAllIndex) * appendAllIndex - 1;

                //只有一行
                if (Math.ceil(detailindexTemp * 1.01 / appendAllIndex) * appendAllIndex - this.details[this.detailindex].lineCount >= 0) {
                    appendIndex = this.details[this.detailindex].lineCount - 1;
                }
                lineNumber = Math.ceil(detailindexTemp * 1.01 / appendAllIndex);
            } else {
                appendIndex = this.details[this.detailindex].lineCount - 1;
                lineNumber = 1;
            }
            if (this.details[this.detailindex].imageType == "主题库视频" && this.detailindex < appendAllIndex - 1 && this.details[this.detailindex].lineCount >= appendAllIndex) {
                appendIndex = appendIndex - 1;
            }
            // 主题库如果是首行第一个则显示下一行
            if (this.details[this.detailindex].imageType == "主题库视频" && this.detailindex % (appendAllIndex - 1) == 0 && this.detailindex !== 0) {
                appendIndex = this.details[this.detailindex].lineCount - 1;
            }
            var targetDom = $(".details-content-item")[appendIndex];
            $($(".details-content-item")[this.detailindex]).find(".detailContent").addClass("bg-c33");
            $($(".details-content-item")[this.detailindex]).find(".detailMain").addClass("fc-cff");

            $(targetDom).after($(".details-main"));
            var filterPanelHight = 0;
            if (this.detailtype == 'car') {
                filterPanelHight = 480;
            } else if (this.detailtype == 'face') {
                filterPanelHight = 460;
            } else if (this.detailtype == 'body') {
                filterPanelHight = 370;
            } else if (this.detailtype == 'upload') {
                filterPanelHight = 326;
            }

            //当为资源为视频时，隐藏图片，显示ocx视频控件
            if (this.details[this.detailindex].resourceType == '1') {
                $("#videoImgBg").css("background-image", "url(" + this.details[this.detailindex].imageUrl + ")").fadeIn();
                $("#videoShowBox").css("display", "block");
                $("#imgShowBox").css("display", "none");
            } else {
                //当不为视频资源时，显示图片
                $("#videoShowBox").css("display", "none");
                $("#imgShowBox").css("display", "block");
                $("#videoImgBg").hide();
            }
            clearPalyerInfo(0); //当视频播放时切换显示资源,用以清空视频播放信息
            $(".baselib-Container").scrollTop(this.pageheight);
        },
        closeDialog: function () {
            window.isShowDialogBool = false;
            // this.isshow = false;
            clearPalyerInfo(0);
            this.$emit("close-dialog", true);
            $(".details-content-item .detailMain").removeClass("fc-cff");

            $("#ocxBox").html(""); //清空掉ocx控件，防止上传出错
        },
        upClick: function () {
            if (this.detailindex >= 1) {
                this.detailindex--;
            } else {
                notify.success("已是第一条");
            }
            var tempH = $($(".details-content-item")[this.detailindex]).offset().top;
            if (this.isshow) {
                if ($(".details-main").offset().top < tempH) {
                    this.pageheight = tempH - 60 + $(".baselib-Container").scrollTop() - 550;
                } else {
                    this.pageheight = tempH - 60 + $(".baselib-Container").scrollTop();
                }
            }
        },
        downClick: function () {
            if (this.detailindex + 1 < this.details[this.detailindex].lineCount) {
                this.detailindex++;
            } else {
                notify.success("已是最后一条");
            }
            var tempH = $($(".details-content-item")[this.detailindex]).offset().top;
            if (this.isshow) {
                if ($(".details-main").offset().top < tempH) {
                    this.pageheight = tempH - 60 + $(".baselib-Container").scrollTop() - 550;
                } else {
                    this.pageheight = tempH - 60 + $(".baselib-Container").scrollTop();
                }
            }
        },
        playVideo: function () {
            var isCanPlay = new __WEBPACK_IMPORTED_MODULE_0__checkPlayer_check_player_js___default.a().checkPlayerForDown();
            if (isCanPlay) {
                clearPalyerInfo(0); //当视频播放时切换显示资源,用以清空视频播放信息
                playCloseInterval(); //启动监听

                //播放视频按钮 调用ocx播放视频
                var playOCX = document.getElementById("PlAY_OCX");
                var pfsIp = window.pfsIp; //pfs文件服务 IP
                var pfsPort = window.pfsPort; //pfs文件服务 端口
                var pfsUsername = window.pfsUsername; //pfs文件服务 用户名
                var pfsPassword = window.pfsPassword; //pfs文件服务 密码
                var pfsStorageRootDir = window.pfsStorageRootDir; //pfs文件服务 根目录

                $(playOCX).css("width", "100%");
                $(playOCX).css("height", "450px");

                //进度条滑块
                $("#v_playbar").slider({
                    slide: function (event, ui) {
                        setPlayTime(ui.value);
                    }
                });

                //播放路径不包含PFS信息，仅为文件路径
                var tempPath = this.details[this.detailindex].resourcePath;
                tempPath = tempPath.substring(tempPath.indexOf(":") + 1, tempPath.length);
                var videoPath = '{"type":3,"filename":"NPFS:' + pfsIp + ':' + pfsPort + '/username=' + pfsUsername + '&password=' + pfsPassword + '#' + tempPath + '","displayMode":0}';
                console.log("videoPath:" + videoPath);
                var playMsg = playOCX.PlayEx2(videoPath, 0, function playCallBack(index, result, userParam) {
                    console.log("playCallBack:" + result);
                    //播放动作完成后回调
                    //index为播放成功的窗口索引
                    //result为播放完成的结果， 0 表示成功，其他值表示失败，请参考错误返回类型， 如果失败，则不会触发
                    //userParam  与PlayEx2()中用户传入的userPlayParam值保持一致
                    if (result != "0") {
                        clearPalyerInfo(1); //当视频播放时切换显示资源,用以清空视频播放信息
                        $("#v_playInfoTxt").html("播放失败，错误码：" + result);
                        notify.warn("播放失败，错误码：" + result);
                    } else {
                        //显示播放暂停按钮，播放暂停调用ocx的TogglePlay方法
                        $("#v_playBtn").hide(); //隐藏播放按钮
                        $("#v_playOrPauseBtn").show(); //显示播放暂停按钮
                        $("#videoImgBg").fadeOut(); //关闭预览图
                        $("#v_playbar").slider(); //进度条滑块
                    }
                }, 0, function displayFirstFrameCallBack(index, result, userParam) {
                    console.log("displayFirstFrameCallBack:" + result);
                    //播放完成并真正显示出一帧画面时回调
                    //index 为播放成功的窗口索引
                    // result 0：为得到第一帧解码数据回调，//index为播放窗口索引
                    // result 0：为得到第一帧解码数据回调，-1：为10秒钟未得到解码数据回调， // userParam  用户参数，与PlayEx2()中用户传入的userDisplayFirstFrameParam值保持一致
                    if (result != "0") {
                        clearPalyerInfo(1); //当视频播放时切换显示资源,用以清空视频播放信息
                        $("#v_playInfoTxt").html("播放失败，错误码：" + result);
                        notify.warn("播放失败，错误码：" + result);
                    } else {
                        getPlayInfo(index, playOCX); //计时器开始,获取视频播放信息
                    }
                }, 0, function RecordEndCallBack(index, result, userParam) {
                    //index 为播放成功的窗口索引 result 0为录像结束 userParam  用户参数，与PlayEx2()中用户传入的lRecordEndParam值保持一致
                    //停止播放后,视频显示信息归位,不循环播放
                    //PVG能回调,PFS进不来
                    console.log("----------结束了----------");
                }, 0);

                console.log("playResult:" + playMsg);
                if (playMsg != "0") {
                    clearPalyerInfo(1); //当视频播放时切换显示资源,用以清空视频播放信息
                    $("#v_playInfoTxt").html("播放失败，错误码：" + playMsg);
                    notify.warn("播放失败，错误码：" + playMsg);
                }
            }
        },
        playOrPauseVideo: function () {
            //播放、暂停按钮点击事件
            //v_playOrPauseBtn v_playBtn
            var playOCX = document.getElementById("PlAY_OCX");
            var toggleMsg = playOCX.TogglePlay(0);
            //设置播放暂停按钮样式
            if ($("#v_playOrPauseBtn").hasClass("v_PauseIcon")) {
                $("#v_playOrPauseBtn").removeClass("v_PauseIcon").addClass("v_playIcon");
                //$("#v_playOrPauseBtn").html("播放");
                //计时器停止计时
                if (typeof v_playInterval != "undefined") {
                    clearInterval(v_playInterval);
                }
            } else if ($("#v_playOrPauseBtn").hasClass("v_playIcon")) {
                $("#v_playOrPauseBtn").removeClass("v_playIcon").addClass("v_PauseIcon");
                //$("#v_playOrPauseBtn").html("暂停");
                getPlayInfo(0, playOCX);
            }
        },
        playSpeedLeft: function () {
            //减速播放
            var playOCX = document.getElementById("PlAY_OCX");
            var nowSpeed = playOCX.GetPlayMode(0); //获取当前速度
            if ("ERROR" != nowSpeed) {
                if (nowSpeed != "1/8") {
                    var msg = playOCX.SetPlayMode(0, -1, 0);
                    nowSpeed = playOCX.GetPlayMode(0);
                    if (nowSpeed == "1") {
                        $("#v_playInfoTxt").html("");
                    } else {
                        $("#v_playInfoTxt").html("倍速：" + playOCX.GetPlayMode(0) + "x");
                    }
                } else {
                    $("#v_playInfoTxt").html("倍速：" + playOCX.GetPlayMode(0) + "x&nbsp;&nbsp;&nbsp;&nbsp;已到最小倍速");
                }
                //点击倍速会激活播放，需开启计时器
                $("#v_playOrPauseBtn").removeClass("v_playIcon").addClass("v_PauseIcon");
                getPlayInfo(0, playOCX);
            } else {
                $("#v_playInfoTxt").html("视频还未播放！");
            }
        },
        playSpeedRight: function () {
            //加速播放
            var playOCX = document.getElementById("PlAY_OCX");
            var nowSpeed = parseInt(playOCX.GetPlayMode(0)); //获取当前速度
            if (!isNaN(nowSpeed)) {
                if (nowSpeed < 8) {
                    //最大八倍速率播放
                    var msg = playOCX.SetPlayMode(0, 1, 0);
                    nowSpeed = playOCX.GetPlayMode(0);
                    if (nowSpeed == "1") {
                        $("#v_playInfoTxt").html("");
                    } else {
                        $("#v_playInfoTxt").html("倍速：" + playOCX.GetPlayMode(0) + "x");
                    }
                } else {
                    $("#v_playInfoTxt").html("倍速：" + playOCX.GetPlayMode(0) + "x&nbsp;&nbsp;&nbsp;&nbsp;已到最大倍速");
                }
                //点击倍速会激活播放，需开启计时器
                $("#v_playOrPauseBtn").removeClass("v_playIcon").addClass("v_PauseIcon");
                getPlayInfo(0, playOCX);
            } else {
                $("#v_playInfoTxt").html("视频还未播放！");
            }
        },
        //全屏播放
        playFullWindow: function () {
            var playOCX = document.getElementById("PlAY_OCX");
            var nowSpeed = parseInt(playOCX.GetPlayMode(0)); //获取当前速度
            if (!isNaN(nowSpeed)) {
                playOCX.SetControlFullScreen();
            } else {
                $("#v_playInfoTxt").html("视频还未播放！");
            }
        }
    }
});

//设定从哪一时间开始播放，传入当前需要播放的进度条值
function setPlayTime(Time) {
    var playOCX = document.getElementById("PlAY_OCX");
    //获取视频总长
    var vInfo = playOCX.GetVideoAttribute(0);
    vInfo = jQuery.parseJSON(vInfo);

    //设定当前需要播放的时间点
    var setTime = parseFloat(vInfo.duration) * (parseFloat(Time) / 100);
    var setTimeRp = playOCX.SetPlayMode(2, setTime, 0);
}

//计时器定时获取视频播放信息
function getPlayInfo(index, playOCX) {
    if (typeof v_playInterval != "undefined") {
        clearInterval(v_playInterval); //结束计时器   
    }
    var vInfo = playOCX.GetVideoAttribute(index);
    vInfo = jQuery.parseJSON(vInfo);
    $("#v_t_total").html(MillisecondToDate(vInfo.duration)); //设置总时长

    v_playInterval = setInterval(function () {
        var curTime = playOCX.GetPlayTime(0); //当前播放时间毫秒数
        $("#v_t_cur").html(MillisecondToDate(curTime)); //设置当前播放时间
        $("#v_curbar").css("width", curTime / vInfo.duration * 100 + "%"); //设置当前播放进度条
        $("#v_playbar span").css("left", curTime / vInfo.duration * 100 + "%"); //设置拖拽滑块位置
        $("#v_playbar span").css("background", "#830000"); //设置拖拽滑块css
        $("#v_playbar span").css("border", "none"); //设置拖拽滑块css
        //当全局设置关闭detail时，关闭详情显示
        if (window.videoImgDetail == false) {
            page_this.closeDialog();
        }
    }, 100);
}

//监听全局变量变化时，关闭detail窗口
function playCloseInterval() {
    v_playCloseInterval = setInterval(function () {
        //当全局设置关闭detail时，关闭详情显示
        if (window.videoImgDetail == false) {
            page_this.closeDialog();
        }
    }, 100);
}

//初始化视频播放信息,用以清空界面播放显示信息
function clearPalyerInfo(error) {
    $("#videoImg").show(); //
    $("#v_t_total").html("00:00");
    $("#v_t_cur").html("00:00");
    $("#v_curbar").css("width", "0%");
    $("#v_info").html("点击播放按钮播放视频"); //设置到页面上显示
    $("#v_playBtn").show(); //显示播放按钮
    $("#v_playOrPauseBtn").hide(); //隐藏播放暂停按钮
    $("#v_playOrPauseBtn").removeClass("v_playIcon").addClass("v_PauseIcon");
    $("#v_playInfoTxt").html("");
    $("#v_playbar span").css("left", "0%"); //设置拖拽滑块位置

    if (typeof v_playInterval != "undefined") {
        clearInterval(v_playInterval); //结束计时器   
    }
    if (typeof playCloseInterval != "undefined") {
        clearInterval(playCloseInterval); //结束监听
    }
    //因视频播放产生错误处理
    if (error == "1") {
        $("#videoImgBg").show();
    }
    var playOCX = document.getElementById("PlAY_OCX");
    try {
        var stopPaly = playOCX.StopEx(false, 0, function stopCallBack(index, result, userParam) {}, 1);
    } catch (e) {}
    //console.log("为统一处理停止播放问题,捕获当ocx未渲染完成时调用方法失败问题");


    //初始化ocx
    if (document.getElementById("ocxBox")) {
        var ocx = document.getElementById("ocxBox");
        var ocxHtml = '<object id="PlAY_OCX" class="UIOCX" type="applicatin/x-firebreath" style="witdh:1px; height:1px;"><param name="onload" value="pluginLoaded"/></object>';
        ocx.innerHTML = ocxHtml;
    }
    window.videoImgDetail = true; //重新设置全局变量为true，重置变量为初始值
}

//转换时间
function MillisecondToDate(msd) {
    var time = parseFloat(msd) / 1000;
    if (null != time && "" != time) {
        if (time > 60 && time < 60 * 60) {
            time = parseInt(time / 60.0) + "分" + parseInt((parseFloat(time / 60.0) - parseInt(time / 60.0)) * 60) + "秒";
        } else if (time >= 60 * 60 && time < 60 * 60 * 24) {
            time = parseInt(time / 3600.0) + "时" + parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) + "分" + parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) - parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
        } else {
            time = parseInt(time) + "秒";
        }
    }
    return time;
}
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1), __webpack_require__(1)))

/***/ }),
/* 135 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

function oo() {
    return {
        dialogShow: true,
        title: "vdt弹框"
    };
}
/* harmony default export */ __webpack_exports__["default"] = ({
    name: "posaDialog",
    props: {
        response: {
            type: Object,
            default: oo
        }
    },
    watch: {
        'response.dialogShow': function (value) {
            if (value) {
                $("body").find(".view").addClass("overflowY");
                // $("body").find(".subjectlib-Container").css("overflow", "hidden");
            } else {
                $("body").find(".view").removeClass("overflowY");
                // $("body").find(".subjectlib-Container").css("overflowY", "auto");
            }
        }
    },
    data: function () {

        return {
            // show:true,
            modelBg: false,
            bounceInUp: true,
            bounceOutDown: false
        };
    },
    events: {
        'close-dialog'() {
            this.closeDialog();
        }
    },
    methods: {
        /**
         * 关闭弹层
         * @return {[type]} [description]
         */
        closeDialog: function () {
            var self = this;
            this.response.dialogShow = "closeUpVideoPlay"; //先关闭视频回显
            this.$nextTick(function () {
                self.bounceInUp = false;
                self.bounceOutDown = true;
                try {
                    $("body").find(".realTimeOcxBoxVideo").empty();
                } catch (e) {}
                setTimeout(() => {
                    self.response.dialogShow = false;
                    self.bounceInUp = true;
                    self.bounceOutDown = false;
                    if (typeof self.response.isVideoPage != "undefined") {
                        console.log("==========is-special-close==========");
                        self.$emit('is-special-close', true);
                    } else {
                        console.log("==============child-close======================");
                        self.$emit('child-close', true);
                    }
                }, 1000);
            });
        }
    }
});
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1)))

/***/ }),
/* 136 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    name: "posaPagiNation",
    props: {
        cur: {
            type: Number,
            default: 1
        },
        all: {
            type: Number,
            default: 5
        },
        total: {
            type: Number,
            default: 5
        }
    },
    compiled: function () {
        if (this.all == 0 || this.all == 1) {
            this.all = 1;
        }
    },
    data: function () {
        return {
            cutShow: false
        };
    },
    watch: {
        'cur': function (val) {
            if (val >= 2) {
                this.cutShow = true;
            } else {
                this.cutShow = false;
            }
        }
    },
    computed: {
        indexs: function () {
            var left = 1;
            var right = this.all;
            var ar = [];
            if (this.all >= 11) {
                if (this.cur > 5 && this.cur < this.all - 4) {
                    left = this.cur - 5;
                    right = this.cur + 4;
                } else {
                    if (this.cur <= 5) {
                        left = 1;
                        right = 10;
                    } else {
                        right = this.all;
                        left = this.all - 9;
                    }
                }
            }
            while (left <= right) {
                ar.push(left);
                left++;
            }
            return ar;
        }
    },
    methods: {
        cut: function () {
            if (this.cur != 1) {
                this.cur--;
                $('.baselib-Container').animate({
                    scrollTop: 0
                }, 500);
                $('.plantform-Container').animate({
                    scrollTop: 0
                }, 500);
            }
        },
        add: function () {
            if (this.cur != this.all) {
                this.cur++;
                $('.baselib-Container').animate({
                    scrollTop: 0
                }, 500);
                $('.plantform-Container').animate({
                    scrollTop: 0
                }, 500);
            }
        },
        btnClick: function (data) {
            if (data != this.cur) {
                this.cur = data;
                this.$dispatch('btn-click', data);
                $('.baselib-Container').animate({
                    scrollTop: 0
                }, 500);
                $('.plantform-Container').animate({
                    scrollTop: 0
                }, 500);
            }
        }
    }
});
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1)))

/***/ }),
/* 137 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($) {//
//
//
//
//
//

var _ = __webpack_require__(70);
var jeDate = __webpack_require__(143);
module.exports = {
    name: "posaDatePicker",
    props: ['datetimeopt'],
    watch: {
        'datetimeopt.datetime': {
            handler: function (val, oldVal) {
                var self = this;
                if (val == "") {
                    $('#' + self.datetimeopt.id).val("");
                };
                var setting = {
                    dateCell: '#' + self.datetimeopt.id,
                    format: self.datetimeopt.format || 'YYYY-MM-DD hh:mm:ss',
                    minDate: '1970-01-01 00:00:00',
                    maxDate: self.datetimeopt.birthday ? $.nowDate() : '2099-12-31 23:59:59',
                    isinitVal: _.isNumber(val),
                    initVal: val,
                    isTime: true,
                    ishmsLimit: false,
                    ishmsVal: true,
                    isClear: true,
                    clearRestore: true,
                    festival: false,
                    zIndex: 999,
                    marks: null,
                    choosefun: function (elem, val) {
                        /*self.datetimeopt.datetime = new Date(val).getTime();*/
                        var time = val.toString();
                        self.datetimeopt.datetime = new Date(Date.parse(time.replace(/-/g, "/"))).getTime();
                    },
                    clearfun: function (elem, val) {
                        self.datetimeopt.datetime = "";
                    },
                    okfun: function (elem, val) {
                        var time = val.toString();
                        self.datetimeopt.datetime = new Date(Date.parse(time.replace(/-/g, "/"))).getTime();
                        /*self.datetimeopt.datetime = new Date(val).getTime();*/
                    }
                };
                $.jeDate(setting.dateCell, setting);
            },
            deep: true
        }
    },
    mounted: function () {
        var self = this;
        var setting = {
            dateCell: '#' + self.datetimeopt.id,
            format: self.datetimeopt.format || 'YYYY-MM-DD hh:mm:ss',
            minDate: '1900-08-19 00:00:00',
            maxDate: self.datetimeopt.birthday ? $.nowDate() : '2099-12-31 23:59:59',
            isinitVal: _.isNumber(self.datetimeopt.datetime),
            initVal: self.datetimeopt.datetime,
            isTime: true,
            ishmsLimit: false,
            ishmsVal: true,
            isClear: true,
            clearRestore: true,
            festival: false,
            zIndex: 999,
            marks: null,
            choosefun: function (elem, val) {
                var time = val.toString();
                self.datetimeopt.datetime = new Date(Date.parse(time.replace(/-/g, "/"))).getTime();
            },
            clearfun: function (elem, val) {
                self.datetimeopt.datetime = "";
            },
            okfun: function (elem, val) {
                var time = val.toString();
                self.datetimeopt.datetime = new Date(Date.parse(time.replace(/-/g, "/"))).getTime();
                /*self.datetimeopt.datetime = new Date(val).getTime();*/
            }
        };
        $.jeDate(setting.dateCell, setting);
    }
};
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 138 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function($) {Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//

var server_uploader_ulr = "";
var widget = __webpack_require__(35); //上传图片
var fileUpLoader = __webpack_require__(144); //上传图片
/* harmony default export */ __webpack_exports__["default"] = ({
    name: "posaUploader",
    props: {
        //不用管，父组件v-model传递值
        value: {
            type: '',
            default: ''
        },
        //需要给一个jquery取dom的id
        dataId: {
            type: String,
            default: 'fileImage'
        },
        //上传文件的类型
        dataType: {
            type: String,
            default: ''
        },
        //组件的文件的style
        dataStyle: {
            type: String,
            default: ''
        },
        //组件的文件的class
        dataClass: {
            type: String,
            default: ''
        },
        autoUpload: {
            type: false,
            default: ''
        },
        progressAll: {
            type: false,
            default: ''
        },
        actionUrl: {
            type: String,
            default: ''
        }
    },
    data: function () {
        return {
            fileObject: {
                name: '',
                sourceData: ''
            },
            dataTemp: {}
        };
    },
    computed: {},
    watch: {},
    methods: {
        // 绑定事件
        upLoaderEventHander: function () {
            var self = this;
            // //图片上传
            $("body").find('#' + this.dataId).fileupload({
                url: self.actionUrl,
                dataType: 'json',
                add: function (e, data) {
                    var message = "只允许上传";
                    //解决IE9下获取data.originalFiles失效，导致校验失败问题
                    var arrName = data.originalFiles[0].name.split(".");
                    var fileTypeStrTxt = arrName[arrName.length - 1];
                    self.dataTemp = data;
                    self.fileObject.name = arrName;
                    fileTypeStrTxt = fileTypeStrTxt.toLowerCase(); //无论大小写均转小写字母
                    if (self.dataType.indexOf(fileTypeStrTxt) < 0) {
                        self.$message.warning(message + self.dataType + '格式的文件');
                        return;
                    };
                    self.$emit('on-selected', data.originalFiles[0], data.fileInput[0].value);
                    if (self.autoUpload == false) {
                        data.submit();
                    }
                },
                progressall: function (e, data) {},
                done: function (e, data) {
                    self.fileObject.sourceData = data.result; //fileObject
                    self.$emit('input', JSON.stringify(self.fileObject)); //把fileImage给父组件v-model
                }
            });
        },
        upLoaderSubmit: function () {
            var self = this;
            self.dataTemp.submit();
        }
    },
    mounted: function () {
        this.upLoaderEventHander();
    }
});
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1)))

/***/ }),
/* 139 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery) {Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App__ = __webpack_require__(65);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__App___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__App__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__router__ = __webpack_require__(69);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__posasrc_index__ = __webpack_require__(67);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__posasrc_index___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__posasrc_index__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__posasrc_filter__ = __webpack_require__(66);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__posasrc_packages_jquery_min_js__ = __webpack_require__(68);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__posasrc_packages_jquery_min_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__posasrc_packages_jquery_min_js__);
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.






//全局处理
__webpack_provided_window_dot_jQuery = window.$ = __WEBPACK_IMPORTED_MODULE_5__posasrc_packages_jquery_min_js___default.a;
__WEBPACK_IMPORTED_MODULE_4__posasrc_filter__["a" /* default */].initFilter(__WEBPACK_IMPORTED_MODULE_0_vue___default.a);
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.config.productionTip = false;
__WEBPACK_IMPORTED_MODULE_0_vue___default.a.use(__WEBPACK_IMPORTED_MODULE_3__posasrc_index___default.a);
/* eslint-disable no-new */
window.testVue = new __WEBPACK_IMPORTED_MODULE_0_vue___default.a({
    el: '#app',
    router: __WEBPACK_IMPORTED_MODULE_2__router__["a" /* default */],
    template: '<App/>',
    components: { App: __WEBPACK_IMPORTED_MODULE_1__App___default.a }
});
/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(1)))

/***/ }),
/* 140 */
/***/ (function(module, exports) {

exports.data = { "citylist": [{ "p": "北京", "c": [{ "n": "东城区" }, { "n": "西城区" }, { "n": "崇文区" }, { "n": "宣武区" }, { "n": "朝阳区" }, { "n": "丰台区" }, { "n": "石景山区" }, { "n": "海淀区" }, { "n": "门头沟区" }, { "n": "房山区" }, { "n": "通州区" }, { "n": "顺义区" }, { "n": "昌平区" }, { "n": "大兴区" }, { "n": "平谷区" }, { "n": "怀柔区" }, { "n": "密云县" }, { "n": "延庆县" }] }, { "p": "天津", "c": [{ "n": "和平区" }, { "n": "河东区" }, { "n": "河西区" }, { "n": "南开区" }, { "n": "河北区" }, { "n": "红挢区" }, { "n": "滨海新区" }, { "n": "东丽区" }, { "n": "西青区" }, { "n": "津南区" }, { "n": "北辰区" }, { "n": "宁河区" }, { "n": "武清区" }, { "n": "静海县" }, { "n": "宝坻区" }, { "n": "蓟县" }] }, { "p": "河北", "c": [{ "n": "石家庄", "a": [{ "s": "长安区" }, { "s": "桥东区" }, { "s": "桥西区" }, { "s": "新华区" }, { "s": "井陉矿区" }, { "s": "裕华区" }, { "s": "井陉县" }, { "s": "正定县" }, { "s": "栾城县" }, { "s": "行唐县" }, { "s": "灵寿县" }, { "s": "高邑县" }, { "s": "深泽县" }, { "s": "赞皇县" }, { "s": "无极县" }, { "s": "平山县" }, { "s": "元氏县" }, { "s": "赵县" }, { "s": "辛集市" }, { "s": "藁城市" }, { "s": "晋州市" }, { "s": "新乐市" }, { "s": "鹿泉市" }] }, { "n": "唐山", "a": [{ "s": "路南区" }, { "s": "路北区" }, { "s": "古冶区" }, { "s": "开平区" }, { "s": "丰南区" }, { "s": "丰润区" }, { "s": "滦县" }, { "s": "滦南县" }, { "s": "乐亭县" }, { "s": "迁西县" }, { "s": "玉田县" }, { "s": "唐海县" }, { "s": "遵化市" }, { "s": "迁安市" }] }, { "n": "秦皇岛", "a": [{ "s": "海港区" }, { "s": "山海关区" }, { "s": "北戴河区" }, { "s": "青龙满族自治县" }, { "s": "昌黎县" }, { "s": "抚宁县" }, { "s": "卢龙县" }] }, { "n": "邯郸", "a": [{ "s": "邯山区" }, { "s": "丛台区" }, { "s": "复兴区" }, { "s": "峰峰矿区" }, { "s": "邯郸县" }, { "s": "临漳县" }, { "s": "成安县" }, { "s": "大名县" }, { "s": "涉县" }, { "s": "磁县" }, { "s": "肥乡县" }, { "s": "永年县" }, { "s": "邱县" }, { "s": "鸡泽县" }, { "s": "广平县" }, { "s": "馆陶县" }, { "s": "魏县" }, { "s": "曲周县" }, { "s": "武安市" }] }, { "n": "邢台", "a": [{ "s": "桥东区" }, { "s": "桥西区" }, { "s": "邢台县" }, { "s": "临城县" }, { "s": "内丘县" }, { "s": "柏乡县" }, { "s": "隆尧县" }, { "s": "任县" }, { "s": "南和县" }, { "s": "宁晋县" }, { "s": "巨鹿县" }, { "s": "新河县" }, { "s": "广宗县" }, { "s": "平乡县" }, { "s": "威县" }, { "s": "清河县" }, { "s": "临西县" }, { "s": "南宫市" }, { "s": "沙河市" }] }, { "n": "保定", "a": [{ "s": "新市区" }, { "s": "北市区" }, { "s": "南市区" }, { "s": "满城县" }, { "s": "清苑县" }, { "s": "涞水县" }, { "s": "阜平县" }, { "s": "徐水县" }, { "s": "定兴县" }, { "s": "唐县" }, { "s": "高阳县" }, { "s": "容城县" }, { "s": "涞源县" }, { "s": "望都县" }, { "s": "安新县" }, { "s": "易县" }, { "s": "曲阳县" }, { "s": "蠡县" }, { "s": "顺平县" }, { "s": "博野县" }, { "s": "雄县" }, { "s": "涿州市" }, { "s": "定州市" }, { "s": "安国市" }, { "s": "高碑店市" }] }, { "n": "张家口", "a": [{ "s": "桥东区" }, { "s": "桥西区" }, { "s": "宣化区" }, { "s": "下花园区" }, { "s": "宣化县" }, { "s": "张北县" }, { "s": "康保县" }, { "s": "沽源县" }, { "s": "尚义县" }, { "s": "蔚县" }, { "s": "阳原县" }, { "s": "怀安县" }, { "s": "万全县" }, { "s": "怀来县" }, { "s": "涿鹿县" }, { "s": "赤城县" }, { "s": "崇礼县" }] }, { "n": "承德", "a": [{ "s": "双桥区" }, { "s": "双滦区" }, { "s": "鹰手营子矿区" }, { "s": "承德县" }, { "s": "兴隆县" }, { "s": "平泉县" }, { "s": "滦平县" }, { "s": "隆化县" }, { "s": "丰宁满族自治县" }, { "s": "宽城满族自治县" }, { "s": "围场满族蒙古族自治县" }] }, { "n": "沧州", "a": [{ "s": "新华区" }, { "s": "运河区" }, { "s": "沧县" }, { "s": "青县" }, { "s": "东光县" }, { "s": "海兴县" }, { "s": "盐山县" }, { "s": "肃宁县" }, { "s": "南皮县" }, { "s": "吴桥县" }, { "s": "献县" }, { "s": "孟村回族自治县" }, { "s": "泊头市" }, { "s": "任丘市" }, { "s": "黄骅市" }, { "s": "河间市" }] }, { "n": "廊坊", "a": [{ "s": "安次区" }, { "s": "广阳区" }, { "s": "固安县" }, { "s": "永清县" }, { "s": "香河县" }, { "s": "大城县" }, { "s": "文安县" }, { "s": "大厂回族自治县" }, { "s": "霸州市" }, { "s": "三河市" }] }, { "n": "衡水", "a": [{ "s": "桃城区" }, { "s": "枣强县" }, { "s": "武邑县" }, { "s": "武强县" }, { "s": "饶阳县" }, { "s": "安平县" }, { "s": "故城县" }, { "s": "景县" }, { "s": "阜城县" }, { "s": "冀州市" }, { "s": "深州市" }] }] }, { "p": "山西", "c": [{ "n": "太原", "a": [{ "s": "小店区" }, { "s": "迎泽区" }, { "s": "杏花岭区" }, { "s": "尖草坪区" }, { "s": "万柏林区" }, { "s": "晋源区" }, { "s": "清徐县" }, { "s": "阳曲县" }, { "s": "娄烦县" }, { "s": "古交市" }] }, { "n": "大同", "a": [{ "s": "城区" }, { "s": "矿区" }, { "s": "南郊区" }, { "s": "新荣区" }, { "s": "阳高县" }, { "s": "天镇县" }, { "s": "广灵县" }, { "s": "灵丘县" }, { "s": "浑源县" }, { "s": "左云县" }, { "s": "大同县" }] }, { "n": "阳泉", "a": [{ "s": "城区" }, { "s": "矿区" }, { "s": "郊区" }, { "s": "平定县" }, { "s": "盂县" }] }, { "n": "长治", "a": [{ "s": "城区" }, { "s": "郊区" }, { "s": "长治县" }, { "s": "襄垣县" }, { "s": "屯留县" }, { "s": "平顺县" }, { "s": "黎城县" }, { "s": "壶关县" }, { "s": "长子县" }, { "s": "武乡县" }, { "s": "沁县" }, { "s": "沁源县" }, { "s": "潞城市" }] }, { "n": "晋城", "a": [{ "s": "城区" }, { "s": "沁水县" }, { "s": "阳城县" }, { "s": "陵川县" }, { "s": "泽州县" }, { "s": "高平市" }] }, { "n": "朔州", "a": [{ "s": "朔城区" }, { "s": "平鲁区" }, { "s": "山阴县" }, { "s": "应县" }, { "s": "右玉县" }, { "s": "怀仁县" }] }, { "n": "晋中", "a": [{ "s": "榆次区" }, { "s": "榆社县" }, { "s": "左权县" }, { "s": "和顺县" }, { "s": "昔阳县" }, { "s": "寿阳县" }, { "s": "太谷县" }, { "s": "祁县" }, { "s": "平遥县" }, { "s": "灵石县" }, { "s": "介休市" }] }, { "n": "运城", "a": [{ "s": "盐湖区" }, { "s": "临猗县" }, { "s": "万荣县" }, { "s": "闻喜县" }, { "s": "稷山县" }, { "s": "新绛县" }, { "s": "绛县" }, { "s": "垣曲县" }, { "s": "夏县" }, { "s": "平陆县" }, { "s": "芮城县" }, { "s": "永济市" }, { "s": "河津市" }] }, { "n": "忻州", "a": [{ "s": "忻府区" }, { "s": "定襄县" }, { "s": "五台县" }, { "s": "代县" }, { "s": "繁峙县" }, { "s": "宁武县" }, { "s": "静乐县" }, { "s": "神池县" }, { "s": "五寨县" }, { "s": "岢岚县" }, { "s": "河曲县" }, { "s": "保德县" }, { "s": "偏关县" }, { "s": "原平市" }] }, { "n": "临汾", "a": [{ "s": "尧都区" }, { "s": "曲沃县" }, { "s": "翼城县" }, { "s": "襄汾县" }, { "s": "洪洞县" }, { "s": "古县" }, { "s": "安泽县" }, { "s": "浮山县" }, { "s": "吉县" }, { "s": "乡宁县" }, { "s": "大宁县" }, { "s": "隰县" }, { "s": "永和县" }, { "s": "蒲县" }, { "s": "汾西县" }, { "s": "侯马市" }, { "s": "霍州市" }] }, { "n": "吕梁", "a": [{ "s": "离石区" }, { "s": "文水县" }, { "s": "交城县" }, { "s": "兴县" }, { "s": "临县" }, { "s": "柳林县" }, { "s": "石楼县" }, { "s": "岚县" }, { "s": "方山县" }, { "s": "中阳县" }, { "s": "交口县" }, { "s": "孝义市" }, { "s": "汾阳市" }] }] }, { "p": "内蒙古", "c": [{ "n": "呼和浩特", "a": [{ "s": "新城区" }, { "s": "回民区" }, { "s": "玉泉区" }, { "s": "赛罕区" }, { "s": "土默特左旗" }, { "s": "托克托县" }, { "s": "和林格尔县" }, { "s": "清水河县" }, { "s": "武川县" }] }, { "n": "包头", "a": [{ "s": "东河区" }, { "s": "昆都仑区" }, { "s": "青山区" }, { "s": "石拐区" }, { "s": "白云矿区" }, { "s": "九原区" }, { "s": "土默特右旗" }, { "s": "固阳县" }, { "s": "达尔罕茂明安联合旗" }] }, { "n": "乌海", "a": [{ "s": "海勃湾区" }, { "s": "海南区" }, { "s": "乌达区" }] }, { "n": "赤峰", "a": [{ "s": "红山区" }, { "s": "元宝山区" }, { "s": "松山区" }, { "s": "阿鲁科尔沁旗" }, { "s": "巴林左旗" }, { "s": "巴林右旗" }, { "s": "林西县" }, { "s": "克什克腾旗" }, { "s": "翁牛特旗" }, { "s": "喀喇沁旗" }, { "s": "宁城县" }, { "s": "敖汉旗" }] }, { "n": "通辽", "a": [{ "s": "科尔沁区" }, { "s": "科尔沁左翼中旗" }, { "s": "科尔沁左翼后旗" }, { "s": "开鲁县" }, { "s": "库伦旗" }, { "s": "奈曼旗" }, { "s": "扎鲁特旗" }, { "s": "霍林郭勒市" }] }, { "n": "鄂尔多斯", "a": [{ "s": "东胜区" }, { "s": "达拉特旗" }, { "s": "准格尔旗" }, { "s": "鄂托克前旗" }, { "s": "鄂托克旗" }, { "s": "杭锦旗" }, { "s": "乌审旗" }, { "s": "伊金霍洛旗" }] }, { "n": "呼伦贝尔", "a": [{ "s": "海拉尔区" }, { "s": "阿荣旗" }, { "s": "莫力达瓦达斡尔族自治旗" }, { "s": "鄂伦春自治旗" }, { "s": "鄂温克族自治旗" }, { "s": "陈巴尔虎旗" }, { "s": "新巴尔虎左旗" }, { "s": "新巴尔虎右旗" }, { "s": "满洲里市" }, { "s": "牙克石市" }, { "s": "扎兰屯市" }, { "s": "额尔古纳市" }, { "s": "根河市" }] }, { "n": "巴彦淖尔", "a": [{ "s": "临河区" }, { "s": "五原县" }, { "s": "磴口县" }, { "s": "乌拉特前旗" }, { "s": "乌拉特中旗" }, { "s": "乌拉特后旗" }, { "s": "杭锦后旗" }] }, { "n": "乌兰察布", "a": [{ "s": "集宁区" }, { "s": "卓资县" }, { "s": "化德县" }, { "s": "商都县" }, { "s": "兴和县" }, { "s": "凉城县" }, { "s": "察哈尔右翼前旗" }, { "s": "察哈尔右翼中旗" }, { "s": "察哈尔右翼后旗" }, { "s": "四子王旗" }, { "s": "丰镇市" }] }, { "n": "兴安", "a": [{ "s": "乌兰浩特市" }, { "s": "阿尔山市" }, { "s": "科尔沁右翼前旗" }, { "s": "科尔沁右翼中旗" }, { "s": "扎赉特旗" }, { "s": "突泉县" }] }, { "n": "锡林郭勒", "a": [{ "s": "二连浩特市" }, { "s": "锡林浩特市" }, { "s": "阿巴嘎旗" }, { "s": "苏尼特左旗" }, { "s": "苏尼特右旗" }, { "s": "东乌珠穆沁旗" }, { "s": "西乌珠穆沁旗" }, { "s": "太仆寺旗" }, { "s": "镶黄旗" }, { "s": "正镶白旗" }, { "s": "正蓝旗" }, { "s": "多伦县" }] }, { "n": "阿拉善", "a": [{ "s": "阿拉善左旗" }, { "s": "阿拉善右旗" }, { "s": "额济纳旗" }] }] }, { "p": "辽宁", "c": [{ "n": "沈阳", "a": [{ "s": "和平区" }, { "s": "沈河区" }, { "s": "大东区" }, { "s": "皇姑区" }, { "s": "铁西区" }, { "s": "苏家屯区" }, { "s": "东陵区" }, { "s": "新城子区" }, { "s": "于洪区" }, { "s": "辽中县" }, { "s": "康平县" }, { "s": "法库县" }, { "s": "新民市" }] }, { "n": "大连", "a": [{ "s": "中山区" }, { "s": "西岗区" }, { "s": "沙河口区" }, { "s": "甘井子区" }, { "s": "旅顺口区" }, { "s": "金州区" }, { "s": "长海县" }, { "s": "瓦房店市" }, { "s": "普兰店市" }, { "s": "庄河市" }] }, { "n": "鞍山", "a": [{ "s": "铁东区" }, { "s": "铁西区" }, { "s": "立山区" }, { "s": "千山区" }, { "s": "台安县" }, { "s": "210323" }, { "s": "海城市" }] }, { "n": "抚顺", "a": [{ "s": "新抚区" }, { "s": "东洲区" }, { "s": "望花区" }, { "s": "顺城区" }, { "s": "抚顺县" }, { "s": "新宾满族自治县" }, { "s": "清原满族自治县" }] }, { "n": "本溪", "a": [{ "s": "平山区" }, { "s": "溪湖区" }, { "s": "明山区" }, { "s": "南芬区" }, { "s": "本溪满族自治县" }, { "s": "桓仁满族自治县" }] }, { "n": "丹东", "a": [{ "s": "元宝区" }, { "s": "振兴区" }, { "s": "振安区" }, { "s": "宽甸满族自治县" }, { "s": "东港市" }, { "s": "凤城市" }] }, { "n": "锦州", "a": [{ "s": "古塔区" }, { "s": "凌河区" }, { "s": "太和区" }, { "s": "黑山县" }, { "s": "义县" }, { "s": "凌海市" }, { "s": "北镇市" }] }, { "n": "营口", "a": [{ "s": "站前区" }, { "s": "西市区" }, { "s": "鲅鱼圈区" }, { "s": "老边区" }, { "s": "盖州市" }, { "s": "大石桥市" }] }, { "n": "阜新", "a": [{ "s": "海州区" }, { "s": "新邱区" }, { "s": "太平区" }, { "s": "清河门区" }, { "s": "细河区" }, { "s": "阜新蒙古族自治县" }, { "s": "彰武县" }] }, { "n": "辽阳", "a": [{ "s": "白塔区" }, { "s": "文圣区" }, { "s": "宏伟区" }, { "s": "弓长岭区" }, { "s": "太子河区" }, { "s": "辽阳县" }, { "s": "灯塔市" }] }, { "n": "盘锦", "a": [{ "s": "双台子区" }, { "s": "兴隆台区" }, { "s": "大洼县" }, { "s": "盘山县" }] }, { "n": "铁岭", "a": [{ "s": "银州区" }, { "s": "清河区" }, { "s": "铁岭县" }, { "s": "西丰县" }, { "s": "昌图县" }, { "s": "调兵山市" }, { "s": "开原市" }] }, { "n": "朝阳", "a": [{ "s": "双塔区" }, { "s": "龙城区" }, { "s": "朝阳县" }, { "s": "建平县" }, { "s": "喀喇沁左翼蒙古族自治县" }, { "s": "北票市" }, { "s": "凌源市" }] }, { "n": "葫芦岛", "a": [{ "s": "连山区" }, { "s": "龙港区" }, { "s": "南票区" }, { "s": "绥中县" }, { "s": "建昌县" }, { "s": "兴城市" }] }] }, { "p": "吉林", "c": [{ "n": "长春", "a": [{ "s": "南关区" }, { "s": "宽城区" }, { "s": "朝阳区" }, { "s": "二道区" }, { "s": "绿园区" }, { "s": "双阳区" }, { "s": "农安县" }, { "s": "九台市" }, { "s": "榆树市" }, { "s": "德惠市" }] }, { "n": "吉林", "a": [{ "s": "昌邑区" }, { "s": "龙潭区" }, { "s": "船营区" }, { "s": "丰满区" }, { "s": "永吉县" }, { "s": "蛟河市" }, { "s": "桦甸市" }, { "s": "舒兰市" }, { "s": "磐石市" }] }, { "n": "四平", "a": [{ "s": "铁西区" }, { "s": "铁东区" }, { "s": "梨树县" }, { "s": "伊通满族自治县" }, { "s": "公主岭市" }, { "s": "双辽市" }] }, { "n": "辽源", "a": [{ "s": "龙山区" }, { "s": "西安区" }, { "s": "东丰县" }, { "s": "东辽县" }] }, { "n": "通化", "a": [{ "s": "东昌区" }, { "s": "二道江区" }, { "s": "通化县" }, { "s": "辉南县" }, { "s": "柳河县" }, { "s": "梅河口市" }, { "s": "集安市" }] }, { "n": "白山", "a": [{ "s": "八道江区" }, { "s": "江源区" }, { "s": "抚松县" }, { "s": "靖宇县" }, { "s": "长白朝鲜族自治县" }, { "s": "临江市" }] }, { "n": "松原", "a": [{ "s": "宁江区" }, { "s": "前郭尔罗斯蒙古族自治县" }, { "s": "长岭县" }, { "s": "乾安县" }, { "s": "扶余县" }] }, { "n": "白城", "a": [{ "s": "洮北区" }, { "s": "镇赉县" }, { "s": "通榆县" }, { "s": "洮南市" }, { "s": "大安市" }] }, { "n": "延边", "a": [{ "s": "延吉市" }, { "s": "图们市" }, { "s": "敦化市" }, { "s": "珲春市" }, { "s": "龙井市" }, { "s": "和龙市" }, { "s": "汪清县" }, { "s": "安图县" }] }] }, { "p": "黑龙江", "c": [{ "n": "哈尔滨", "a": [{ "s": "道里区" }, { "s": "南岗区" }, { "s": "道外区" }, { "s": "平房区" }, { "s": "松北区" }, { "s": "香坊区" }, { "s": "呼兰区" }, { "s": "阿城区" }, { "s": "依兰县" }, { "s": "方正县" }, { "s": "宾县" }, { "s": "巴彦县" }, { "s": "木兰县" }, { "s": "通河县" }, { "s": "延寿县" }, { "s": "双城市" }, { "s": "尚志市" }, { "s": "五常市" }] }, { "n": "齐齐哈尔", "a": [{ "s": "龙沙区" }, { "s": "建华区" }, { "s": "铁锋区" }, { "s": "昂昂溪区" }, { "s": "富拉尔基区" }, { "s": "碾子山区" }, { "s": "梅里斯达斡尔族区" }, { "s": "龙江县" }, { "s": "依安县" }, { "s": "泰来县" }, { "s": "甘南县" }, { "s": "富裕县" }, { "s": "克山县" }, { "s": "克东县" }, { "s": "拜泉县" }, { "s": "讷河市" }] }, { "n": "鸡西", "a": [{ "s": "鸡冠区" }, { "s": "恒山区" }, { "s": "滴道区" }, { "s": "梨树区" }, { "s": "城子河区" }, { "s": "麻山区" }, { "s": "鸡东县" }, { "s": "虎林市" }, { "s": "密山市" }] }, { "n": "鹤岗", "a": [{ "s": "向阳区" }, { "s": "工农区" }, { "s": "南山区" }, { "s": "兴安区" }, { "s": "东山区" }, { "s": "兴山区" }, { "s": "萝北县" }, { "s": "绥滨县" }] }, { "n": "双鸭山", "a": [{ "s": "尖山区" }, { "s": "岭东区" }, { "s": "四方台区" }, { "s": "宝山区" }, { "s": "集贤县" }, { "s": "友谊县" }, { "s": "宝清县" }, { "s": "饶河县" }] }, { "n": "大庆", "a": [{ "s": "萨尔图区" }, { "s": "龙凤区" }, { "s": "让胡路区" }, { "s": "红岗区" }, { "s": "大同区" }, { "s": "肇州县" }, { "s": "肇源县" }, { "s": "林甸县" }, { "s": "杜尔伯特蒙古族自治县" }] }, { "n": "伊春", "a": [{ "s": "伊春区" }, { "s": "南岔区" }, { "s": "友好区" }, { "s": "西林区" }, { "s": "翠峦区" }, { "s": "新青区" }, { "s": "美溪区" }, { "s": "金山屯区" }, { "s": "五营区" }, { "s": "乌马河区" }, { "s": "汤旺河区" }, { "s": "带岭区" }, { "s": "乌伊岭区" }, { "s": "红星区" }, { "s": "上甘岭区" }, { "s": "嘉荫县" }, { "s": "铁力市" }] }, { "n": "佳木斯", "a": [{ "s": "向阳区" }, { "s": "前进区" }, { "s": "东风区" }, { "s": "郊区" }, { "s": "桦南县" }, { "s": "桦川县" }, { "s": "汤原县" }, { "s": "抚远县" }, { "s": "同江市" }, { "s": "富锦市" }] }, { "n": "七台河", "a": [{ "s": "新兴区" }, { "s": "桃山区" }, { "s": "茄子河区" }, { "s": "勃利县" }] }, { "n": "牡丹江", "a": [{ "s": "东安区" }, { "s": "阳明区" }, { "s": "爱民区" }, { "s": "西安区" }, { "s": "东宁县" }, { "s": "林口县" }, { "s": "绥芬河市" }, { "s": "海林市" }, { "s": "宁安市" }, { "s": "穆棱市" }] }, { "n": "黑河", "a": [{ "s": "爱辉区" }, { "s": "嫩江县" }, { "s": "逊克县" }, { "s": "孙吴县" }, { "s": "北安市" }, { "s": "五大连池市" }] }, { "n": "绥化", "a": [{ "s": "北林区" }, { "s": "望奎县" }, { "s": "兰西县" }, { "s": "青冈县" }, { "s": "庆安县" }, { "s": "明水县" }, { "s": "绥棱县" }, { "s": "安达市" }, { "s": "肇东市" }, { "s": "海伦市" }] }, { "n": "大兴安岭", "a": [{ "s": "加格达奇区" }, { "s": "松岭区" }, { "s": "新林区" }, { "s": "呼中区" }, { "s": "呼玛县" }, { "s": "塔河县" }, { "s": "漠河县" }] }] }, { "p": "上海", "c": [{ "n": "黄浦区" }, { "n": "卢湾区" }, { "n": "徐汇区" }, { "n": "长宁区" }, { "n": "静安区" }, { "n": "普陀区" }, { "n": "闸北区" }, { "n": "虹口区" }, { "n": "杨浦区" }, { "n": "闵行区" }, { "n": "宝山区" }, { "n": "嘉定区" }, { "n": "浦东新区" }, { "n": "金山区" }, { "n": "松江区" }, { "n": "奉贤区" }, { "n": "青浦区" }, { "n": "崇明县" }] }, { "p": "江苏", "c": [{ "n": "南京", "a": [{ "s": "玄武区" }, { "s": "白下区" }, { "s": "秦淮区" }, { "s": "建邺区" }, { "s": "鼓楼区" }, { "s": "下关区" }, { "s": "浦口区" }, { "s": "栖霞区" }, { "s": "雨花台区" }, { "s": "江宁区" }, { "s": "六合区" }, { "s": "溧水县" }, { "s": "高淳县" }] }, { "n": "无锡", "a": [{ "s": "崇安区" }, { "s": "南长区" }, { "s": "北塘区" }, { "s": "锡山区" }, { "s": "惠山区" }, { "s": "滨湖区" }, { "s": "江阴市" }, { "s": "宜兴市" }] }, { "n": "徐州", "a": [{ "s": "鼓楼区" }, { "s": "云龙区" }, { "s": "九里区" }, { "s": "贾汪区" }, { "s": "泉山区" }, { "s": "丰县" }, { "s": "沛县" }, { "s": "铜山县" }, { "s": "睢宁县" }, { "s": "新沂市" }, { "s": "邳州市" }] }, { "n": "常州", "a": [{ "s": "天宁区" }, { "s": "钟楼区" }, { "s": "戚墅堰区" }, { "s": "新北区" }, { "s": "武进区" }, { "s": "溧阳市" }, { "s": "金坛市" }] }, { "n": "苏州", "a": [{ "s": "沧浪区" }, { "s": "平江区" }, { "s": "金阊区" }, { "s": "虎丘区" }, { "s": "吴中区" }, { "s": "相城区" }, { "s": "常熟市" }, { "s": "张家港市" }, { "s": "昆山市" }, { "s": "吴江市" }, { "s": "太仓市" }] }, { "n": "南通", "a": [{ "s": "崇川区" }, { "s": "港闸区" }, { "s": "海安县" }, { "s": "如东县" }, { "s": "启东市" }, { "s": "如皋市" }, { "s": "通州市" }, { "s": "海门市" }] }, { "n": "连云港", "a": [{ "s": "连云区" }, { "s": "新浦区" }, { "s": "海州区" }, { "s": "赣榆县" }, { "s": "东海县" }, { "s": "灌云县" }, { "s": "灌南县" }] }, { "n": "淮安", "a": [{ "s": "清河区" }, { "s": "楚州区" }, { "s": "淮阴区" }, { "s": "清浦区" }, { "s": "涟水县" }, { "s": "洪泽县" }, { "s": "盱眙县" }, { "s": "金湖县" }] }, { "n": "盐城", "a": [{ "s": "亭湖区" }, { "s": "盐都区" }, { "s": "响水县" }, { "s": "滨海县" }, { "s": "阜宁县" }, { "s": "射阳县" }, { "s": "建湖县" }, { "s": "东台市" }, { "s": "大丰市" }] }, { "n": "扬州", "a": [{ "s": "广陵区" }, { "s": "邗江区" }, { "s": "维扬区" }, { "s": "宝应县" }, { "s": "仪征市" }, { "s": "高邮市" }, { "s": "江都市" }] }, { "n": "镇江", "a": [{ "s": "京口区" }, { "s": "润州区" }, { "s": "丹徒区" }, { "s": "丹阳市" }, { "s": "扬中市" }, { "s": "句容市" }] }, { "n": "泰州", "a": [{ "s": "海陵区" }, { "s": "高港区" }, { "s": "兴化市" }, { "s": "靖江市" }, { "s": "泰兴市" }, { "s": "姜堰市" }] }, { "n": "宿迁", "a": [{ "s": "宿城区" }, { "s": "宿豫区" }, { "s": "沭阳县" }, { "s": "泗阳县" }, { "s": "泗洪县" }] }] }, { "p": "浙江", "c": [{ "n": "杭州", "a": [{ "s": "上城区" }, { "s": "下城区" }, { "s": "江干区" }, { "s": "拱墅区" }, { "s": "西湖区" }, { "s": "滨江区" }, { "s": "萧山区" }, { "s": "余杭区" }, { "s": "桐庐县" }, { "s": "淳安县" }, { "s": "建德市" }, { "s": "富阳市" }, { "s": "临安市" }] }, { "n": "宁波", "a": [{ "s": "海曙区" }, { "s": "江东区" }, { "s": "江北区" }, { "s": "北仑区" }, { "s": "镇海区" }, { "s": "鄞州区" }, { "s": "象山县" }, { "s": "宁海县" }, { "s": "余姚市" }, { "s": "慈溪市" }, { "s": "奉化市" }] }, { "n": "温州", "a": [{ "s": "鹿城区" }, { "s": "龙湾区" }, { "s": "瓯海区" }, { "s": "洞头县" }, { "s": "永嘉县" }, { "s": "平阳县" }, { "s": "苍南县" }, { "s": "文成县" }, { "s": "泰顺县" }, { "s": "瑞安市" }, { "s": "乐清市" }] }, { "n": "嘉兴", "a": [{ "s": "南湖区" }, { "s": "秀洲区" }, { "s": "嘉善县" }, { "s": "海盐县" }, { "s": "海宁市" }, { "s": "平湖市" }, { "s": "桐乡市" }] }, { "n": "湖州", "a": [{ "s": "吴兴区" }, { "s": "南浔区" }, { "s": "德清县" }, { "s": "长兴县" }, { "s": "安吉县" }] }, { "n": "绍兴", "a": [{ "s": "越城区" }, { "s": "绍兴县" }, { "s": "新昌县" }, { "s": "诸暨市" }, { "s": "上虞市" }, { "s": "嵊州市" }] }, { "n": "金华", "a": [{ "s": "婺城区" }, { "s": "金东区" }, { "s": "武义县" }, { "s": "浦江县" }, { "s": "磐安县" }, { "s": "兰溪市" }, { "s": "义乌市" }, { "s": "东阳市" }, { "s": "永康市" }] }, { "n": "衢州", "a": [{ "s": "柯城区" }, { "s": "衢江区" }, { "s": "常山县" }, { "s": "开化县" }, { "s": "龙游县" }, { "s": "江山市" }] }, { "n": "舟山", "a": [{ "s": "定海区" }, { "s": "普陀区" }, { "s": "岱山县" }, { "s": "嵊泗县" }] }, { "n": "台州", "a": [{ "s": "椒江区" }, { "s": "黄岩区" }, { "s": "路桥区" }, { "s": "玉环县" }, { "s": "三门县" }, { "s": "天台县" }, { "s": "仙居县" }, { "s": "温岭市" }, { "s": "临海市" }] }, { "n": "丽水", "a": [{ "s": "莲都区" }, { "s": "青田县" }, { "s": "缙云县" }, { "s": "遂昌县" }, { "s": "松阳县" }, { "s": "云和县" }, { "s": "庆元县" }, { "s": "景宁畲族自治县" }, { "s": "龙泉市" }] }] }, { "p": "安徽", "c": [{ "n": "合肥", "a": [{ "s": "瑶海区" }, { "s": "庐阳区" }, { "s": "蜀山区" }, { "s": "包河区" }, { "s": "长丰县" }, { "s": "肥东县" }, { "s": "肥西县" }] }, { "n": "芜湖", "a": [{ "s": "镜湖区" }, { "s": "弋江区" }, { "s": "鸠江区" }, { "s": "三山区" }, { "s": "芜湖县" }, { "s": "繁昌县" }, { "s": "南陵县" }] }, { "n": "蚌埠", "a": [{ "s": "龙子湖区" }, { "s": "蚌山区" }, { "s": "禹会区" }, { "s": "淮上区" }, { "s": "怀远县" }, { "s": "五河县" }, { "s": "固镇县" }] }, { "n": "淮南", "a": [{ "s": "大通区" }, { "s": "田家庵区" }, { "s": "谢家集区" }, { "s": "八公山区" }, { "s": "潘集区" }, { "s": "凤台县" }] }, { "n": "马鞍山", "a": [{ "s": "金家庄区" }, { "s": "花山区" }, { "s": "雨山区" }, { "s": "当涂县" }] }, { "n": "淮北", "a": [{ "s": "杜集区" }, { "s": "相山区" }, { "s": "烈山区" }, { "s": "濉溪县" }] }, { "n": "铜陵", "a": [{ "s": "铜官山区" }, { "s": "狮子山区" }, { "s": "郊区" }, { "s": "铜陵县" }] }, { "n": "安庆", "a": [{ "s": "迎江区" }, { "s": "大观区" }, { "s": "宜秀区" }, { "s": "怀宁县" }, { "s": "枞阳县" }, { "s": "潜山县" }, { "s": "太湖县" }, { "s": "宿松县" }, { "s": "望江县" }, { "s": "岳西县" }, { "s": "桐城市" }] }, { "n": "黄山", "a": [{ "s": "屯溪区" }, { "s": "黄山区" }, { "s": "徽州区" }, { "s": "歙县" }, { "s": "休宁县" }, { "s": "黟县" }, { "s": "祁门县" }] }, { "n": "滁州", "a": [{ "s": "琅琊区" }, { "s": "南谯区" }, { "s": "来安县" }, { "s": "全椒县" }, { "s": "定远县" }, { "s": "凤阳县" }, { "s": "天长市" }, { "s": "明光市" }] }, { "n": "阜阳", "a": [{ "s": "颍州区" }, { "s": "颍东区" }, { "s": "颍泉区" }, { "s": "临泉县" }, { "s": "太和县" }, { "s": "阜南县" }, { "s": "颍上县" }, { "s": "界首市" }] }, { "n": "宿州", "a": [{ "s": "埇桥区" }, { "s": "砀山县" }, { "s": "萧县" }, { "s": "灵璧县" }, { "s": "泗县" }] }, { "n": "巢湖", "a": [{ "s": "居巢区" }, { "s": "庐江县" }, { "s": "无为县" }, { "s": "含山县" }, { "s": "和县" }] }, { "n": "六安", "a": [{ "s": "金安区" }, { "s": "裕安区" }, { "s": "寿县" }, { "s": "霍邱县" }, { "s": "舒城县" }, { "s": "金寨县" }, { "s": "霍山县" }] }, { "n": "亳州", "a": [{ "s": "谯城区" }, { "s": "涡阳县" }, { "s": "蒙城县" }, { "s": "利辛县" }] }, { "n": "池州", "a": [{ "s": "贵池区" }, { "s": "东至县" }, { "s": "石台县" }, { "s": "青阳县" }] }, { "n": "宣城", "a": [{ "s": "宣州区" }, { "s": "郎溪县" }, { "s": "广德县" }, { "s": "泾县" }, { "s": "绩溪县" }, { "s": "旌德县" }, { "s": "宁国市" }] }] }, { "p": "福建", "c": [{ "n": "福州", "a": [{ "s": "鼓楼区" }, { "s": "台江区" }, { "s": "仓山区" }, { "s": "马尾区" }, { "s": "晋安区" }, { "s": "闽侯县" }, { "s": "连江县" }, { "s": "罗源县" }, { "s": "闽清县" }, { "s": "永泰县" }, { "s": "平潭县" }, { "s": "福清市" }, { "s": "长乐市" }] }, { "n": "厦门", "a": [{ "s": "思明区" }, { "s": "海沧区" }, { "s": "湖里区" }, { "s": "集美区" }, { "s": "同安区" }, { "s": "翔安区" }] }, { "n": "莆田", "a": [{ "s": "城厢区" }, { "s": "涵江区" }, { "s": "荔城区" }, { "s": "秀屿区" }, { "s": "仙游县" }] }, { "n": "三明", "a": [{ "s": "梅列区" }, { "s": "三元区" }, { "s": "明溪县" }, { "s": "清流县" }, { "s": "宁化县" }, { "s": "大田县" }, { "s": "尤溪县" }, { "s": "沙县" }, { "s": "将乐县" }, { "s": "泰宁县" }, { "s": "建宁县" }, { "s": "永安市" }] }, { "n": "泉州", "a": [{ "s": "鲤城区" }, { "s": "丰泽区" }, { "s": "洛江区" }, { "s": "泉港区" }, { "s": "惠安县" }, { "s": "安溪县" }, { "s": "永春县" }, { "s": "德化县" }, { "s": "金门县" }, { "s": "石狮市" }, { "s": "晋江市" }, { "s": "南安市" }] }, { "n": "漳州", "a": [{ "s": "芗城区" }, { "s": "龙文区" }, { "s": "云霄县" }, { "s": "漳浦县" }, { "s": "诏安县" }, { "s": "长泰县" }, { "s": "东山县" }, { "s": "南靖县" }, { "s": "平和县" }, { "s": "华安县" }, { "s": "龙海市" }] }, { "n": "南平", "a": [{ "s": "延平区" }, { "s": "顺昌县" }, { "s": "浦城县" }, { "s": "光泽县" }, { "s": "松溪县" }, { "s": "政和县" }, { "s": "邵武市" }, { "s": "武夷山市" }, { "s": "建瓯市" }, { "s": "建阳市" }] }, { "n": "龙岩", "a": [{ "s": "新罗区" }, { "s": "长汀县" }, { "s": "永定县" }, { "s": "上杭县" }, { "s": "武平县" }, { "s": "连城县" }, { "s": "漳平市" }] }, { "n": "宁德", "a": [{ "s": "蕉城区" }, { "s": "霞浦县" }, { "s": "古田县" }, { "s": "屏南县" }, { "s": "寿宁县" }, { "s": "周宁县" }, { "s": "柘荣县" }, { "s": "福安市" }, { "s": "福鼎市" }] }] }, { "p": "江西", "c": [{ "n": "南昌", "a": [{ "s": "东湖区" }, { "s": "西湖区" }, { "s": "青云谱区" }, { "s": "湾里区" }, { "s": "青山湖区" }, { "s": "南昌县" }, { "s": "新建县" }, { "s": "安义县" }, { "s": "进贤县" }] }, { "n": "景德镇", "a": [{ "s": "昌江区" }, { "s": "珠山区" }, { "s": "浮梁县" }, { "s": "乐平市" }] }, { "n": "萍乡", "a": [{ "s": "安源区" }, { "s": "湘东区" }, { "s": "莲花县" }, { "s": "上栗县" }, { "s": "芦溪县" }] }, { "n": "九江", "a": [{ "s": "庐山区" }, { "s": "浔阳区" }, { "s": "九江县" }, { "s": "武宁县" }, { "s": "修水县" }, { "s": "永修县" }, { "s": "德安县" }, { "s": "星子县" }, { "s": "都昌县" }, { "s": "湖口县" }, { "s": "彭泽县" }, { "s": "瑞昌市" }] }, { "n": "新余", "a": [{ "s": "渝水区" }, { "s": "分宜县" }] }, { "n": "鹰潭", "a": [{ "s": "月湖区" }, { "s": "余江县" }, { "s": "贵溪市" }] }, { "n": "赣州", "a": [{ "s": "章贡区" }, { "s": "赣县" }, { "s": "信丰县" }, { "s": "大余县" }, { "s": "上犹县" }, { "s": "崇义县" }, { "s": "安远县" }, { "s": "龙南县" }, { "s": "定南县" }, { "s": "全南县" }, { "s": "宁都县" }, { "s": "于都县" }, { "s": "兴国县" }, { "s": "会昌县" }, { "s": "寻乌县" }, { "s": "石城县" }, { "s": "瑞金市" }, { "s": "南康市" }] }, { "n": "吉安", "a": [{ "s": "吉州区" }, { "s": "青原区" }, { "s": "吉安县" }, { "s": "吉水县" }, { "s": "峡江县" }, { "s": "新干县" }, { "s": "永丰县" }, { "s": "泰和县" }, { "s": "遂川县" }, { "s": "万安县" }, { "s": "安福县" }, { "s": "永新县" }, { "s": "井冈山市" }] }, { "n": "宜春", "a": [{ "s": "袁州区" }, { "s": "奉新县" }, { "s": "万载县" }, { "s": "上高县" }, { "s": "宜丰县" }, { "s": "靖安县" }, { "s": "铜鼓县" }, { "s": "丰城市" }, { "s": "樟树市" }, { "s": "高安市" }] }, { "n": "抚州", "a": [{ "s": "临川区" }, { "s": "南城县" }, { "s": "黎川县" }, { "s": "南丰县" }, { "s": "崇仁县" }, { "s": "乐安县" }, { "s": "宜黄县" }, { "s": "金溪县" }, { "s": "资溪县" }, { "s": "东乡县" }, { "s": "广昌县" }] }, { "n": "上饶", "a": [{ "s": "信州区" }, { "s": "上饶县" }, { "s": "广丰县" }, { "s": "玉山县" }, { "s": "铅山县" }, { "s": "横峰县" }, { "s": "弋阳县" }, { "s": "余干县" }, { "s": "鄱阳县" }, { "s": "万年县" }, { "s": "婺源县" }, { "s": "德兴市" }] }] }, { "p": "山东", "c": [{ "n": "济南", "a": [{ "s": "历下区" }, { "s": "市中区" }, { "s": "槐荫区" }, { "s": "天桥区" }, { "s": "历城区" }, { "s": "长清区" }, { "s": "平阴县" }, { "s": "济阳县" }, { "s": "商河县" }, { "s": "章丘市" }] }, { "n": "青岛", "a": [{ "s": "市南区" }, { "s": "市北区" }, { "s": "四方区" }, { "s": "黄岛区" }, { "s": "崂山区" }, { "s": "李沧区" }, { "s": "城阳区" }, { "s": "胶州市" }, { "s": "即墨市" }, { "s": "平度市" }, { "s": "胶南市" }, { "s": "莱西市" }] }, { "n": "淄博", "a": [{ "s": "淄川区" }, { "s": "张店区" }, { "s": "博山区" }, { "s": "临淄区" }, { "s": "周村区" }, { "s": "桓台县" }, { "s": "高青县" }, { "s": "沂源县" }] }, { "n": "枣庄", "a": [{ "s": "市中区" }, { "s": "薛城区" }, { "s": "峄城区" }, { "s": "台儿庄区" }, { "s": "山亭区" }, { "s": "滕州市" }] }, { "n": "东营", "a": [{ "s": "东营区" }, { "s": "河口区" }, { "s": "垦利县" }, { "s": "利津县" }, { "s": "广饶县" }] }, { "n": "烟台", "a": [{ "s": "芝罘区" }, { "s": "福山区" }, { "s": "牟平区" }, { "s": "莱山区" }, { "s": "长岛县" }, { "s": "龙口市" }, { "s": "莱阳市" }, { "s": "莱州市" }, { "s": "蓬莱市" }, { "s": "招远市" }, { "s": "栖霞市" }, { "s": "海阳市" }] }, { "n": "潍坊", "a": [{ "s": "潍城区" }, { "s": "寒亭区" }, { "s": "坊子区" }, { "s": "奎文区" }, { "s": "临朐县" }, { "s": "昌乐县" }, { "s": "青州市" }, { "s": "诸城市" }, { "s": "寿光市" }, { "s": "安丘市" }, { "s": "高密市" }, { "s": "昌邑市" }] }, { "n": "济宁", "a": [{ "s": "市中区" }, { "s": "任城区" }, { "s": "微山县" }, { "s": "鱼台县" }, { "s": "金乡县" }, { "s": "嘉祥县" }, { "s": "汶上县" }, { "s": "泗水县" }, { "s": "梁山县" }, { "s": "曲阜市" }, { "s": "兖州市" }, { "s": "邹城市" }] }, { "n": "泰安", "a": [{ "s": "泰山区" }, { "s": "岱岳区" }, { "s": "宁阳县" }, { "s": "东平县" }, { "s": "新泰市" }, { "s": "肥城市" }] }, { "n": "威海", "a": [{ "s": "环翠区" }, { "s": "文登市" }, { "s": "荣成市" }, { "s": "乳山市" }] }, { "n": "日照", "a": [{ "s": "东港区" }, { "s": "岚山区" }, { "s": "五莲县" }, { "s": "莒县" }] }, { "n": "莱芜", "a": [{ "s": "莱城区" }, { "s": "钢城区" }] }, { "n": "临沂", "a": [{ "s": "兰山区" }, { "s": "罗庄区" }, { "s": "河东区" }, { "s": "沂南县" }, { "s": "郯城县" }, { "s": "沂水县" }, { "s": "苍山县" }, { "s": "费县" }, { "s": "平邑县" }, { "s": "莒南县" }, { "s": "蒙阴县" }, { "s": "临沭县" }] }, { "n": "德州", "a": [{ "s": "德城区" }, { "s": "陵县" }, { "s": "宁津县" }, { "s": "庆云县" }, { "s": "临邑县" }, { "s": "齐河县" }, { "s": "平原县" }, { "s": "夏津县" }, { "s": "武城县" }, { "s": "乐陵市" }, { "s": "禹城市" }] }, { "n": "聊城", "a": [{ "s": "东昌府区" }, { "s": "阳谷县" }, { "s": "莘县" }, { "s": "茌平县" }, { "s": "东阿县" }, { "s": "冠县" }, { "s": "高唐县" }, { "s": "临清市" }] }, { "n": "滨州", "a": [{ "s": "滨城区" }, { "s": "惠民县" }, { "s": "阳信县" }, { "s": "无棣县" }, { "s": "沾化县" }, { "s": "博兴县" }, { "s": "邹平县" }] }, { "n": "菏泽", "a": [{ "s": "牡丹区" }, { "s": "曹县" }, { "s": "单县" }, { "s": "成武县" }, { "s": "巨野县" }, { "s": "郓城县" }, { "s": "鄄城县" }, { "s": "定陶县" }, { "s": "东明县" }] }] }, { "p": "河南", "c": [{ "n": "郑州", "a": [{ "s": "中原区" }, { "s": "二七区" }, { "s": "管城回族区" }, { "s": "金水区" }, { "s": "上街区" }, { "s": "惠济区" }, { "s": "中牟县" }, { "s": "巩义市" }, { "s": "荥阳市" }, { "s": "新密市" }, { "s": "新郑市" }, { "s": "登封市" }] }, { "n": "开封", "a": [{ "s": "龙亭区" }, { "s": "顺河回族区" }, { "s": "鼓楼区" }, { "s": "禹王台区" }, { "s": "金明区" }, { "s": "杞县" }, { "s": "通许县" }, { "s": "尉氏县" }, { "s": "开封县" }, { "s": "兰考县" }] }, { "n": "洛阳", "a": [{ "s": "老城区" }, { "s": "西工区" }, { "s": "廛河回族区" }, { "s": "涧西区" }, { "s": "吉利区" }, { "s": "洛龙区" }, { "s": "孟津县" }, { "s": "新安县" }, { "s": "栾川县" }, { "s": "嵩县" }, { "s": "汝阳县" }, { "s": "宜阳县" }, { "s": "洛宁县" }, { "s": "伊川县" }, { "s": "偃师市" }] }, { "n": "平顶山", "a": [{ "s": "新华区" }, { "s": "卫东区" }, { "s": "石龙区" }, { "s": "湛河区" }, { "s": "宝丰县" }, { "s": "叶县" }, { "s": "鲁山县" }, { "s": "郏县" }, { "s": "舞钢市" }, { "s": "汝州市" }] }, { "n": "安阳", "a": [{ "s": "文峰区" }, { "s": "北关区" }, { "s": "殷都区" }, { "s": "龙安区" }, { "s": "安阳县" }, { "s": "汤阴县" }, { "s": "滑县" }, { "s": "内黄县" }, { "s": "林州市" }] }, { "n": "鹤壁", "a": [{ "s": "鹤山区" }, { "s": "山城区" }, { "s": "淇滨区" }, { "s": "浚县" }, { "s": "淇县" }] }, { "n": "新乡", "a": [{ "s": "红旗区" }, { "s": "卫滨区" }, { "s": "凤泉区" }, { "s": "牧野区" }, { "s": "新乡县" }, { "s": "获嘉县" }, { "s": "原阳县" }, { "s": "延津县" }, { "s": "封丘县" }, { "s": "长垣县" }, { "s": "卫辉市" }, { "s": "辉县市" }] }, { "n": "焦作", "a": [{ "s": "解放区" }, { "s": "中站区" }, { "s": "马村区" }, { "s": "山阳区" }, { "s": "修武县" }, { "s": "博爱县" }, { "s": "武陟县" }, { "s": "温县" }, { "s": "沁阳市" }, { "s": "孟州市" }] }, { "n": "濮阳", "a": [{ "s": "华龙区" }, { "s": "清丰县" }, { "s": "南乐县" }, { "s": "范县" }, { "s": "台前县" }, { "s": "濮阳县" }] }, { "n": "许昌", "a": [{ "s": "魏都区" }, { "s": "许昌县" }, { "s": "鄢陵县" }, { "s": "襄城县" }, { "s": "禹州市" }, { "s": "长葛市" }] }, { "n": "漯河", "a": [{ "s": "源汇区" }, { "s": "郾城区" }, { "s": "召陵区" }, { "s": "舞阳县" }, { "s": "临颍县" }] }, { "n": "三门峡", "a": [{ "s": "湖滨区" }, { "s": "渑池县" }, { "s": "陕县" }, { "s": "卢氏县" }, { "s": "义马市" }, { "s": "灵宝市" }] }, { "n": "南阳", "a": [{ "s": "宛城区" }, { "s": "卧龙区" }, { "s": "南召县" }, { "s": "方城县" }, { "s": "西峡县" }, { "s": "镇平县" }, { "s": "内乡县" }, { "s": "淅川县" }, { "s": "社旗县" }, { "s": "唐河县" }, { "s": "新野县" }, { "s": "桐柏县" }, { "s": "邓州市" }] }, { "n": "商丘", "a": [{ "s": "梁园区" }, { "s": "睢阳区" }, { "s": "民权县" }, { "s": "睢县" }, { "s": "宁陵县" }, { "s": "柘城县" }, { "s": "虞城县" }, { "s": "夏邑县" }, { "s": "永城市" }] }, { "n": "信阳", "a": [{ "s": "浉河区" }, { "s": "平桥区" }, { "s": "罗山县" }, { "s": "光山县" }, { "s": "新县" }, { "s": "商城县" }, { "s": "固始县" }, { "s": "潢川县" }, { "s": "淮滨县" }, { "s": "息县" }] }, { "n": "周口", "a": [{ "s": "川汇区" }, { "s": "扶沟县" }, { "s": "西华县" }, { "s": "商水县" }, { "s": "沈丘县" }, { "s": "郸城县" }, { "s": "淮阳县" }, { "s": "太康县" }, { "s": "鹿邑县" }, { "s": "项城市" }] }, { "n": "驻马店", "a": [{ "s": "驿城区" }, { "s": "西平县" }, { "s": "上蔡县" }, { "s": "平舆县" }, { "s": "正阳县" }, { "s": "确山县" }, { "s": "泌阳县" }, { "s": "汝南县" }, { "s": "遂平县" }, { "s": "新蔡县" }] }, { "n": "济源", "a": [{ "s": "济源" }] }] }, { "p": "湖北", "c": [{ "n": "武汉", "a": [{ "s": "江岸区" }, { "s": "江汉区" }, { "s": "硚口区" }, { "s": "汉阳区" }, { "s": "武昌区" }, { "s": "青山区" }, { "s": "洪山区" }, { "s": "东西湖区" }, { "s": "汉南区" }, { "s": "蔡甸区" }, { "s": "江夏区" }, { "s": "黄陂区" }, { "s": "新洲区" }] }, { "n": "黄石", "a": [{ "s": "黄石港区" }, { "s": "西塞山区" }, { "s": "下陆区" }, { "s": "铁山区" }, { "s": "阳新县" }, { "s": "大冶市" }] }, { "n": "十堰", "a": [{ "s": "茅箭区" }, { "s": "张湾区" }, { "s": "郧县" }, { "s": "郧西县" }, { "s": "竹山县" }, { "s": "竹溪县" }, { "s": "房县" }, { "s": "丹江口市" }] }, { "n": "宜昌", "a": [{ "s": "西陵区" }, { "s": "伍家岗区" }, { "s": "点军区" }, { "s": "猇亭区" }, { "s": "夷陵区" }, { "s": "远安县" }, { "s": "兴山县" }, { "s": "秭归县" }, { "s": "长阳土家族自治县" }, { "s": "五峰土家族自治县" }, { "s": "宜都市" }, { "s": "当阳市" }, { "s": "枝江市" }] }, { "n": "襄樊", "a": [{ "s": "襄城区" }, { "s": "樊城区" }, { "s": "襄阳区" }, { "s": "南漳县" }, { "s": "谷城县" }, { "s": "保康县" }, { "s": "老河口市" }, { "s": "枣阳市" }, { "s": "宜城市" }] }, { "n": "鄂州", "a": [{ "s": "梁子湖区" }, { "s": "华容区" }, { "s": "鄂城区" }] }, { "n": "荆门", "a": [{ "s": "东宝区" }, { "s": "掇刀区" }, { "s": "京山县" }, { "s": "沙洋县" }, { "s": "钟祥市" }] }, { "n": "孝感", "a": [{ "s": "孝南区" }, { "s": "孝昌县" }, { "s": "大悟县" }, { "s": "云梦县" }, { "s": "应城市" }, { "s": "安陆市" }, { "s": "汉川市" }] }, { "n": "荆州", "a": [{ "s": "沙市区" }, { "s": "荆州区" }, { "s": "公安县" }, { "s": "监利县" }, { "s": "江陵县" }, { "s": "石首市" }, { "s": "洪湖市" }, { "s": "松滋市" }] }, { "n": "黄冈", "a": [{ "s": "黄州区" }, { "s": "团风县" }, { "s": "红安县" }, { "s": "罗田县" }, { "s": "英山县" }, { "s": "浠水县" }, { "s": "蕲春县" }, { "s": "黄梅县" }, { "s": "麻城市" }, { "s": "武穴市" }] }, { "n": "咸宁", "a": [{ "s": "咸安区" }, { "s": "嘉鱼县" }, { "s": "通城县" }, { "s": "崇阳县" }, { "s": "通山县" }, { "s": "赤壁市" }] }, { "n": "随州", "a": [{ "s": "曾都区" }, { "s": "随县" }, { "s": "广水市" }] }, { "n": "恩施", "a": [{ "s": "恩施市" }, { "s": "利川市" }, { "s": "建始县" }, { "s": "巴东县" }, { "s": "宣恩县" }, { "s": "咸丰县" }, { "s": "来凤县" }, { "s": "鹤峰县" }] }, { "n": "仙桃", "a": [{ "s": "仙桃" }] }, { "n": "潜江", "a": [{ "s": "潜江" }] }, { "n": "天门", "a": [{ "s": "天门" }] }, { "n": "神农架", "a": [{ "s": "神农架" }] }] }, { "p": "湖南", "c": [{ "n": "长沙", "a": [{ "s": "芙蓉区" }, { "s": "天心区" }, { "s": "岳麓区" }, { "s": "开福区" }, { "s": "雨花区" }, { "s": "长沙县" }, { "s": "望城县" }, { "s": "宁乡县" }, { "s": "浏阳市" }] }, { "n": "株洲", "a": [{ "s": "荷塘区" }, { "s": "芦淞区" }, { "s": "石峰区" }, { "s": "天元区" }, { "s": "株洲县" }, { "s": "攸县" }, { "s": "茶陵县" }, { "s": "炎陵县" }, { "s": "醴陵市" }] }, { "n": "湘潭", "a": [{ "s": "雨湖区" }, { "s": "岳塘区" }, { "s": "湘潭县" }, { "s": "湘乡市" }, { "s": "韶山市" }] }, { "n": "衡阳", "a": [{ "s": "珠晖区" }, { "s": "雁峰区" }, { "s": "石鼓区" }, { "s": "蒸湘区" }, { "s": "南岳区" }, { "s": "衡阳县" }, { "s": "衡南县" }, { "s": "衡山县" }, { "s": "衡东县" }, { "s": "祁东县" }, { "s": "耒阳市" }, { "s": "常宁市" }] }, { "n": "邵阳", "a": [{ "s": "双清区" }, { "s": "大祥区" }, { "s": "北塔区" }, { "s": "邵东县" }, { "s": "新邵县" }, { "s": "邵阳县" }, { "s": "隆回县" }, { "s": "洞口县" }, { "s": "绥宁县" }, { "s": "新宁县" }, { "s": "城步苗族自治县" }, { "s": "武冈市" }] }, { "n": "岳阳", "a": [{ "s": "岳阳楼区" }, { "s": "云溪区" }, { "s": "君山区" }, { "s": "岳阳县" }, { "s": "华容县" }, { "s": "湘阴县" }, { "s": "平江县" }, { "s": "汨罗市" }, { "s": "临湘市" }] }, { "n": "常德", "a": [{ "s": "武陵区" }, { "s": "鼎城区" }, { "s": "安乡县" }, { "s": "汉寿县" }, { "s": "澧县" }, { "s": "临澧县" }, { "s": "桃源县" }, { "s": "石门县" }, { "s": "津市市" }] }, { "n": "张家界", "a": [{ "s": "永定区" }, { "s": "武陵源区" }, { "s": "慈利县" }, { "s": "桑植县" }] }, { "n": "益阳", "a": [{ "s": "资阳区" }, { "s": "赫山区" }, { "s": "南县" }, { "s": "桃江县" }, { "s": "安化县" }, { "s": "沅江市" }] }, { "n": "郴州", "a": [{ "s": "北湖区" }, { "s": "苏仙区" }, { "s": "桂阳县" }, { "s": "宜章县" }, { "s": "永兴县" }, { "s": "嘉禾县" }, { "s": "临武县" }, { "s": "汝城县" }, { "s": "桂东县" }, { "s": "安仁县" }, { "s": "资兴市" }] }, { "n": "永州", "a": [{ "s": "零陵区" }, { "s": "冷水滩区" }, { "s": "祁阳县" }, { "s": "东安县" }, { "s": "双牌县" }, { "s": "道县" }, { "s": "江永县" }, { "s": "宁远县" }, { "s": "蓝山县" }, { "s": "新田县" }, { "s": "江华瑶族自治县" }] }, { "n": "怀化", "a": [{ "s": "鹤城区" }, { "s": "中方县" }, { "s": "沅陵县" }, { "s": "辰溪县" }, { "s": "溆浦县" }, { "s": "会同县" }, { "s": "麻阳苗族自治县" }, { "s": "新晃侗族自治县" }, { "s": "芷江侗族自治县" }, { "s": "靖州苗族侗族自治县" }, { "s": "通道侗族自治县" }, { "s": "洪江市" }] }, { "n": "娄底", "a": [{ "s": "娄星区" }, { "s": "双峰县" }, { "s": "新化县" }, { "s": "冷水江市" }, { "s": "涟源市" }] }, { "n": "湘西", "a": [{ "s": "吉首市" }, { "s": "泸溪县" }, { "s": "凤凰县" }, { "s": "花垣县" }, { "s": "保靖县" }, { "s": "古丈县" }, { "s": "永顺县" }, { "s": "龙山县" }] }] }, { "p": "广东", "c": [{ "n": "广州", "a": [{ "s": "荔湾区" }, { "s": "越秀区" }, { "s": "海珠区" }, { "s": "天河区" }, { "s": "白云区" }, { "s": "黄埔区" }, { "s": "番禺区" }, { "s": "花都区" }, { "s": "南沙区" }, { "s": "萝岗区" }, { "s": "增城市" }, { "s": "从化市" }] }, { "n": "韶关", "a": [{ "s": "武江区" }, { "s": "浈江区" }, { "s": "曲江区" }, { "s": "始兴县" }, { "s": "仁化县" }, { "s": "翁源县" }, { "s": "乳源瑶族自治县" }, { "s": "新丰县" }, { "s": "乐昌市" }, { "s": "南雄市" }] }, { "n": "深圳", "a": [{ "s": "罗湖区" }, { "s": "福田区" }, { "s": "南山区" }, { "s": "宝安区" }, { "s": "龙岗区" }, { "s": "盐田区" }] }, { "n": "珠海", "a": [{ "s": "香洲区" }, { "s": "斗门区" }, { "s": "金湾区" }] }, { "n": "汕头", "a": [{ "s": "龙湖区" }, { "s": "金平区" }, { "s": "濠江区" }, { "s": "潮阳区" }, { "s": "潮南区" }, { "s": "澄海区" }, { "s": "南澳县" }] }, { "n": "佛山", "a": [{ "s": "禅城区" }, { "s": "南海区" }, { "s": "顺德区" }, { "s": "三水区" }, { "s": "高明区" }] }, { "n": "江门", "a": [{ "s": "蓬江区" }, { "s": "江海区" }, { "s": "新会区" }, { "s": "台山市" }, { "s": "开平市" }, { "s": "鹤山市" }, { "s": "恩平市" }] }, { "n": "湛江", "a": [{ "s": "赤坎区" }, { "s": "霞山区" }, { "s": "坡头区" }, { "s": "麻章区" }, { "s": "遂溪县" }, { "s": "徐闻县" }, { "s": "廉江市" }, { "s": "雷州市" }, { "s": "吴川市" }] }, { "n": "茂名", "a": [{ "s": "茂南区" }, { "s": "茂港区" }, { "s": "电白县" }, { "s": "高州市" }, { "s": "化州市" }, { "s": "信宜市" }] }, { "n": "肇庆", "a": [{ "s": "端州区" }, { "s": "鼎湖区" }, { "s": "广宁县" }, { "s": "怀集县" }, { "s": "封开县" }, { "s": "德庆县" }, { "s": "高要市" }, { "s": "四会市" }] }, { "n": "惠州", "a": [{ "s": "惠城区" }, { "s": "惠阳区" }, { "s": "博罗县" }, { "s": "惠东县" }, { "s": "龙门县" }] }, { "n": "梅州", "a": [{ "s": "梅江区" }, { "s": "梅县" }, { "s": "大埔县" }, { "s": "丰顺县" }, { "s": "五华县" }, { "s": "平远县" }, { "s": "蕉岭县" }, { "s": "兴宁市" }] }, { "n": "汕尾", "a": [{ "s": "城区" }, { "s": "海丰县" }, { "s": "陆河县" }, { "s": "陆丰市" }] }, { "n": "河源", "a": [{ "s": "源城区" }, { "s": "紫金县" }, { "s": "龙川县" }, { "s": "连平县" }, { "s": "和平县" }, { "s": "东源县" }] }, { "n": "阳江", "a": [{ "s": "江城区" }, { "s": "阳西县" }, { "s": "阳东县" }, { "s": "阳春市" }] }, { "n": "清远", "a": [{ "s": "清城区" }, { "s": "佛冈县" }, { "s": "阳山县" }, { "s": "连山壮族瑶族自治县" }, { "s": "连南瑶族自治县" }, { "s": "清新县" }, { "s": "英德市" }, { "s": "连州市" }] }, { "n": "东莞", "a": [{ "s": "东莞市" }] }, { "n": "中山", "a": [{ "s": "中山市" }] }, { "n": "潮州", "a": [{ "s": "湘桥区" }, { "s": "潮安县" }, { "s": "饶平县" }] }, { "n": "揭阳", "a": [{ "s": "榕城区" }, { "s": "揭东县" }, { "s": "揭西县" }, { "s": "惠来县" }, { "s": "普宁市" }] }, { "n": "云浮", "a": [{ "s": "云城区" }, { "s": "新兴县" }, { "s": "郁南县" }, { "s": "云安县" }, { "s": "罗定市" }] }] }, { "p": "广西", "c": [{ "n": "南宁", "a": [{ "s": "兴宁区" }, { "s": "青秀区" }, { "s": "江南区" }, { "s": "西乡塘区" }, { "s": "良庆区" }, { "s": "邕宁区" }, { "s": "武鸣县" }, { "s": "隆安县" }, { "s": "马山县" }, { "s": "上林县" }, { "s": "宾阳县" }, { "s": "横县" }] }, { "n": "柳州", "a": [{ "s": "城中区" }, { "s": "鱼峰区" }, { "s": "柳南区" }, { "s": "柳北区" }, { "s": "柳江县" }, { "s": "柳城县" }, { "s": "鹿寨县" }, { "s": "融安县" }, { "s": "融水苗族自治县" }, { "s": "三江侗族自治县" }] }, { "n": "桂林", "a": [{ "s": "秀峰区" }, { "s": "叠彩区" }, { "s": "象山区" }, { "s": "七星区" }, { "s": "雁山区" }, { "s": "阳朔县" }, { "s": "临桂县" }, { "s": "灵川县" }, { "s": "全州县" }, { "s": "兴安县" }, { "s": "永福县" }, { "s": "灌阳县" }, { "s": "龙胜各族自治县" }, { "s": "资源县" }, { "s": "平乐县" }, { "s": "荔蒲县" }, { "s": "恭城瑶族自治县" }] }, { "n": "梧州", "a": [{ "s": "万秀区" }, { "s": "蝶山区" }, { "s": "长洲区" }, { "s": "苍梧县" }, { "s": "藤县" }, { "s": "蒙山县" }, { "s": "岑溪市" }] }, { "n": "北海", "a": [{ "s": "海城区" }, { "s": "银海区" }, { "s": "铁山港区" }, { "s": "合浦县" }] }, { "n": "防城港", "a": [{ "s": "港口区" }, { "s": "防城区" }, { "s": "上思县" }, { "s": "东兴市" }] }, { "n": "钦州", "a": [{ "s": "钦南区" }, { "s": "钦北区" }, { "s": "灵山县" }, { "s": "浦北县" }] }, { "n": "贵港", "a": [{ "s": "港北区" }, { "s": "港南区" }, { "s": "覃塘区" }, { "s": "平南县" }, { "s": "桂平市" }] }, { "n": "玉林", "a": [{ "s": "玉州区" }, { "s": "容县" }, { "s": "陆川县" }, { "s": "博白县" }, { "s": "兴业县" }, { "s": "北流市" }] }, { "n": "百色", "a": [{ "s": "右江区" }, { "s": "田阳县" }, { "s": "田东县" }, { "s": "平果县" }, { "s": "德保县" }, { "s": "靖西县" }, { "s": "那坡县" }, { "s": "凌云县" }, { "s": "乐业县" }, { "s": "田林县" }, { "s": "西林县" }, { "s": "隆林各族自治县" }] }, { "n": "贺州", "a": [{ "s": "八步区" }, { "s": "昭平县" }, { "s": "钟山县" }, { "s": "富川瑶族自治县" }] }, { "n": "河池", "a": [{ "s": "金城江区" }, { "s": "南丹县" }, { "s": "天峨县" }, { "s": "凤山县" }, { "s": "东兰县" }, { "s": "罗城仫佬族自治县" }, { "s": "环江毛南族自治县" }, { "s": "巴马瑶族自治县" }, { "s": "都安瑶族自治县" }, { "s": "大化瑶族自治县" }, { "s": "宜州市" }] }, { "n": "来宾", "a": [{ "s": "兴宾区" }, { "s": "忻城县" }, { "s": "象州县" }, { "s": "武宣县" }, { "s": "金秀瑶族自治县" }, { "s": "合山市" }] }, { "n": "崇左", "a": [{ "s": "江洲区" }, { "s": "扶绥县" }, { "s": "宁明县" }, { "s": "龙州县" }, { "s": "大新县" }, { "s": "天等县" }, { "s": "凭祥市" }] }] }, { "p": "海南", "c": [{ "n": "海口", "a": [{ "s": "秀英区" }, { "s": "龙华区" }, { "s": "琼山区" }, { "s": "美兰区" }] }, { "n": "三亚", "a": [{ "s": "三亚市" }] }, { "n": "五指山", "a": [{ "s": "五指山" }] }, { "n": "琼海", "a": [{ "s": "琼海" }] }, { "n": "儋州", "a": [{ "s": "儋州" }] }, { "n": "文昌", "a": [{ "s": "文昌" }] }, { "n": "万宁", "a": [{ "s": "万宁" }] }, { "n": "东方", "a": [{ "s": "东方" }] }] }, { "p": "重庆", "c": [{ "n": "万州区" }, { "n": "涪陵区" }, { "n": "渝中区" }, { "n": "大渡口区" }, { "n": "江北区" }, { "n": "沙坪坝区" }, { "n": "九龙坡区" }, { "n": "南岸区" }, { "n": "北碚区" }, { "n": "万盛区" }, { "n": "双挢区" }, { "n": "渝北区" }, { "n": "巴南区" }, { "n": "长寿区" }, { "n": "綦江县" }, { "n": "潼南县" }, { "n": "铜梁县" }, { "n": "大足县" }, { "n": "荣昌县" }, { "n": "壁山县" }, { "n": "梁平县" }, { "n": "城口县" }, { "n": "丰都县" }, { "n": "垫江县" }, { "n": "武隆县" }, { "n": "忠县" }, { "n": "开县" }, { "n": "云阳县" }, { "n": "奉节县" }, { "n": "巫山县" }, { "n": "巫溪县" }, { "n": "黔江区" }, { "n": "石柱土家族自治县" }, { "n": "秀山土家族苗族自治县" }, { "n": "酉阳土家族苗族自治县" }, { "n": "彭水苗族土家族自治县" }, { "n": "江津区" }, { "n": "合川区" }, { "n": "永川区" }, { "n": "南川区" }] }, { "p": "四川", "c": [{ "n": "成都", "a": [{ "s": "锦江区" }, { "s": "青羊区" }, { "s": "金牛区" }, { "s": "武侯区" }, { "s": "成华区" }, { "s": "龙泉驿区" }, { "s": "青白江区" }, { "s": "新都区" }, { "s": "温江区" }, { "s": "金堂县" }, { "s": "双流县" }, { "s": "郫县" }, { "s": "大邑县" }, { "s": "蒲江县" }, { "s": "新津县" }, { "s": "都江堰市" }, { "s": "彭州市" }, { "s": "邛崃市" }, { "s": "崇州市" }] }, { "n": "自贡", "a": [{ "s": "自流井区" }, { "s": "贡井区" }, { "s": "大安区" }, { "s": "沿滩区" }, { "s": "荣县" }, { "s": "富顺县" }] }, { "n": "攀枝花", "a": [{ "s": "东区" }, { "s": "西区" }, { "s": "仁和区" }, { "s": "米易县" }, { "s": "盐边县" }] }, { "n": "泸州", "a": [{ "s": "江阳区" }, { "s": "纳溪区" }, { "s": "龙马潭区" }, { "s": "泸县" }, { "s": "合江县" }, { "s": "叙永县" }, { "s": "古蔺县" }] }, { "n": "德阳", "a": [{ "s": "旌阳区" }, { "s": "中江县" }, { "s": "罗江县" }, { "s": "广汉市" }, { "s": "什邡市" }, { "s": "绵竹市" }] }, { "n": "绵阳", "a": [{ "s": "涪城区" }, { "s": "游仙区" }, { "s": "三台县" }, { "s": "盐亭县" }, { "s": "安县" }, { "s": "梓潼县" }, { "s": "北川羌族自治县" }, { "s": "平武县" }, { "s": "江油市" }] }, { "n": "广元", "a": [{ "s": "利州区" }, { "s": "元坝区" }, { "s": "朝天区" }, { "s": "旺苍县" }, { "s": "青川县" }, { "s": "剑阁县" }, { "s": "苍溪县" }] }, { "n": "遂宁", "a": [{ "s": "船山区" }, { "s": ">安居区" }, { "s": ">蓬溪县" }, { "s": ">射洪县" }, { "s": ">大英县" }] }, { "n": "内江", "a": [{ "s": "市中区" }, { "s": "东兴区" }, { "s": "威远县" }, { "s": "资中县" }, { "s": "隆昌县" }] }, { "n": "乐山", "a": [{ "s": "市中区" }, { "s": "沙湾区" }, { "s": "五通桥区" }, { "s": "金口河区" }, { "s": "犍为县" }, { "s": "井研县" }, { "s": "夹江县" }, { "s": "沐川县" }, { "s": "峨边彝族自治县" }, { "s": "马边彝族自治县" }, { "s": "峨眉山市" }] }, { "n": "南充", "a": [{ "s": "顺庆区" }, { "s": "高坪区" }, { "s": "嘉陵区" }, { "s": "南部县" }, { "s": "营山县" }, { "s": "蓬安县" }, { "s": "仪陇县" }, { "s": "西充县" }, { "s": "阆中市" }] }, { "n": "眉山", "a": [{ "s": "东坡区" }, { "s": "仁寿县" }, { "s": "彭山县" }, { "s": "洪雅县" }, { "s": "丹棱县" }, { "s": "青神县" }] }, { "n": "宜宾", "a": [{ "s": "翠屏区" }, { "s": "宜宾县" }, { "s": "南溪县" }, { "s": "江安县" }, { "s": "长宁县" }, { "s": "高县" }, { "s": "珙县" }, { "s": "筠连县" }, { "s": "兴文县" }, { "s": "屏山县" }] }, { "n": "广安", "a": [{ "s": "广安区" }, { "s": "岳池县" }, { "s": "武胜县" }, { "s": "邻水县" }, { "s": "华蓥市" }] }, { "n": "达川", "a": [{ "s": "通川区" }, { "s": "达县" }, { "s": "宣汉县" }, { "s": "开江县" }, { "s": "大竹县" }, { "s": "渠县" }, { "s": "万源市" }] }, { "n": "雅安", "a": [{ "s": "雨城区" }, { "s": "名山县" }, { "s": "荥经县" }, { "s": "汉源县" }, { "s": "石棉县" }, { "s": "天全县" }, { "s": "芦山县" }, { "s": "宝兴县" }] }, { "n": "巴中", "a": [{ "s": "巴州区" }, { "s": "通江县" }, { "s": "南江县" }, { "s": "平昌县" }] }, { "n": "资阳", "a": [{ "s": "雁江区" }, { "s": "安岳县" }, { "s": "乐至县" }, { "s": "简阳市" }] }, { "n": "阿坝", "a": [{ "s": "汶川县" }, { "s": "理县" }, { "s": "茂县" }, { "s": "松潘县" }, { "s": "九寨沟县" }, { "s": "金川县" }, { "s": "小金县" }, { "s": "黑水县" }, { "s": "马尔康县" }, { "s": "壤塘县" }, { "s": "阿坝县" }, { "s": "若尔盖县" }, { "s": "红原县" }] }, { "n": "甘孜", "a": [{ "s": "康定县" }, { "s": "泸定县" }, { "s": "丹巴县" }, { "s": "九龙县" }, { "s": "雅江县" }, { "s": "道孚县" }, { "s": "炉霍县" }, { "s": "甘孜县" }, { "s": "新龙县" }, { "s": "德格县" }, { "s": "白玉县" }, { "s": "石渠县" }, { "s": "色达县" }, { "s": "理塘县" }, { "s": "巴塘县" }, { "s": "乡城县" }, { "s": "稻城县" }, { "s": "得荣县" }] }, { "n": "凉山", "a": [{ "s": "西昌市" }, { "s": "木里藏族自治县" }, { "s": "盐源县" }, { "s": "德昌县" }, { "s": "会理县" }, { "s": "会东县" }, { "s": "宁南县" }, { "s": "普格县" }, { "s": "布拖县" }, { "s": "金阳县" }, { "s": "昭觉县" }, { "s": "喜德县" }, { "s": "冕宁县" }, { "s": "越西县" }, { "s": "甘洛县" }, { "s": "美姑县" }, { "s": "雷波县" }] }] }, { "p": "贵州", "c": [{ "n": "贵阳", "a": [{ "s": "南明区" }, { "s": "云岩区" }, { "s": "花溪区" }, { "s": "乌当区" }, { "s": "白云区" }, { "s": "小河区" }, { "s": "开阳县" }, { "s": "息烽县" }, { "s": "修文县" }, { "s": "清镇市" }] }, { "n": "六盘水", "a": [{ "s": "钟山区" }, { "s": "六枝特区" }, { "s": "水城县" }, { "s": "盘县" }] }, { "n": "遵义", "a": [{ "s": "红花岗区" }, { "s": "汇川区" }, { "s": "遵义县" }, { "s": "桐梓县" }, { "s": "绥阳县" }, { "s": "正安县" }, { "s": "道真仡佬族苗族自治县" }, { "s": "务川仡佬族苗族自治县" }, { "s": "凤冈县" }, { "s": "湄潭县" }, { "s": "余庆县" }, { "s": "习水县" }, { "s": "赤水市" }, { "s": "仁怀市" }] }, { "n": "安顺", "a": [{ "s": "西秀区" }, { "s": "平坝县" }, { "s": "普定县" }, { "s": "镇宁布依族苗族自治县" }, { "s": "关岭布依族苗族自治县" }, { "s": "紫云苗族布依族自治县" }] }, { "n": "铜仁", "a": [{ "s": "铜仁市" }, { "s": "江口县" }, { "s": "玉屏侗族自治县" }, { "s": "石阡县" }, { "s": "思南县" }, { "s": "印江土家族苗族自治县" }, { "s": "德江县" }, { "s": "沿河土家族自治县" }, { "s": "松桃苗族自治县" }, { "s": "万山特区" }] }, { "n": "黔西南", "a": [{ "s": "兴义市" }, { "s": "兴仁县" }, { "s": "普安县" }, { "s": "晴隆县" }, { "s": "贞丰县" }, { "s": "望谟县" }, { "s": "册亨县" }, { "s": "安龙县" }] }, { "n": "毕节", "a": [{ "s": "毕节市" }, { "s": "大方县" }, { "s": "黔西县" }, { "s": "金沙县" }, { "s": "织金县" }, { "s": "纳雍县" }, { "s": "威宁彝族回族苗族自治县" }, { "s": "赫章县" }] }, { "n": "黔东南", "a": [{ "s": "凯里市" }, { "s": "黄平县" }, { "s": "施秉县" }, { "s": "三穗县" }, { "s": "镇远县" }, { "s": "岑巩县" }, { "s": "天柱县" }, { "s": "锦屏县" }, { "s": "剑河县" }, { "s": "台江县" }, { "s": "黎平县" }, { "s": "榕江县" }, { "s": "从江县" }, { "s": "雷山县" }, { "s": "麻江县" }, { "s": "丹寨县" }] }, { "n": "黔南", "a": [{ "s": "都匀市" }, { "s": "福泉市" }, { "s": "荔波县" }, { "s": "贵定县" }, { "s": "瓮安县" }, { "s": "独山县" }, { "s": "平塘县" }, { "s": "罗甸县" }, { "s": "长顺县" }, { "s": "龙里县" }, { "s": "惠水县" }, { "s": "三都水族自治县" }] }] }, { "p": "云南", "c": [{ "n": "昆明", "a": [{ "s": "五华区" }, { "s": "盘龙区" }, { "s": "官渡区" }, { "s": "西山区" }, { "s": "东川区" }, { "s": "呈贡县" }, { "s": "晋宁县" }, { "s": "富民县" }, { "s": "宜良县" }, { "s": "石林彝族自治县" }, { "s": "嵩明县" }, { "s": "禄劝彝族苗族自治县" }, { "s": "寻甸回族彝族自治县" }, { "s": "安宁市" }] }, { "n": "曲靖", "a": [{ "s": "麒麟区" }, { "s": "马龙县" }, { "s": "陆良县" }, { "s": "师宗县" }, { "s": "罗平县" }, { "s": "富源县" }, { "s": "会泽县" }, { "s": "沾益县" }, { "s": "宣威市" }] }, { "n": "玉溪", "a": [{ "s": "红塔区" }, { "s": "江川县" }, { "s": "澄江县" }, { "s": "通海县" }, { "s": "华宁县" }, { "s": "易门县" }, { "s": "峨山彝族自治县" }, { "s": "新平彝族傣族自治县" }, { "s": "元江哈尼族彝族傣族自治县" }] }, { "n": "保山", "a": [{ "s": "隆阳区" }, { "s": "施甸县" }, { "s": "腾冲县" }, { "s": "龙陵县" }, { "s": "昌宁县" }] }, { "n": "昭通", "a": [{ "s": "昭阳区" }, { "s": "鲁甸县" }, { "s": "巧家县" }, { "s": "盐津县" }, { "s": "大关县" }, { "s": "永善县" }, { "s": "绥江县" }, { "s": "镇雄县" }, { "s": "彝良县" }, { "s": "威信县" }, { "s": "水富县" }] }, { "n": "丽江", "a": [{ "s": "古城区" }, { "s": "玉龙纳西族自治县" }, { "s": "永胜县" }, { "s": "华坪县" }, { "s": "宁蒗彝族自治县" }] }, { "n": "普洱", "a": [{ "s": "思茅区" }, { "s": "宁洱镇" }, { "s": "墨江哈尼族自治县" }, { "s": "景东彝族自治县" }, { "s": "景谷傣族彝族自治县" }, { "s": "镇沅彝族哈尼族拉祜族自治县" }, { "s": "江城哈尼族彝族自治县" }, { "s": "孟连傣族拉祜族佤族自治县" }, { "s": "澜沧拉祜族自治县" }, { "s": "西盟佤族自治县" }] }, { "n": "临沧", "a": [{ "s": "临翔区" }, { "s": "凤庆县" }, { "s": "云县" }, { "s": "永德县" }, { "s": "镇康县" }, { "s": "双江拉祜族佤族布朗族傣族自治县" }, { "s": "耿马傣族佤族自治县" }, { "s": "沧源佤族自治县" }] }, { "n": "楚雄", "a": [{ "s": "楚雄市" }, { "s": "双柏县" }, { "s": "牟定县" }, { "s": "南华县" }, { "s": "姚安县" }, { "s": "大姚县" }, { "s": "永仁县" }, { "s": "元谋县" }, { "s": "武定县" }, { "s": "禄丰县" }] }, { "n": "红河", "a": [{ "s": "个旧市" }, { "s": "开远市" }, { "s": "蒙自县" }, { "s": "屏边苗族自治县" }, { "s": "建水县" }, { "s": "石屏县" }, { "s": "弥勒县" }, { "s": "泸西县" }, { "s": "元阳县" }, { "s": "红河县" }, { "s": "金平苗族瑶族傣族自治县" }, { "s": "绿春县" }, { "s": "河口瑶族自治县" }] }, { "n": "文山", "a": [{ "s": "文山县" }, { "s": "砚山县" }, { "s": "西畴县" }, { "s": "麻栗坡县" }, { "s": "马关县" }, { "s": "丘北县" }, { "s": "广南县" }, { "s": "富宁县" }] }, { "n": "西双版纳", "a": [{ "s": "景洪市" }, { "s": "勐海县" }, { "s": "勐腊县" }] }, { "n": "大理", "a": [{ "s": "大理市" }, { "s": "漾濞彝族自治县" }, { "s": "祥云县" }, { "s": "宾川县" }, { "s": "弥渡县" }, { "s": "南涧彝族自治县" }, { "s": "巍山彝族回族自治县" }, { "s": "永平县" }, { "s": "云龙县" }, { "s": "洱源县" }, { "s": "剑川县" }, { "s": "鹤庆县" }] }, { "n": "德宏", "a": [{ "s": "瑞丽市" }, { "s": "潞西市" }, { "s": "梁河县" }, { "s": "盈江县" }, { "s": "陇川县" }] }, { "n": "怒江傈", "a": [{ "s": "泸水县" }, { "s": "福贡县" }, { "s": "贡山独龙族怒族自治县" }, { "s": "兰坪白族普米族自治县" }] }, { "n": "迪庆", "a": [{ "s": "香格里拉县" }, { "s": "德钦县" }, { "s": "维西傈僳族自治县" }] }] }, { "p": "西藏", "c": [{ "n": "拉萨", "a": [{ "s": "城关区" }, { "s": "林周县" }, { "s": "当雄县" }, { "s": "尼木县" }, { "s": "曲水县" }, { "s": "堆龙德庆县" }, { "s": "达孜县" }, { "s": "墨竹工卡县" }] }, { "n": "昌都", "a": [{ "s": "昌都县" }, { "s": "江达县" }, { "s": "贡觉县" }, { "s": "类乌齐县" }, { "s": "丁青县" }, { "s": "察雅县" }, { "s": "八宿县" }, { "s": "左贡县" }, { "s": "芒康县" }, { "s": "洛隆县" }, { "s": "边坝县" }] }, { "n": "山南", "a": [{ "s": "乃东县" }, { "s": "扎囊县" }, { "s": "贡嘎县" }, { "s": "桑日县" }, { "s": "琼结县" }, { "s": "曲松县" }, { "s": "措美县" }, { "s": "洛扎县" }, { "s": "加查县" }, { "s": "隆子县" }, { "s": "错那县" }, { "s": "浪卡子县" }] }, { "n": "日喀则", "a": [{ "s": "日喀则市" }, { "s": "南木林县" }, { "s": "江孜县" }, { "s": "定日县" }, { "s": "萨迦县" }, { "s": "拉孜县" }, { "s": "昂仁县" }, { "s": "谢通门县" }, { "s": "白朗县" }, { "s": "仁布县" }, { "s": "康马县" }, { "s": "定结县" }, { "s": "仲巴县" }, { "s": "亚东县" }, { "s": "吉隆县" }, { "s": "聂拉木县" }, { "s": "萨嘎县" }, { "s": "岗巴县" }] }, { "n": "那曲", "a": [{ "s": "那曲县" }, { "s": "嘉黎县" }, { "s": "比如县" }, { "s": "聂荣县" }, { "s": "安多县" }, { "s": "申扎县" }, { "s": "索县" }, { "s": "班戈县" }, { "s": "巴青县" }, { "s": "尼玛县" }] }, { "n": "阿里", "a": [{ "s": "普兰县" }, { "s": "札达县" }, { "s": "噶尔县" }, { "s": "日土县" }, { "s": "革吉县" }, { "s": "改则县" }, { "s": "措勤县" }] }, { "n": "林芝", "a": [{ "s": "林芝县" }, { "s": "工布江达县" }, { "s": "米林县" }, { "s": "墨脱县" }, { "s": "波密县" }, { "s": "察隅县" }, { "s": "朗县" }] }] }, { "p": "陕西", "c": [{ "n": "西安", "a": [{ "s": "新城区" }, { "s": "碑林区" }, { "s": "莲湖区" }, { "s": "灞桥区" }, { "s": "未央区" }, { "s": "雁塔区" }, { "s": "阎良区" }, { "s": "临潼区" }, { "s": "长安区" }, { "s": "蓝田县" }, { "s": "周至县" }, { "s": "户县" }, { "s": "高陵县" }] }, { "n": "铜川", "a": [{ "s": "王益区" }, { "s": "印台区" }, { "s": "耀州区" }, { "s": "宜君县" }] }, { "n": "宝鸡", "a": [{ "s": "渭滨区" }, { "s": "金台区" }, { "s": "陈仓区" }, { "s": "凤翔县" }, { "s": "岐山县" }, { "s": "扶风县" }, { "s": "眉县" }, { "s": "陇县" }, { "s": "千阳县" }, { "s": "麟游县" }, { "s": "凤县" }, { "s": "太白县" }] }, { "n": "咸阳", "a": [{ "s": "秦都区" }, { "s": "杨凌区" }, { "s": "渭城区" }, { "s": "三原县" }, { "s": "泾阳县" }, { "s": "乾县" }, { "s": "礼泉县" }, { "s": "永寿县" }, { "s": "彬县" }, { "s": "长武县" }, { "s": "旬邑县" }, { "s": "淳化县" }, { "s": "武功县" }, { "s": "兴平市" }] }, { "n": "渭南", "a": [{ "s": "临渭区" }, { "s": "华县" }, { "s": "潼关县" }, { "s": "大荔县" }, { "s": "合阳县" }, { "s": "澄城县" }, { "s": "蒲城县" }, { "s": "白水县" }, { "s": "富平县" }, { "s": "韩城市" }, { "s": "华阴市" }] }, { "n": "延安", "a": [{ "s": "宝塔区" }, { "s": "延长县" }, { "s": "延川县" }, { "s": "子长县" }, { "s": "安塞县" }, { "s": "志丹县" }, { "s": "吴起县" }, { "s": "甘泉县" }, { "s": "富县" }, { "s": "洛川县" }, { "s": "宜川县" }, { "s": "黄龙县" }, { "s": "黄陵县" }] }, { "n": "汉中", "a": [{ "s": "汉台区" }, { "s": "南郑县" }, { "s": "城固县" }, { "s": "洋县" }, { "s": "西乡县" }, { "s": "勉县" }, { "s": "宁强县" }, { "s": "略阳县" }, { "s": "镇巴县" }, { "s": "留坝县" }, { "s": "佛坪县" }] }, { "n": "榆林", "a": [{ "s": "榆阳区" }, { "s": "神木县" }, { "s": "府谷县" }, { "s": "横山县" }, { "s": "靖边县" }, { "s": "定边县" }, { "s": "绥德县" }, { "s": "米脂县" }, { "s": "佳县" }, { "s": "吴堡县" }, { "s": "清涧县" }, { "s": "子洲县" }] }, { "n": "安康", "a": [{ "s": "汉滨区" }, { "s": "汉阴县" }, { "s": "石泉县" }, { "s": "宁陕县" }, { "s": "紫阳县" }, { "s": "岚皋县" }, { "s": "平利县" }, { "s": "镇坪县" }, { "s": "旬阳县" }, { "s": "白河县" }] }, { "n": "商洛", "a": [{ "s": "商州区" }, { "s": "洛南县" }, { "s": "丹凤县" }, { "s": "商南县" }, { "s": "山阳县" }, { "s": "镇安县" }, { "s": "柞水县" }] }] }, { "p": "甘肃", "c": [{ "n": "兰州", "a": [{ "s": "区(县)" }, { "s": "城关区" }, { "s": "七里河区" }, { "s": "西固区" }, { "s": "安宁区" }, { "s": "红古区" }, { "s": "永登县" }, { "s": "皋兰县" }, { "s": "榆中县" }] }, { "n": "嘉峪关", "a": [{ "s": "嘉峪关市" }] }, { "n": "金昌", "a": [{ "s": "金川区" }, { "s": "永昌县" }] }, { "n": "白银", "a": [{ "s": "白银区" }, { "s": "平川区" }, { "s": "靖远县" }, { "s": "会宁县" }, { "s": "景泰县" }] }, { "n": "天水", "a": [{ "s": "秦城区" }, { "s": "麦积区" }, { "s": "清水县" }, { "s": "秦安县" }, { "s": "甘谷县" }, { "s": "武山县" }, { "s": "张家川回族自治县" }] }, { "n": "武威", "a": [{ "s": "凉州区" }, { "s": "民勤县" }, { "s": "古浪县" }, { "s": "天祝藏族自治县" }] }, { "n": "张掖", "a": [{ "s": "甘州区" }, { "s": "肃南裕固族自治县" }, { "s": "民乐县" }, { "s": "临泽县" }, { "s": "高台县" }, { "s": "山丹县" }] }, { "n": "平凉", "a": [{ "s": "崆峒区" }, { "s": "泾川县" }, { "s": "灵台县" }, { "s": "崇信县" }, { "s": "华亭县" }, { "s": "庄浪县" }, { "s": "静宁县" }] }, { "n": "酒泉", "a": [{ "s": "肃州区" }, { "s": "金塔县" }, { "s": "瓜州县" }, { "s": "肃北蒙古族自治县" }, { "s": "阿克塞哈萨克族自治县" }, { "s": "玉门市" }, { "s": "敦煌市" }] }, { "n": "庆阳", "a": [{ "s": "西峰区" }, { "s": "庆城县" }, { "s": "环县" }, { "s": "华池县" }, { "s": "合水县" }, { "s": "正宁县" }, { "s": "宁县" }, { "s": "镇原县" }] }, { "n": "定西", "a": [{ "s": "安定区" }, { "s": "通渭县" }, { "s": "陇西县" }, { "s": "渭源县" }, { "s": "临洮县" }, { "s": "漳县" }, { "s": "岷县" }] }, { "n": "陇南", "a": [{ "s": "武都区" }, { "s": "成县" }, { "s": "文县" }, { "s": "宕昌县" }, { "s": "康县" }, { "s": "西和县" }, { "s": "礼县" }, { "s": "徽县" }, { "s": "两当县" }] }, { "n": "临夏", "a": [{ "s": "临夏市" }, { "s": "临夏县" }, { "s": "康乐县" }, { "s": "永靖县" }, { "s": "广河县" }, { "s": "和政县" }, { "s": "东乡族自治县" }, { "s": "积石山保安族东乡族撒拉族自治县" }] }, { "n": "甘南", "a": [{ "s": "合作市" }, { "s": "临潭县" }, { "s": "卓尼县" }, { "s": "舟曲县" }, { "s": "迭部县" }, { "s": "玛曲县" }, { "s": "碌曲县" }, { "s": "夏河县" }] }] }, { "p": "青海", "c": [{ "n": "西宁", "a": [{ "s": "城东区" }, { "s": "城中区" }, { "s": "城西区" }, { "s": "城北区" }, { "s": "大通回族土族自治县" }, { "s": "湟中县" }, { "s": "湟源县" }] }, { "n": "海东", "a": [{ "s": "平安县" }, { "s": "民和回族土族自治县" }, { "s": "乐都县" }, { "s": "互助土族自治县" }, { "s": "化隆回族自治县" }, { "s": "循化撒拉族自治县" }] }, { "n": "海北", "a": [{ "s": "门源回族自治县" }, { "s": "祁连县" }, { "s": "海晏县" }, { "s": "刚察县" }] }, { "n": "黄南", "a": [{ "s": "同仁县" }, { "s": "尖扎县" }, { "s": "泽库县" }, { "s": "河南蒙古族自治县" }] }, { "n": "海南", "a": [{ "s": "共和县" }, { "s": "同德县" }, { "s": "贵德县" }, { "s": "兴海县" }, { "s": "贵南县" }] }, { "n": "果洛", "a": [{ "s": "玛沁县" }, { "s": "班玛县" }, { "s": "甘德县" }, { "s": "达日县" }, { "s": "久治县" }, { "s": "玛多县" }] }, { "n": "玉树", "a": [{ "s": "玉树县" }, { "s": "杂多县" }, { "s": "称多县" }, { "s": "治多县" }, { "s": "囊谦县" }, { "s": "曲麻莱县" }] }, { "n": "梅西", "a": [{ "s": "格尔木市" }, { "s": "德令哈市" }, { "s": "乌兰县" }, { "s": "都兰县" }, { "s": "天峻县" }] }] }, { "p": "宁夏", "c": [{ "n": "银川", "a": [{ "s": "兴庆区" }, { "s": "西夏区" }, { "s": "金凤区" }, { "s": "永宁县" }, { "s": "贺兰县" }, { "s": "灵武市" }] }, { "n": "石嘴山", "a": [{ "s": "大武口区" }, { "s": "惠农区" }, { "s": "平罗县" }] }, { "n": "吴忠", "a": [{ "s": "利通区" }, { "s": "红寺堡区" }, { "s": "盐池县" }, { "s": "同心县" }, { "s": "青铜峡市" }] }, { "n": "固原", "a": [{ "s": "原州区" }, { "s": "西吉县" }, { "s": "隆德县" }, { "s": "泾源县" }, { "s": "彭阳县" }] }, { "n": "中卫", "a": [{ "s": "沙坡头区" }, { "s": "中宁县" }, { "s": "海原县" }] }] }, { "p": "新疆", "c": [{ "n": "乌鲁木齐", "a": [{ "s": "天山区" }, { "s": "沙依巴克区" }, { "s": "新市区" }, { "s": "水磨沟区" }, { "s": "头屯河区" }, { "s": "达坂城区" }, { "s": "米东区" }, { "s": "乌鲁木齐县" }] }, { "n": "克拉玛依", "a": [{ "s": "独山子区" }, { "s": "克拉玛依区" }, { "s": "白碱滩区" }, { "s": "乌尔禾区" }] }, { "n": "吐鲁番", "a": [{ "s": "吐鲁番市" }, { "s": "鄯善县" }, { "s": "托克逊县" }] }, { "n": "哈密", "a": [{ "s": "哈密市" }, { "s": "巴里坤哈萨克自治县" }, { "s": "伊吾县" }] }, { "n": "昌吉", "a": [{ "s": "昌吉市" }, { "s": "阜康市" }, { "s": "呼图壁县" }, { "s": "玛纳斯县" }, { "s": "奇台县" }, { "s": "吉木萨尔县" }, { "s": "木垒哈萨克自治县" }] }, { "n": "博尔塔拉", "a": [{ "s": "博乐市" }, { "s": "精河县" }, { "s": "温泉县" }] }, { "n": "巴音郭楞", "a": [{ "s": "库尔勒市" }, { "s": "轮台县" }, { "s": "尉犁县" }, { "s": "若羌县" }, { "s": "且末县" }, { "s": "焉耆回族自治县" }, { "s": "和静县" }, { "s": "和硕县" }, { "s": "博湖县" }] }, { "n": "阿克苏", "a": [{ "s": "阿克苏市" }, { "s": "温宿县" }, { "s": "库车县" }, { "s": "沙雅县" }, { "s": "新和县" }, { "s": "拜城县" }, { "s": "乌什县" }, { "s": "阿瓦提县" }, { "s": "柯坪县" }] }, { "n": "克孜勒苏", "a": [{ "s": "阿图什市" }, { "s": "阿克陶县" }, { "s": "阿合奇县" }, { "s": "乌恰县" }] }, { "n": "喀什", "a": [{ "s": "喀什市" }, { "s": "疏附县" }, { "s": "疏勒县" }, { "s": "英吉沙县" }, { "s": "泽普县" }, { "s": "莎车县" }, { "s": "叶城县" }, { "s": "麦盖提县" }, { "s": "岳普湖县" }, { "s": "伽师县" }, { "s": "巴楚县" }, { "s": "塔什库尔干县塔吉克自治" }] }, { "n": "和田", "a": [{ "s": "和田市" }, { "s": "和田县" }, { "s": "墨玉县" }, { "s": "皮山县" }, { "s": "洛浦县" }, { "s": "策勒县" }, { "s": "于田县" }, { "s": "民丰县" }] }, { "n": "伊犁", "a": [{ "s": "伊宁市" }, { "s": "奎屯市" }, { "s": "伊宁县" }, { "s": "察布查尔锡伯自治县" }, { "s": "霍城县" }, { "s": "巩留县" }, { "s": "新源县" }, { "s": "昭苏县" }, { "s": "特克斯县" }, { "s": "尼勒克县" }] }, { "n": "塔城", "a": [{ "s": "塔城市" }, { "s": "乌苏市" }, { "s": "额敏县" }, { "s": "沙湾县" }, { "s": "托里县" }, { "s": "裕民县" }, { "s": "和布克赛尔蒙古自治县" }] }, { "n": "阿勒泰", "a": [{ "s": "阿勒泰市" }, { "s": "布尔津县" }, { "s": "富蕴县" }, { "s": "福海县" }, { "s": "哈巴河县" }, { "s": "青河县" }, { "s": "吉木乃县" }] }, { "n": "石河子", "a": [{ "s": "石河子" }] }, { "n": "阿拉尔", "a": [{ "s": "阿拉尔" }] }, { "n": "图木舒克", "a": [{ "s": "图木舒克" }] }, { "n": "五家渠", "a": [{ "s": "五家渠" }] }] }, { "p": "香港", "c": [{ "n": "中西区" }, { "n": "东区" }, { "n": "九龙城区" }, { "n": "观塘区" }, { "n": "南区" }, { "n": "深水区" }, { "n": "湾仔区" }, { "n": "黄大仙区" }, { "n": "油尖旺区" }, { "n": "离岛区" }, { "n": "葵青区" }, { "n": "北区" }, { "n": "西贡区" }, { "n": "沙田区" }, { "n": "屯门区" }, { "n": "大埔区" }, { "n": "荃湾区" }, { "n": "元朗区" }] }, { "p": "澳门", "c": [{ "n": "花地玛堂区" }, { "n": "圣安多尼堂区" }, { "n": "大堂区" }, { "n": "望德堂区" }, { "n": "风顺堂区" }, { "n": "嘉模堂区" }, { "n": "圣方济各堂区" }] }, { "p": "台湾", "c": [{ "n": "台北市" }, { "n": "高雄市" }, { "n": "基隆市" }, { "n": "台中市" }, { "n": "台南市" }, { "n": "新竹市" }, { "n": "嘉义市" }, { "n": "台北县" }, { "n": "宜兰县" }, { "n": "新竹县" }, { "n": "桃园县" }, { "n": "苗栗县" }, { "n": "台中县" }, { "n": "彰化县" }, { "n": "南投县" }, { "n": "嘉义县" }, { "n": "云林县" }, { "n": "台南县" }, { "n": "高雄县" }, { "n": "屏东县" }, { "n": "台东县" }, { "n": "花莲县" }, { "n": "澎湖县" }] }, { "p": "国外" }] };

/***/ }),
/* 141 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(jQuery) {/*
 Ajax 三级省市联动
 http://code.ciaoca.cn/
 日期：2012-7-18

 settings 参数说明
 -----
 url:省市数据josn文件路径
 prov:默认省份
 city:默认城市
 dist:默认地区（县）
 nodata:无数据状态
 required:必选项
 ------------------------------ */
(function ($) {
  $.fn.citySelect = function (settings) {
    if (this.length < 1) {
      return;
    }
    // 默认值
    settings = $.extend({
      url: "city.min.js",
      prov: null,
      city: null,
      dist: null,
      detail: null,
      nodata: null,
      required: true,
      bind: null
    }, settings);

    var box_obj = this;
    var prov_obj = box_obj.find(".prov");
    var city_obj = box_obj.find(".city");
    var dist_obj = box_obj.find(".dist");
    var detail_obj = box_obj.find(".detail");

    detail_obj.val(settings.detail);

    // var select_prehtml = (settings.required) ? "" : "<option value=''>请选择</option>";
    var prov_prehtml = settings.required ? "" : "<option value=''>请选择拍摄省份</option>";
    var city_prehtml = settings.required ? "" : "<option value=''>请选择拍摄城市</option>";
    var dist_prehtml = settings.required ? "" : "<option value=''>请选择拍摄区/县</option>";

    var city_json;

    // 赋值市级函数
    var cityStart = function () {
      var prov_id = prov_obj.get(0).selectedIndex;
      if (!settings.required) {
        prov_id--;
      }
      // city_obj.empty().attr("disabled", true);
      // dist_obj.empty().attr("disabled", true);

      if (prov_id < 0 || typeof city_json.citylist[prov_id].c == "undefined") {
        if (settings.nodata == "none") {
          city_obj.css("display", "none");
          dist_obj.css("display", "none");
        } else if (settings.nodata == "hidden") {
          city_obj.css("visibility", "hidden");
          dist_obj.css("visibility", "hidden");
        }
        return;
      }

      // 遍历赋值市级下拉列表
      // temp_html = select_prehtml;//Modify zhangxiao
      temp_html = city_prehtml;
      $.each(city_json.citylist[prov_id].c, function (i, city) {
        temp_html += "<option value='" + city.n + "'>" + city.n + "</option>";
      });
      city_obj.html(temp_html).attr("disabled", false).css({ "display": "", "visibility": "" });
      distStart();
    };

    // 赋值地区（县）函数
    var distStart = function () {
      var prov_id = prov_obj.get(0).selectedIndex;
      var city_id = city_obj.get(0).selectedIndex;
      if (!settings.required) {
        prov_id--;
        city_id--;
      }
      // dist_obj.empty().attr("disabled", true);

      if (prov_id < 0 || city_id < 0 || typeof city_json.citylist[prov_id].c[city_id].a == "undefined") {
        if (settings.nodata == "none") {
          dist_obj.css("display", "none");
        } else if (settings.nodata == "hidden") {
          dist_obj.css("visibility", "hidden");
        }
        return;
      }

      // 遍历赋值市级下拉列表
      // temp_html = select_prehtml;//Modify zhangxiao
      temp_html = dist_prehtml;
      $.each(city_json.citylist[prov_id].c[city_id].a, function (i, dist) {
        temp_html += "<option value='" + dist.s + "'>" + dist.s + "</option>";
      });
      dist_obj.html(temp_html).attr("disabled", false).css({ "display": "", "visibility": "" });
    };

    var init = function () {
      // 遍历赋值省份下拉列表
      //temp_html = select_prehtml;//Modify zhangxiao
      temp_html = prov_prehtml;
      $.each(city_json.citylist, function (i, prov) {
        temp_html += "<option value='" + prov.p + "'>" + prov.p + "</option>";
      });
      prov_obj.html(temp_html);

      // 若有传入省份与市级的值，则选中。（setTimeout为兼容IE6而设置）
      setTimeout(function () {
        if (settings.prov != null) {
          prov_obj.val(settings.prov);
          cityStart();
          setTimeout(function () {
            if (settings.city != null) {
              city_obj.val(settings.city);
              distStart();
              setTimeout(function () {
                if (settings.dist != null) {
                  dist_obj.val(settings.dist);
                }
              }, 1);
            }
          }, 1);
        }
      }, 1);

      function getSelectVal() {
        var prov = prov_obj.val() || '';
        var city = city_obj.val() || '';
        var dist = dist_obj.val() || '';
        var detail = detail_obj.val() || '';
        return {
          prov: prov,
          city: city,
          dist: dist,
          detail: detail
        };
      }

      // 选择省份时发生事件
      prov_obj.bind("change", function () {
        cityStart();
        detail_obj.val("");
        settings.bind(getSelectVal());
      });

      // 选择市级时发生事件
      city_obj.bind("change", function () {
        distStart();
        detail_obj.val("");
        settings.bind(getSelectVal());
      });

      //县选择发生事件
      dist_obj.bind("change", function () {
        detail_obj.val("");
        settings.bind(getSelectVal());
      });

      //详细信息
      detail_obj.bind("change", function () {
        settings.bind(getSelectVal());
      });

      city_obj.html(city_prehtml);
      dist_obj.html(dist_prehtml);
    };

    // 设置省市json数据
    if (typeof settings.url == "string") {
      $.getJSON(settings.url, function (json) {
        city_json = json;
        init();
      });
    } else {
      city_json = settings.url;
      init();
    }
  };
})(jQuery);
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function($, jQuery) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 * ocx版本检查及更新
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	var self = this;
	var check = function () {
		var self = this;
		self.NPPLAYER_VERSION = "";
		self.NPPLAYER_NAME = "";
		self.NPPLAYER_INFO = "";
		self.getVersionConf();
	};
	check.prototype.getVersionConf = function () {
		//获取ocx配置文件
		var self = this;
		self.NPPLAYER_INFO = window.settingsData.ocxInfo;
		self.NPPLAYER_VERSION = window.settingsData.ocxInfo["fop-ver"];
		self.NPPLAYER_NAME = window.settingsData.ocxInfo.name + "_" + window.settingsData.ocxInfo.version + window.settingsData.ocxInfo.extname;
	};
	check.prototype.bindEvents = function () {
		//下载播放器
		var self = this;
		$(".plugin-download-panel .downloadPlayer").off("click").on("click", function () {
			//          var playerEXE=require('src/plugins/media/'+self.NPPLAYER_NAME);
			// window.open(playerEXE, "downloadPlayer");
			var playerEXE = window.settingsData.cdn + "media/" + self.NPPLAYER_NAME;
			window.location.href = playerEXE;
		});
	};
	check.prototype.showDialog = function (type) {
		var self = this;
		var content = ['<div class="plugin-download-panel">', type === "install" ? '<i class="fn-icon player-install-icon"></i>' : '<i class="fn-icon player-update-icon"></i>', '	<div class="section1">', '		<h3>网页播放器</h3>', '		<em>解决网页中多种视频格式的播放。<br>(若为谷歌浏览器，请保证版本为chrome 40 及以下)</em>', '	</div>', '	<div class="section2 ui input">', '		<input class="downloadPlayer fn-btn fn-green-btn" value="立即下载" />', '	</div>', '</div>'];
		//渲染弹出层
		var dialogParam = {
			"title": "插件" + (type === "install" ? "安装" : "更新"),
			"width": 480,
			"height": 130,
			"content": content.join("")
		};
		//弹出web信息窗
		window.dialog(dialogParam).showModal();
		$("[tabindex='0']").css("z-index", "999999999999999999999999999999");
		$("[tabindex='1']").css("z-index", "999999999999999999999999999999");
		$("[tabindex='-1']").css({ "z-index": "999999999999999999999999999999", "left": "50%", "margin-left": "-240px" });
		//绑定事件
		self.bindEvents();
		//打印日志
		if (type === "install") {
			console.info("check player msg: player install progress.");
		} else {
			console.info("check player msg: player update progress.");
		}
	};
	check.prototype.checkPlayerForDown = function () {
		var self = this;
		var OCX = jQuery(".UIOCX")[0];
		//第一步，检查ocx是否存在
		if (!OCX) {
			alert("当前页面中暂未包含播放器插件");
			return false;
		}
		//第二步，检查是否安装过，通过访问函数实现
		if (!OCX.GetOption) {
			//提示安装
			self.showDialog("install");
			return false;
		}
		//第三步，检查是否需要更新
		try {
			var confParam = {
				isupgrade: self.NPPLAYER_INFO
			};
			var updateFlag = JSON.parse(OCX.IsUpgradeVersion(JSON.stringify(confParam)));
			//判断是否要升级
			if (updateFlag.isupgrade) {
				//需要升级
				self.showDialog("update");
				return false;
			} else {
				//判断是否需要强制升级
				if (window.ocxForceUpdate) {
					//需要升级
					self.showDialog("update");
					return false;
				}
			}
		} catch (e) {
			//提示升级
			self.showDialog("update");
			//打印日志
			console.warn("check player msg:", e.message);
			return false;
		}
		//不需要升级
		return true;
	};

	check.prototype.checkPlayer = function () {
		var self = this;
		var OCX = jQuery(".UIOCX")[0];
		//第一步，检查ocx是否存在
		if (!OCX) {
			alert("当前页面中暂未包含播放器插件");
			return false;
		}
		//第二步，检查是否安装过，通过访问函数实现
		if (!OCX.GetOption) {
			//提示安装
			self.showDialog("install");
			return false;
		}
		//第三步，检查是否需要更新
		try {
			var confParam = {
				isupgrade: self.NPPLAYER_INFO
			};
			var updateFlag = JSON.parse(OCX.GetOption(JSON.stringify(confParam)));
			//判断是否要升级
			//if (true) {
			if (updateFlag.isupgrade) {
				//需要升级
				self.showDialog("update");
				return false;
			} else {
				//判断是否需要强制升级
				if (window.ocxForceUpdate) {
					//需要升级
					self.showDialog("update");
					return false;
				}
			}
		} catch (e) {
			//提示升级
			self.showDialog("update");
			//打印日志
			console.warn("check player msg:", e.message);
			return false;
		}
		//不需要升级
		return true;
	};
	return check;
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(1)))

/***/ }),
/* 143 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(__webpack_provided_window_dot_jQuery, $) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
 @Name : jeDate v3.7 日期控件
 @Author: chen guojun
 @Date: 2016-11-23
 @QQ群：516754269
 @官网：http://www.jayui.com/jedate/ 或 https://github.com/singod/jeDate
 */
!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
    (function (root, factory) {

        root.jeDate = factory(__webpack_provided_window_dot_jQuery || $);
    })(this, function ($) {
        var jet = {},
            doc = document,
            ymdMacth = /\w+|d+/g,
            parseInt = function (n) {
            return window.parseInt(n, 10);
        },
            config = {
            skinCell: "jedateblue",
            format: "YYYY-MM-DD hh:mm:ss", //日期格式
            minDate: "1900-01-01 00:00:00", //最小日期
            maxDate: "2099-12-31 23:59:59" //最大日期
        };
        $.fn.jeDate = function (options) {
            return this.each(function () {
                return new jeDate($(this), options || {});
            });
        };
        $.extend({
            jeDate: function (elem, options) {
                return $(elem).each(function () {
                    return new jeDate($(this), options || {});
                });
            }
        });

        jet.docScroll = function (type) {
            type = type ? "scrollLeft" : "scrollTop";
            return doc.body[type] | doc.documentElement[type];
        };
        jet.winarea = function (type) {
            return doc.documentElement[type ? "clientWidth" : "clientHeight"];
        };
        jet.isShow = function (elem, bool) {
            elem.css({ display: bool != true ? "none" : "block" });
        };
        //判断是否闰年
        jet.isLeap = function (y) {
            return y % 100 !== 0 && y % 4 === 0 || y % 400 === 0;
        };
        //获取本月的总天数
        jet.getDaysNum = function (y, m) {
            var num = 31;
            switch (parseInt(m)) {
                case 2:
                    num = jet.isLeap(y) ? 29 : 28;break;
                case 4:case 6:case 9:case 11:
                    num = 30;break;
            }
            return num;
        };
        //获取月与年
        jet.getYM = function (y, m, n) {
            var nd = new Date(y, m - 1);
            nd.setMonth(m - 1 + n);
            return {
                y: nd.getFullYear(),
                m: nd.getMonth() + 1
            };
        };
        //获取上个月
        jet.getPrevMonth = function (y, m, n) {
            return jet.getYM(y, m, 0 - (n || 1));
        };
        //获取下个月
        jet.getNextMonth = function (y, m, n) {
            return jet.getYM(y, m, n || 1);
        };
        //补齐数位
        jet.digit = function (num) {
            return num < 10 ? "0" + (num | 0) : num;
        };
        //判断是否为数字
        jet.IsNum = function (str) {
            return str != null && str != "" ? !isNaN(str) : false;
        };
        //转换日期格式
        jet.parse = function (ymd, hms, format) {
            ymd = ymd.concat(hms);
            var hmsCheck = jet.parseCheck(format, false).substring(0, 5) == "hh:mm",
                num = 2;
            return format.replace(/YYYY|MM|DD|hh|mm|ss/g, function (str, index) {
                var idx = hmsCheck ? ++num : ymd.index = ++ymd.index | 0;
                return jet.digit(ymd[idx]);
            });
        };
        jet.parseCheck = function (format, bool) {
            var ymdhms = [];
            format.replace(/YYYY|MM|DD|hh|mm|ss/g, function (str, index) {
                ymdhms.push(str);
            });
            return ymdhms.join(bool == true ? "-" : ":");
        };
        jet.checkFormat = function (format) {
            var ymdhms = [];
            format.replace(/YYYY|MM|DD|hh|mm|ss/g, function (str, index) {
                ymdhms.push(str);
            });
            return ymdhms.join("-");
        };
        jet.parseMatch = function (str) {
            var timeArr = str.split(" ");
            return timeArr[0].match(ymdMacth);
        };
        //验证日期
        jet.checkDate = function (date) {
            var dateArr = date.match(ymdMacth);
            if (isNaN(dateArr[0]) || isNaN(dateArr[1]) || isNaN(dateArr[2])) return false;
            if (dateArr[1] > 12 || dateArr[1] < 1) return false;
            if (dateArr[2] < 1 || dateArr[2] > 31) return false;
            if ((dateArr[1] == 4 || dateArr[1] == 6 || dateArr[1] == 9 || dateArr[1] == 11) && dateArr[2] > 30) return false;
            if (dateArr[1] == 2) {
                if (dateArr[2] > 29) return false;
                if ((dateArr[0] % 100 == 0 && dateArr[0] % 400 != 0 || dateArr[0] % 4 != 0) && dateArr[2] > 28) return false;
            }
            return true;
        };
        //初始化日期
        jet.initDates = function (num, format) {
            format = format || 'YYYY-MM-DD hh:mm:ss';
            if (typeof num === "string") {
                var newDate = new Date(parseInt(num.substring(0, 10)) * 1e3);
            } else {
                num = num | 0;
                var newDate = new Date(),
                    todayTime = newDate.getTime() + 1000 * 60 * 60 * 24 * num;
                newDate.setTime(todayTime);
            }
            var years = newDate.getFullYear(),
                months = newDate.getMonth() + 1,
                days = newDate.getDate(),
                hh = newDate.getHours(),
                mm = newDate.getMinutes(),
                ss = newDate.getSeconds();
            return jet.parse([years, jet.digit(months), jet.digit(days)], [jet.digit(hh), jet.digit(mm), jet.digit(ss)], format);
        };
        jet.montharr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        jet.weeks = ["日", "一", "二", "三", "四", "五", "六"];
        //判断元素类型
        jet.isValHtml = function (that) {
            return (/textarea|input/.test(that[0].tagName.toLocaleLowerCase())
            );
        };
        jet.isBool = function (obj) {
            return obj == undefined || obj == true ? true : false;
        };
        jet.addDateTime = function (time, num, type, format) {
            var ishhmm = jet.checkFormat(format).substring(0, 5) == "hh-mm" ? true : false;
            var nocharDate = ishhmm ? time.replace(/^(\d{2})(?=\d)/g, "$1,") : time.substr(0, 4).replace(/^(\d{4})/g, "$1,") + time.substr(4).replace(/^(\d{2})(?=\d)/g, "$1,");
            var tarr = jet.IsNum(time) ? nocharDate.match(ymdMacth) : time.match(ymdMacth),
                date = new Date(),
                tm0 = parseInt(tarr[0]),
                tm1 = tarr[1] == undefined ? date.getMonth() + 1 : parseInt(tarr[1]),
                tm2 = tarr[2] == undefined ? date.getDate() : parseInt(tarr[2]),
                tm3 = tarr[3] == undefined ? date.getHours() : parseInt(tarr[3]),
                tm4 = tarr[4] == undefined ? date.getMinutes() : parseInt(tarr[4]),
                tm5 = tarr[5] == undefined ? date.getMinutes() : parseInt(tarr[5]);
            var newDate = new Date(tm0, jet.digit(tm1) - 1, type == "DD" ? tm2 + num : tm2, type == "hh" ? tm3 + num : tm3, type == "mm" ? tm4 + num : tm4, jet.digit(tm5));
            return jet.parse([newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate()], [newDate.getHours(), newDate.getMinutes(), newDate.getSeconds()], format);
        };
        jet.boxCell = "#jedatebox";
        function jeDate(elem, opts) {
            this.opts = opts;
            this.valCell = elem;
            this.init();
        }
        var jedfn = jeDate.prototype;
        jedfn.init = function () {
            var that = this,
                opts = that.opts,
                zIndex = opts.zIndex == undefined ? 2099 : opts.zIndex,
                isinitVal = opts.isinitVal == undefined || opts.isinitVal == false ? false : true,
                createDiv = $("<div id=" + jet.boxCell.replace(/\#/g, "") + " class='jedatebox " + (opts.skinCell || config.skinCell) + "'></div");
            jet.fixed = jet.isBool(opts.fixed);
            createDiv.attr("author", "chen guojun--www.jayui.com--version:3.5");
            createDiv.css({ "z-index": zIndex, "position": jet.fixed == true ? "absolute" : "fixed", "display": "block" });
            var initVals = function (elem) {
                var jeformat = opts.format || config.format,
                    inaddVal = opts.initAddVal || [0],
                    num,
                    type;
                var initVal = opts.initVal;
                var nowDateVal, jeaddDate;
                if (initVal) {
                    var initDate = new Date(initVal);
                    jeaddDate = jet.parse([initDate.getFullYear(), initDate.getMonth() + 1, initDate.getDate()], [initDate.getHours(), initDate.getMinutes(), initDate.getSeconds()], jeformat);
                } else {
                    if (inaddVal.length == 1) {
                        num = inaddVal[0], type = "DD";
                    } else {
                        num = inaddVal[0], type = inaddVal[1];
                    }
                    nowDateVal = jet.initDates(0, jeformat);
                    jeaddDate = jet.addDateTime(nowDateVal, num, type, jeformat);
                }

                (elem.val() || elem.text()) == "" ? jet.isValHtml(elem) ? elem.val(jeaddDate) : elem.text(jeaddDate) : jet.isValHtml(elem) ? elem.val() : elem.text();
            };
            //为开启初始化的时间设置值
            if (isinitVal && jet.isBool(opts.insTrigger)) {
                that.valCell.each(function () {
                    initVals($(this));
                });
            }
            if (jet.isBool(opts.insTrigger)) {
                that.valCell.on("click", function (ev) {
                    ev.stopPropagation();
                    if ($(jet.boxCell).length > 0) return;
                    jet.format = opts.format || config.format;
                    jet.minDate = opts.minDate || config.minDate;
                    jet.maxDate = opts.maxDate || config.maxDate;
                    $("body").append(createDiv);
                    that.setHtml(opts);
                });
            } else {
                jet.format = opts.format || config.format;
                jet.minDate = opts.minDate || config.minDate;
                jet.maxDate = opts.maxDate || config.maxDate;
                $("body").append(createDiv);
                that.setHtml(opts);
            }
        };
        //方位辨别
        jedfn.orien = function (obj, self, pos) {
            var tops,
                leris,
                ortop,
                orleri,
                rect = jet.fixed ? self[0].getBoundingClientRect() : obj[0].getBoundingClientRect();
            if (jet.fixed) {
                leris = rect.right + obj.outerWidth() / 1.5 >= jet.winarea(1) ? rect.right - obj.outerWidth() : rect.left + (pos ? 0 : jet.docScroll(1));
                tops = rect.bottom + obj.outerHeight() / 1 <= jet.winarea() ? rect.bottom - 1 : rect.top > obj.outerHeight() / 1.5 ? rect.top - obj.outerHeight() - 1 : jet.winarea() - obj.outerHeight();
                ortop = Math.max(tops + (pos ? 0 : jet.docScroll()) + 1, 1) + "px", orleri = leris + "px";
            } else {
                ortop = "50%", orleri = "50%";
                obj.css({ "margin-top": -(rect.height / 2), "margin-left": -(rect.width / 2) });
            }
            obj.css({ "top": ortop, "left": orleri });
        };
        //关闭层
        jedfn.dateClose = function () {
            $(jet.boxCell).remove();
        };
        //布局控件骨架
        jedfn.setHtml = function (opts) {
            var that = this,
                elemCell = that.valCell,
                boxCell = $(jet.boxCell);
            var weekHtml = "",
                tmsArr = "",
                date = new Date(),
                dateFormat = jet.checkFormat(jet.format),
                isYYMM = dateFormat == "YYYY-MM" || dateFormat == "YYYY" ? true : false,
                ishhmm = dateFormat.substring(0, 5) == "hh-mm" ? true : false;
            jet.formatType = dateFormat;
            if ((elemCell.val() || elemCell.text()) == "") {
                tmsArr = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
                jet.currDate = new Date(tmsArr[0], parseInt(tmsArr[1]) - 1, tmsArr[2], tmsArr[3], tmsArr[4], tmsArr[5]);
                jet.ymdDate = tmsArr[0] + "-" + jet.digit(tmsArr[1]) + "-" + jet.digit(tmsArr[2]);
            } else {
                var initVal = jet.isValHtml(elemCell) ? elemCell.val() : elemCell.text();
                //对获取到日期的进行替换
                var nocharDate = ishhmm ? initVal.replace(/^(\d{2})(?=\d)/g, "$1,") : initVal.substr(0, 4).replace(/^(\d{4})/g, "$1,") + initVal.substr(4).replace(/^(\d{2})(?=\d)/g, "$1,");
                //判断是否为数字类型，并分割
                var inVals = jet.IsNum(initVal) ? nocharDate.match(ymdMacth) : initVal.match(ymdMacth);
                if (ishhmm) {
                    tmsArr = dateFormat == "hh-mm" ? [inVals[0], inVals[1], date.getSeconds()] : [inVals[0], inVals[1], inVals[2]];
                    jet.currDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
                } else {
                    tmsArr = [inVals[0], inVals[1], inVals[2], inVals[3] == undefined ? date.getHours() : inVals[3], inVals[4] == undefined ? date.getMinutes() : inVals[4], inVals[5] == undefined ? date.getSeconds() : inVals[5]];
                    jet.currDate = new Date(tmsArr[0], parseInt(tmsArr[1]) - 1, tmsArr[2], tmsArr[3], tmsArr[4], tmsArr[5]);
                    jet.ymdDate = tmsArr[0] + "-" + jet.digit(tmsArr[1]) + "-" + jet.digit(tmsArr[2]);
                }
            }
            jet.currMonth = tmsArr[1], jet.currDays = tmsArr[2];
            //控件HMTL模板
            var datetopStr = '<div class="jedatetop">' + (!isYYMM ? '<div class="jedateym" style="width:50%;"><i class="prev triangle yearprev"></i><span class="jedateyy" ym="24"><em class="jedateyear"></em><em class="pndrop"></em></span><i class="next triangle yearnext"></i></div>' + '<div class="jedateym" style="width:50%;"><i class="prev triangle monthprev"></i><span class="jedatemm" ym="12"><em class="jedatemonth"></em><em class="pndrop"></em></span><i class="next triangle monthnext"></i></div>' : '<div class="jedateym" style="width:100%;"><i class="prev triangle ymprev"></i><span class="jedateyy"><em class="jedateyearmonth"></em></span><i class="next triangle ymnext"></i></div>') + "</div>";
            var dateymList = !isYYMM ? '<div class="jedatetopym" style="display: none;">' + '<ul class="ymdropul"></ul><p><span class="jedateymchle">&lt;&lt;</span><span class="jedateymchri">&gt;&gt;</span><span class="jedateymchok">关闭</span></p>' + "</div>" : dateFormat == "YYYY" ? '<ul class="jedayy"></ul>' : '<ul class="jedaym"></ul>';
            var dateriList = '<ol class="jedaol"></ol><ul class="jedaul"></ul>';
            var bothmsStr = !isYYMM ? '<div class="botflex jedatehmsshde"><ul class="jedatehms"><li><input type="text" /></li><i>:</i><li><input type="text" /></li><i>:</i><li><input type="text" /></li></ul></div>' + '<div class="botflex jedatebtn"><span class="jedateok">确认</span><span class="jedatetodaymonth">今天</span><span class="jedateclear">清空</span></div>' : dateFormat == "YYYY" ? '<div class="botflex jedatebtn"><span class="jedateok" style="width:47.8%">确认</span><span class="jedateclear" style="width:47.8%">清空</span></div>' : '<div class="botflex jedatebtn"><span class="jedateok">确认</span><span class="jedatetodaymonth">本月</span><span class="jedateclear">清空</span></div>';
            var datebotStr = '<div class="jedatebot">' + bothmsStr + "</div>";
            var datehmschoose = '<div class="jedateprophms ' + (ishhmm ? "jedatepropfix" : "jedateproppos") + '"><div class="jedatepropcon"><div class="jedatehmstitle">时间选择<div class="jedatehmsclose">&times;</div></div><div class="jedateproptext">小时</div><div class="jedateproptext">分钟</div><div class="jedateproptext">秒数</div><div class="jedatehmscon jedateprophours"></div><div class="jedatehmscon jedatepropminutes"></div><div class="jedatehmscon jedatepropseconds"></div></div></div>';
            var dateHtmStr = isYYMM ? datetopStr + dateymList + datebotStr : ishhmm ? datetopStr + datehmschoose + datebotStr : datetopStr + dateymList + dateriList + datehmschoose + datebotStr;
            boxCell.html(dateHtmStr);
            var dateIframeStr = '<iframe class="jedatetopIframe"></jedatetop>';
            $(".jedatetop").parent().append(dateIframeStr);
            //是否显示清除按钮
            jet.isBool(opts.isClear) ? "" : jet.isShow(boxCell.find(".jedatebot .jedateclear"), false);
            //是否显示今天按钮
            if (!isYYMM) {
                jet.isBool(opts.isToday) ? "" : jet.isShow(boxCell.find(".jedatebot .jedatetodaymonth"), false);
            };
            //是否显示确认按钮
            jet.isBool(opts.isOk) ? "" : jet.isShow(boxCell.find(".jedatebot .jedateok")[0], false);
            //判断是否有时分秒
            if (/\hh-mm/.test(dateFormat)) {
                var isTimehms = function (bool) {
                    if (elemCell.val() != "" || elemCell.text() != "") {
                        var hmsArrs = bool ? [tmsArr[0], tmsArr[1], tmsArr[2]] : [tmsArr[3], tmsArr[4], tmsArr[5]];
                    } else {
                        var hmsArrs = [jet.currDate.getHours(), jet.currDate.getMinutes(), jet.currDate.getSeconds()];
                    }
                    boxCell.find(".jedatebot .jedatehms input").each(function (i) {
                        $(this).val(jet.digit(hmsArrs[i]));
                        jet.isBool(opts.ishmsVal) ? "" : $(this).attr("readOnly", 'true');
                    });
                };
                if (ishhmm) {
                    isTimehms(true);
                    boxCell.find(".jedateyear").text(jet.currDate.getFullYear() + '年');
                    boxCell.find(".jedatemonth").text(jet.digit(jet.currDate.getMonth() + 1) + '月');
                } else {
                    if (jet.isBool(opts.isTime)) {
                        isTimehms(false);
                    } else {
                        jet.isShow(boxCell.find(".jedatebot .jedatehmsshde"), false);
                        boxCell.find(".jedatebot .jedatebtn").css("width", "100%");
                    }
                }
            } else {
                if (!isYYMM) jet.isShow(boxCell.find(".jedatebot .jedatehmsshde"), false);
                boxCell.find(".jedatebot .jedatebtn").css("width", "100%");
            };
            //判断是否为年月类型
            if (/\YYYY-MM-DD/.test(dateFormat)) {
                $.each(jet.weeks, function (i, week) {
                    weekHtml += '<li class="weeks" data-week="' + week + '">' + week + "</li>";
                });
                boxCell.find(".jedaol").html(weekHtml);
                that.createDaysHtml(jet.currDate.getFullYear(), jet.currDate.getMonth() + 1, opts);
                that.chooseYM(opts);
            };
            if (isYYMM) {
                var monthCls = boxCell.find(".jedateym .jedateyearmonth");
                if (dateFormat == "YYYY") {
                    monthCls.attr("data-onyy", tmsArr[0]).text(tmsArr[0] + "年");
                    boxCell.find(".jedayy").html(that.onlyYear(tmsArr[0]));
                } else {
                    monthCls.attr("data-onym", tmsArr[0] + "-" + jet.digit(tmsArr[1])).text(tmsArr[0] + "年" + parseInt(tmsArr[1]) + "月");
                    boxCell.find(".jedaym").html(that.onlyYMStr(tmsArr[0], parseInt(tmsArr[1])));
                }
                that.onlyYMevents(tmsArr, opts);
            }
            that.orien(boxCell, elemCell);
            setTimeout(function () {
                opts.success && opts.success(elemCell);
            }, 2);
            that.events(tmsArr, opts);
        };
        //循环生成日历
        jedfn.createDaysHtml = function (ys, ms, opts) {
            var that = this,
                boxCell = $(jet.boxCell);
            var year = parseInt(ys),
                month = parseInt(ms),
                dateHtml = "",
                count = 0;
            var minArr = jet.minDate.match(ymdMacth),
                minNum = minArr[0] + minArr[1] + minArr[2],
                maxArr = jet.maxDate.match(ymdMacth),
                maxNum = maxArr[0] + maxArr[1] + maxArr[2];
            boxCell.find(".jedaul").html(""); //切忌一定要把这个内容去掉，要不然会点一次翻页都在日历下面依次显示出来
            var firstWeek = new Date(year, month - 1, 1).getDay() || 7,
                daysNum = jet.getDaysNum(year, month),
                prevM = jet.getPrevMonth(year, month),
                prevDaysNum = jet.getDaysNum(year, prevM.m),
                nextM = jet.getNextMonth(year, month),
                currOne = jet.currDate.getFullYear() + "-" + jet.digit(jet.currDate.getMonth() + 1) + "-" + jet.digit(1),
                thisOne = year + "-" + jet.digit(month) + "-" + jet.digit(1);
            boxCell.find(".jedateyear").attr("year", year).text(year + '年');
            boxCell.find(".jedatemonth").attr("month", month).text(month + '月');
            //设置时间标注
            var mark = function (my, mm, md) {
                var Marks = opts.marks,
                    contains = function (arr, obj) {
                    var len = arr.length;
                    while (len--) {
                        if (arr[len] === obj) return true;
                    }
                    return false;
                };
                return $.isArray(Marks) && Marks.length > 0 && contains(Marks, my + "-" + jet.digit(mm) + "-" + jet.digit(md)) ? '<i class="marks"></i>' : "";
            };
            //是否显示节日
            var isfestival = function (y, m, d) {
                var festivalStr;
                if (opts.festival == true) {
                    var lunar = jeLunar(y, m - 1, d),
                        feslunar = lunar.solarFestival || lunar.lunarFestival,
                        lunartext = (feslunar && lunar.jieqi) != "" ? feslunar : lunar.jieqi || lunar.showInLunar;
                    festivalStr = '<p><span class="solar">' + d + '</span><span class="lunar">' + lunartext + '</span></p>';
                } else {
                    festivalStr = '<p class="nolunar">' + d + '</p>';
                }
                return festivalStr;
            };
            //判断是否在限制的日期之中
            var dateOfLimit = function (Y, M, D, isMonth) {
                var thatNum = (Y + "-" + jet.digit(M) + "-" + jet.digit(D)).replace(/\-/g, '');
                if (isMonth) {
                    if (parseInt(thatNum) >= parseInt(minNum) && parseInt(thatNum) <= parseInt(maxNum)) return true;
                } else {
                    if (parseInt(minNum) > parseInt(thatNum) || parseInt(maxNum) < parseInt(thatNum)) return true;
                }
            };
            //上一月剩余天数
            for (var p = prevDaysNum - firstWeek + 1; p <= prevDaysNum; p++, count++) {
                var pmark = mark(prevM.y, prevM.m, p),
                    pCls = dateOfLimit(prevM.y, prevM.m, p, false) ? "disabled" : "other";
                dateHtml += '<li year="' + prevM.y + '" month="' + prevM.m + '" day="' + p + '" class=' + pCls + '>' + (isfestival(prevM.y, prevM.m, p) + pmark) + '</li>';
            }
            //本月的天数
            for (var b = 1; b <= daysNum; b++, count++) {
                var bCls = "",
                    bmark = mark(year, month, b),
                    thisDate = year + "-" + jet.digit(month) + "-" + jet.digit(b); //本月当前日期
                if (dateOfLimit(year, month, b, true)) {
                    bCls = jet.ymdDate == thisDate ? "action" : currOne != thisOne && thisOne == thisDate ? "action" : "";
                } else {
                    bCls = "disabled";
                }
                dateHtml += '<li year="' + year + '" month="' + month + '" day="' + b + '" ' + (bCls != "" ? "class=" + bCls + "" : "") + '>' + (isfestival(year, month, b) + bmark) + '</li>';
            }
            //下一月开始天数
            for (var n = 1, nlen = 42 - count; n <= nlen; n++) {
                var nmark = mark(nextM.y, nextM.m, n),
                    nCls = dateOfLimit(nextM.y, nextM.m, n, false) ? "disabled" : "other";
                dateHtml += '<li year="' + nextM.y + '" month="' + nextM.m + '" day="' + n + '" class=' + nCls + '>' + (isfestival(nextM.y, nextM.m, n) + nmark) + '</li>';
            }
            //把日期拼接起来并插入
            boxCell.find(".jedaul").html(dateHtml);
            that.chooseDays(opts);
        };
        //循环生成年月（YYYY-MM）
        jedfn.onlyYMStr = function (y, m) {
            var onlyYM = "";
            $.each(jet.montharr, function (i, val) {
                var minArr = jet.parseMatch(jet.minDate),
                    maxArr = jet.parseMatch(jet.maxDate),
                    thisDate = new Date(y, jet.digit(val), "01"),
                    minTime = new Date(minArr[0], minArr[1], minArr[2]),
                    maxTime = new Date(maxArr[0], maxArr[1], maxArr[2]);
                if (thisDate < minTime || thisDate > maxTime) {
                    onlyYM += "<li class='disabled' ym='" + y + "-" + jet.digit(val) + "'>" + y + "年" + jet.digit(val) + "月</li>";
                } else {
                    onlyYM += "<li " + (m == val ? 'class="action"' : "") + ' ym="' + y + "-" + jet.digit(val) + '">' + y + "年" + jet.digit(val) + "月</li>";
                }
            });
            return onlyYM;
        };
        //循环生成年（YYYY）
        jedfn.onlyYear = function (YY) {
            var onlyStr = "";
            jet.yearArr = new Array(15);
            $.each(jet.yearArr, function (i) {
                var minArr = jet.parseMatch(jet.minDate),
                    maxArr = jet.parseMatch(jet.maxDate),
                    minY = minArr[0],
                    maxY = maxArr[0],
                    yyi = YY - 7 + i,
                    getyear = $(jet.boxCell).find(".jedateym .jedateyearmonth").attr("data-onyy");
                if (yyi < minY || yyi > maxY) {
                    onlyStr += "<li class='disabled' yy='" + yyi + "'>" + yyi + "年</li>";
                } else {
                    onlyStr += "<li " + (getyear == yyi ? 'class="action"' : "") + " yy='" + yyi + "'>" + yyi + "年</li>";
                }
            });
            return onlyStr;
        };
        //生成定位时分秒
        jedfn.setStrhms = function (opts) {
            var that = this,
                boxCell = $(jet.boxCell);
            var parseFormat = jet.format,
                hmsArr = [],
                hmsliCls = boxCell.find(".jedatehms li"),
                proptextCls = boxCell.find(".jedatepropcon .jedateproptext"),
                propconCls = boxCell.find(".jedatepropcon .jedatehmscon");
            var parsehms = function (str) {
                var ymdstr = str.match(ymdMacth).join("-"),
                    timeArr = ymdstr == "YYYY-MM-DD-hh-mm" ? str.split(" ") : ymdstr,
                    isHMtime = ymdstr == "YYYY-MM-DD-hh-mm" ? timeArr[1] : timeArr;
                return isHMtime.match(ymdMacth).join("-");
            };
            var parmathm = parsehms(parseFormat) == "hh-mm";
            if (parmathm) {
                var hmsliWidth = hmsliCls.css('width').replace(/\px|em|rem/g, ''),
                    hmsiW = boxCell.find(".jedatehms i").css('width').replace(/\px|em|rem/g, ''),
                    hmschoseW = proptextCls.css('width').replace(/\px|em|rem/g, ''),
                    hmslival = Math.round(parseInt(hmsliWidth) + parseInt(hmsliWidth) / 2 + parseInt(hmsiW) / 2);
                hmsliCls[0].style.width = hmsliCls[1].style.width = hmslival + "px";
                proptextCls[0].style.width = proptextCls[1].style.width = propconCls[0].style.width = propconCls[1].style.width = Math.round(parseInt(hmschoseW) + parseInt(hmschoseW) / 2 + 2) + "px";
            }
            //生成时分秒
            $.each([24, 60, 60], function (i, len) {
                var hmsStr = "",
                    hmsCls = "",
                    inputCls = boxCell.find(".jedatehms input"),
                    textem = inputCls.eq(i).val();
                inputCls.eq(i).attr("maxlength", 2).attr("numval", len - 1).attr("item", i);
                for (var h = 0; h < len; h++) {
                    h = jet.digit(h);
                    if (opts.ishmsLimit) {
                        hmsCls = h < textem ? "disabled" : h == textem ? "action" : "";
                    } else {
                        hmsCls = parmathm && i == 2 ? textem == h ? "disabled action" : "disabled" : textem == h ? "action" : "";
                        if (parmathm && i == 2) {
                            var readCls = hmsliCls.eq(2);
                            readCls.css({ "display": "none" }).prev().css({ "display": "none" });
                            proptextCls.eq(i).css({ "display": "none" });
                            propconCls.eq(i).css({ "display": "none" });
                        }
                    }
                    hmsStr += '<p class="' + hmsCls + '">' + h + "</p>";
                }
                hmsArr.push(hmsStr);
            });
            return hmsArr;
        };
        //仅年月情况下的点击
        jedfn.onlyYMevents = function (tmsArr, opts) {
            var that = this,
                boxCell = $(jet.boxCell);
            var ymVal,
                ymPre = boxCell.find(".jedateym .ymprev"),
                ymNext = boxCell.find(".jedateym .ymnext"),
                ony = parseInt(tmsArr[0]),
                onm = parseFloat(tmsArr[1]);
            $.each([ymPre, ymNext], function (i, cls) {
                cls.on("click", function (ev) {
                    ev.stopPropagation();
                    if (jet.checkFormat(jet.format) == "YYYY") {
                        ymVal = cls == ymPre ? boxCell.find(".jedayy li").attr("yy") : boxCell.find(".jedayy li").eq(jet.yearArr.length - 1).attr("yy");
                        boxCell.find(".jedayy").html(that.onlyYear(parseInt(ymVal)));
                    } else {
                        ymVal = cls == ymPre ? ony -= 1 : ony += 1;
                        boxCell.find(".jedaym").html(that.onlyYMStr(ymVal, onm));
                    }
                    that.ymPremNextEvents(opts);
                });
            });
        };
        jedfn.nongliorien = function (obj, self, pos) {
            var tops,
                leris,
                ortop,
                orleri,
                rect = self[0].getBoundingClientRect();
            leris = rect.right + obj[0].offsetWidth / 1.5 >= jet.winarea(1) ? rect.right - obj[0].offsetWidth : rect.left + (pos ? 0 : jet.docScroll(1));
            tops = rect.bottom + obj[0].offsetHeight / 1 <= jet.winarea() ? rect.bottom - 1 : rect.top > obj[0].offsetHeight / 1.5 ? rect.top - obj[0].offsetHeight - 1 : jet.winarea() - obj[0].offsetHeight;
            ortop = Math.max(tops + (pos ? 0 : jet.docScroll()) + 1, 1) + "px", orleri = leris + "px";
            return { top: ortop, left: orleri };
        };
        //选择日期
        jedfn.chooseDays = function (opts) {
            var that = this,
                elemCell = that.valCell,
                boxCell = $(jet.boxCell);
            boxCell.find(".jedaul li").on("click", function (ev) {
                var _that = $(this),
                    liTms = [];
                if (_that.hasClass("disabled")) return;
                ev.stopPropagation();
                //获取时分秒的集合
                boxCell.find(".jedatehms input").each(function () {
                    liTms.push($(this).val());
                });
                var aty = parseInt(_that.attr("year")),
                    atm = parseFloat(_that.attr("month")),
                    atd = parseFloat(_that.attr("day")),
                    getDateVal = jet.parse([aty, atm, atd], [liTms[0], liTms[1], liTms[2]], jet.format);
                jet.isValHtml(elemCell) ? elemCell.val(getDateVal) : elemCell.text(getDateVal);
                that.dateClose();
                opts.festival && $("#jedatetipscon").remove();
                if ($.isFunction(opts.choosefun) || opts.choosefun != null) opts.choosefun && opts.choosefun(elemCell, getDateVal);
            });

            if (opts.festival) {
                //鼠标进入提示框出现
                boxCell.find(".jedaul li").on("mouseover", function () {
                    var _this = $(this),
                        aty = parseInt(_this.attr("year")),
                        atm = parseFloat(_this.attr("month")),
                        atd = parseFloat(_this.attr("day")),
                        tipDiv = $("<div/>", { "id": "jedatetipscon", "class": "jedatetipscon" }),
                        lunar = jeLunar(aty, atm - 1, atd);
                    var tiphtml = '<p>' + lunar.solarYear + '年' + lunar.solarMonth + '月' + lunar.solarDate + '日 ' + lunar.inWeekDays + '</p><p class="red">农历：' + lunar.shengxiao + '年 ' + lunar.lnongMonth + '月' + lunar.lnongDate + '</p><p>' + lunar.ganzhiYear + '年 ' + lunar.ganzhiMonth + '月 ' + lunar.ganzhiDate + '日</p>';
                    var Fesjieri = (lunar.solarFestival || lunar.lunarFestival) != "" ? '<p class="red">' + ("节日：" + lunar.solarFestival + lunar.lunarFestival) + '</p>' : "";
                    var Fesjieqi = lunar.jieqi != "" ? '<p class="red">' + (lunar.jieqi != "" ? "节气：" + lunar.jieqi : "") + '</p>' : "";
                    var tiptext = (lunar.solarFestival || lunar.lunarFestival || lunar.jieqi) != "" ? Fesjieri + Fesjieqi : "";
                    //生成提示框到文档中
                    $("body").append(tipDiv);
                    tipDiv.html(tiphtml + tiptext);
                    //获取并设置农历提示框出现的位置
                    var tipPos = jedfn.nongliorien(tipDiv, _this);
                    tipDiv.css({ "z-index": opts.zIndex == undefined ? 2099 + 5 : opts.zIndex + 5, top: tipPos.top, left: tipPos.left, position: "absolute", display: "block" });
                }).on("mouseout", function () {
                    //鼠标移除提示框消失
                    if ($("#jedatetipscon").length > 0) $("#jedatetipscon").remove();
                });
            }
        };
        //下拉选择年和月
        jedfn.chooseYM = function (opts) {
            var that = this,
                boxCell = $(jet.boxCell);
            var jetopym = boxCell.find(".jedatetopym"),
                jedateyy = boxCell.find(".jedateyy"),
                jedatemm = boxCell.find(".jedatemm"),
                jedateyear = boxCell.find(".jedateyy .jedateyear"),
                jedatemonth = boxCell.find(".jedatemm .jedatemonth"),
                mchri = boxCell.find(".jedateymchri"),
                mchle = boxCell.find(".jedateymchle"),
                ishhmmss = jet.checkFormat(jet.format).substring(0, 5) == "hh-mm" ? true : false;
            var minArr = jet.minDate.match(ymdMacth),
                minNum = minArr[0] + minArr[1],
                maxArr = jet.maxDate.match(ymdMacth),
                maxNum = maxArr[0] + maxArr[1];
            //循环生成年
            function eachYears(YY) {
                var eachStr = "",
                    ycls;
                $.each(new Array(15), function (i, v) {
                    if (i === 7) {
                        var getyear = jedateyear.attr("year");
                        ycls = parseInt(YY) >= parseInt(minArr[0]) && parseInt(YY) <= parseInt(maxArr[0]) ? getyear == YY ? 'class="action"' : "" : 'class="disabled"';
                        eachStr += "<li " + ycls + ' yy="' + YY + '">' + YY + "年</li>";
                    } else {
                        ycls = parseInt(YY - 7 + i) >= parseInt(minArr[0]) && parseInt(YY - 7 + i) <= parseInt(maxArr[0]) ? "" : 'class="disabled"';
                        eachStr += '<li ' + ycls + ' yy="' + (YY - 7 + i) + '">' + (YY - 7 + i) + "年</li>";
                    }
                });
                return eachStr;
            }
            //循环生成月
            function eachYearMonth(YY, ymlen) {
                var ymStr = "";
                if (ymlen == 12) {
                    $.each(jet.montharr, function (i, val) {
                        var getmonth = jedatemonth.attr("month"),
                            val = jet.digit(val);
                        var mcls = parseInt(jedateyear.attr("year") + val) >= parseInt(minNum) && parseInt(jedateyear.attr("year") + val) <= parseInt(maxNum) ? jet.digit(getmonth) == val ? 'class="action"' : "" : 'class="disabled"';
                        ymStr += "<li " + mcls + ' mm="' + val + '">' + val + "月</li>";
                    });
                    $.each([mchri, mchle], function (c, cls) {
                        jet.isShow(cls, false);
                    });
                } else {
                    ymStr = eachYears(YY);
                    $.each([mchri, mchle], function (c, cls) {
                        jet.isShow(cls, true);
                    });
                }
                jetopym.removeClass(ymlen == 12 ? "jedatesety" : "jedatesetm").addClass(ymlen == 12 ? "jedatesetm" : "jedatesety");
                boxCell.find(".jedatetopym .ymdropul").html(ymStr);
                jet.isShow(jetopym, true);
            }
            function clickLiYears(year) {
                boxCell.find(".ymdropul li").on("click", function (ev) {
                    var _this = $(this),
                        Years = _this.attr("yy"),
                        Months = parseInt(jedatemonth.attr("month"));
                    if (_this.hasClass("disabled")) return;
                    ev.stopPropagation();
                    year.attr("year", Years).html(Years + '年');
                    jet.isShow(jetopym, false);
                    that.createDaysHtml(Years, Months, opts);
                });
            }
            //下拉选择年
            !ishhmmss && jedateyy.on("click", function () {
                var yythat = $(this),
                    YMlen = parseInt(yythat.attr("ym")),
                    yearAttr = parseInt(jedateyear.attr("year"));
                eachYearMonth(yearAttr, YMlen);
                clickLiYears(jedateyear);
            });
            //下拉选择月
            !ishhmmss && jedatemm.on("click", function () {
                var mmthis = $(this),
                    YMlen = parseInt(mmthis.attr("ym")),
                    yearAttr = parseInt(jedateyear.attr("year"));
                eachYearMonth(yearAttr, YMlen);
                boxCell.find(".ymdropul li").on("click", function (ev) {
                    if ($(this).hasClass("disabled")) return;
                    ev.stopPropagation();
                    var lithat = $(this),
                        Years = jedateyear.attr("year"),
                        Months = parseInt(lithat.attr("mm"));
                    jedatemonth.attr("month", Months).html(Months + '月');
                    jet.isShow(jetopym, false);
                    that.createDaysHtml(Years, Months, opts);
                });
            });
            //关闭下拉选择
            boxCell.find(".jedateymchok").on("click", function (ev) {
                ev.stopPropagation();
                jet.isShow(jetopym, false);
            });
            var yearMch = parseInt(jedateyear.attr("year"));
            $.each([mchle, mchri], function (d, cls) {
                cls.on("click", function (ev) {
                    ev.stopPropagation();
                    d == 0 ? yearMch -= 15 : yearMch += 15;
                    var mchStr = eachYears(yearMch);
                    boxCell.find(".jedatetopym .ymdropul").html(mchStr);
                    clickLiYears(jedateyear);
                });
            });
        };
        //年月情况下的事件绑定
        jedfn.ymPremNextEvents = function (opts) {
            var that = this,
                elemCell = that.valCell,
                boxCell = $(jet.boxCell);
            var newDate = new Date(),
                isYY = jet.checkFormat(jet.format) == "YYYY",
                ymCls = isYY ? boxCell.find(".jedayy li") : boxCell.find(".jedaym li");
            //选择年月
            ymCls.on("click", function (ev) {
                if ($(this).hasClass("disabled")) return; //判断是否为禁选状态
                ev.stopPropagation();
                var atYM = isYY ? $(this).attr("yy").match(ymdMacth) : $(this).attr("ym").match(ymdMacth),
                    getYMDate = isYY ? jet.parse([atYM[0], newDate.getMonth() + 1, 1], [0, 0, 0], jet.format) : jet.parse([atYM[0], atYM[1], 1], [0, 0, 0], jet.format);
                jet.isValHtml(elemCell) ? elemCell.val(getYMDate) : elemCell.text(getYMDate);
                that.dateClose();
                if ($.isFunction(opts.choosefun) || opts.choosefun != null) opts.choosefun(elemCell, getYMDate);
            });
        };
        jedfn.events = function (tmsArr, opts) {
            var that = this,
                elemCell = that.valCell,
                boxCell = $(jet.boxCell);
            var newDate = new Date(),
                yPre = boxCell.find(".yearprev"),
                yNext = boxCell.find(".yearnext"),
                mPre = boxCell.find(".monthprev"),
                mNext = boxCell.find(".monthnext"),
                jedateyear = boxCell.find(".jedateyear"),
                jedatemonth = boxCell.find(".jedatemonth"),
                isYYMM = jet.checkFormat(jet.format) == "YYYY-MM" || jet.checkFormat(jet.format) == "YYYY" ? true : false,
                ishhmmss = jet.checkFormat(jet.format).substring(0, 5) == "hh-mm" ? true : false;
            if (!isYYMM) {
                //切换年
                !ishhmmss && $.each([yPre, yNext], function (i, cls) {
                    cls.on("click", function (ev) {
                        if (boxCell.find(".jedatetopym").css("display") == "block") return;
                        ev.stopPropagation();
                        var year = parseInt(jedateyear.attr("year")),
                            month = parseInt(jedatemonth.attr("month")),
                            pnYear = cls == yPre ? --year : ++year;
                        cls == that.createDaysHtml(pnYear, month, opts);
                    });
                });
                //切换月
                !ishhmmss && $.each([mPre, mNext], function (i, cls) {
                    cls.on("click", function (ev) {
                        if (boxCell.find(".jedatetopym").css("display") == "block") return;
                        ev.stopPropagation();
                        var year = parseInt(jedateyear.attr("year")),
                            month = parseInt(jedatemonth.attr("month")),
                            PrevYM = jet.getPrevMonth(year, month),
                            NextYM = jet.getNextMonth(year, month);
                        cls == mPre ? that.createDaysHtml(PrevYM.y, PrevYM.m, opts) : that.createDaysHtml(NextYM.y, NextYM.m, opts);
                    });
                });
                //时分秒事件绑定
                var hmsStr = that.setStrhms(opts),
                    hmsevents = function (hmsArr) {
                    $.each(hmsArr, function (i, hmsCls) {
                        if (hmsCls.html() == "") hmsCls.html(hmsStr[i]);
                    });
                    if (ishhmmss) {
                        jet.isShow(boxCell.find(".jedatehmsclose"), false);
                        jet.isShow(boxCell.find(".jedatetodaymonth"), false);
                    } else {
                        jet.isShow(boxCell.find(".jedateprophms"), true);
                    }
                    //计算当前时分秒的位置
                    $.each(["hours", "minutes", "seconds"], function (i, hms) {
                        var hmsCls = boxCell.find(".jedateprop" + hms),
                            achmsCls = boxCell.find(".jedateprop" + hms + " .action");
                        hmsCls[0].scrollTop = achmsCls[0].offsetTop - 146;
                        var onhmsPCls = boxCell.find(".jedateprop" + hms + " p");
                        onhmsPCls.on("click", function () {
                            var _this = $(this);
                            if (_this.hasClass("disabled")) return;
                            onhmsPCls.each(function () {
                                $(this).removeClass("action");
                            });
                            _this.addClass("action");
                            boxCell.find(".jedatebot .jedatehms input").eq(i).val(jet.digit(_this.text()));
                            if (!ishhmmss) jet.isShow(boxCell.find(".jedateprophms"), false);
                        });
                    });
                };
                var hs = boxCell.find(".jedateprophours"),
                    ms = boxCell.find(".jedatepropminutes"),
                    ss = boxCell.find(".jedatepropseconds");
                if (ishhmmss) {
                    hmsevents([hs, ms, ss]);
                } else {
                    boxCell.find(".jedatehms").on("click", function () {
                        if (boxCell.find(".jedateprophms").css("display") !== "block") hmsevents([hs, ms, ss]);
                        //关闭时分秒层
                        boxCell.find(".jedateprophms .jedatehmsclose").on("click", function () {
                            jet.isShow(boxCell.find(".jedateprophms"), false);
                        });
                    });
                }
                //今天按钮设置日期时间
                boxCell.find(".jedatebot .jedatetodaymonth").on("click", function () {
                    var toTime = [newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getHours(), newDate.getMinutes(), newDate.getSeconds()],
                        gettoDate = jet.parse([toTime[0], toTime[1], toTime[2]], [toTime[3], toTime[4], toTime[5]], jet.format);
                    that.createDaysHtml(toTime[0], toTime[1], opts);
                    jet.isValHtml(elemCell) ? elemCell.val(gettoDate) : jet.text(gettoDate);
                    that.dateClose();
                    if ($.isFunction(opts.choosefun) || opts.choosefun != null) opts.choosefun(elemCell, gettoDate);
                    if (!isYYMM) that.chooseDays(opts);
                });
            } else {
                that.ymPremNextEvents(opts);
                //本月按钮设置日期时间
                boxCell.find(".jedatebot .jedatetodaymonth").on("click", function (ev) {
                    ev.stopPropagation();
                    var ymTime = [newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate()],
                        YMDate = jet.parse([ymTime[0], ymTime[1], 0], [0, 0, 0], jet.format);
                    jet.isValHtml(elemCell) ? elemCell.val(YMDate) : elemCell.text(YMDate);
                    that.dateClose();
                    if ($.isFunction(opts.choosefun) || opts.choosefun != null) opts.choosefun(elemCell, YMDate);
                });
            }
            //检查时间输入值，并对应到相应位置
            boxCell.find(".jedatehms input").on("keyup", function () {
                var _this = $(this),
                    thatval = _this.val(),
                    hmsVal = parseInt(_this.attr("numval")),
                    thatitem = parseInt(_this.attr("item"));
                _this.val(thatval.replace(/\D/g, ""));
                //判断输入值是否大于所设值
                if (thatval > hmsVal) {
                    _this.val(hmsVal);
                    alert("输入值不能大于" + hmsVal);
                }
                if (thatval == "") _this.val("00");
                boxCell.find(".jedatehmscon").eq(thatitem).children().each(function () {
                    $(this).removeClass("action");
                });
                boxCell.find(".jedatehmscon").eq(thatitem).children().eq(parseInt(_this.val().replace(/^0/g, ''))).addClass("action");
                $.each(["hours", "minutes", "seconds"], function (i, hms) {
                    var hmsCls = boxCell.find(".jedateprop" + hms),
                        achmsCls = boxCell.find(".jedateprop" + hms + " .action");
                    hmsCls[0].scrollTop = achmsCls[0].offsetTop - 118;
                });
            });
            //清空按钮清空日期时间
            boxCell.find(".jedatebot .jedateclear").on("click", function (ev) {
                ev.stopPropagation();
                var clearVal = jet.isValHtml(elemCell) ? elemCell.val() : elemCell.text();
                jet.isValHtml(elemCell) ? elemCell.val("") : elemCell.text("");
                that.dateClose();
                if (clearVal != "") {
                    if (jet.isBool(opts.clearRestore)) {
                        jet.minDate = opts.startMin || jet.minDate;
                        jet.maxDate = opts.startMax || jet.maxDate;
                    }
                    if ($.isFunction(opts.clearfun) || opts.clearfun != null) opts.clearfun(elemCell, clearVal);
                }
            });
            //确认按钮设置日期时间
            boxCell.find(".jedatebot .jedateok").on("click", function (ev) {
                ev.stopPropagation();
                var isValtext = (elemCell.val() || elemCell.text()) != "",
                    isYYYY = jet.checkFormat(jet.format) == "YYYY",
                    okVal = "",

                //获取时分秒的数组
                eachhmsem = function () {
                    var hmsArr = [];
                    boxCell.find(".jedatehms input").each(function () {
                        hmsArr.push($(this).val());
                    });
                    return hmsArr;
                };
                var minArr = jet.minDate.match(ymdMacth),
                    minNum = minArr[0] + minArr[1] + minArr[2],
                    maxArr = jet.maxDate.match(ymdMacth),
                    maxNum = maxArr[0] + maxArr[1] + maxArr[2];
                if (isValtext) {
                    var btnokVal = jet.isValHtml(elemCell) ? elemCell.val() : elemCell.text(),
                        oktms = btnokVal.match(ymdMacth);
                    if (!isYYMM) {
                        var okTimeArr = eachhmsem(),
                            okTime = [parseInt(jedateyear.attr("year")), parseInt(jedatemonth.attr("month")), oktms[2]],
                            okTimeNum = okTime[0] + okTime[1] + okTime[2];
                        //判断获取到的日期是否在有效期内
                        var isokTime = parseInt(okTimeNum) >= parseInt(minNum) && parseInt(okTimeNum) <= parseInt(maxNum) ? true : false;
                        okVal = isValtext && isokTime ? jet.parse([okTime[0], okTime[1], okTime[2]], [okTimeArr[0], okTimeArr[1], okTimeArr[2]], jet.format) : jet.parse([oktms[0], oktms[1], oktms[2]], [okTimeArr[0], okTimeArr[1], okTimeArr[2]], jet.format);
                        if (!ishhmmss) that.createDaysHtml(okTime[0], okTime[1], opts);
                        that.chooseDays(opts);
                    } else {
                        var ymactCls = isYYYY ? boxCell.find(".jedayy .action") : boxCell.find(".jedaym .action");
                        //判断是否为（YYYY或YYYY-MM）类型
                        if (isYYYY) {
                            var okDate = ymactCls ? ymactCls.attr("yy").match(ymdMacth) : oktms;
                            okVal = jet.parse([parseInt(okDate[0]), newDate.getMonth() + 1, 1], [0, 0, 0], jet.format);
                        } else {
                            var jedYM = ymactCls ? ymactCls.attr("ym").match(ymdMacth) : oktms;
                            okVal = jet.parse([parseInt(jedYM[0]), parseInt(jedYM[1]), 1], [0, 0, 0], jet.format);
                        }
                    }
                } else {
                    var okArr = eachhmsem(),
                        monthCls = boxCell.find(".jedateyearmonth")[0],
                        okDate = "";
                    //判断是否为时分秒(hh:mm:ss)类型
                    if (ishhmmss) {
                        okVal = jet.parse([tmsArr[0], tmsArr[1], tmsArr[2]], [okArr[0], okArr[1], okArr[2]], jet.format);
                    } else {
                        //判断是否为年月（YYYY或YYYY-MM）类型
                        if (isYYMM) {
                            okDate = jet.checkFormat(jet.format) == "YYYY" ? monthCls.attr("data-onyy").match(ymdMacth) : monthCls.attr("data-onym").match(ymdMacth);
                        } else {
                            okDate = [newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate()];
                        }
                        okVal = isYYYY ? jet.parse([parseInt(okDate[0]), newDate.getMonth(), 1], [0, 0, 0], jet.format) : jet.parse([parseInt(okDate[0]), parseInt(okDate[1]), newDate.getDate()], [okArr[0], okArr[1], okArr[2]], jet.format);
                    }
                }

                jet.isValHtml(elemCell) ? elemCell.val(okVal) : elemCell.text(okVal);
                that.dateClose();
                if ($.isFunction(opts.okfun) || opts.okfun != null) opts.okfun(jet.elemCell, okVal);
            });
            //点击空白处隐藏
            $(document).on("mouseup", function (ev) {
                ev.stopPropagation();
                var box = $(jet.boxCell);
                if (box && box.css("display") !== "none") box.remove();
            });
            $(jet.boxCell).on("mouseup", function (ev) {
                ev.stopPropagation();
            });
        };

        //日期控件版本
        $.dateVer = "3.7";
        //返回指定日期
        $.nowDate = function (num) {
            return jet.initDates(num);
        };
        //获取年月日星期
        $.getLunar = function (time) {
            if (/\YYYY-MM-DD/.test(jet.formatType)) {
                //如果为数字类型的日期对获取到日期的进行替换
                var nocharDate = time.substr(0, 4).replace(/^(\d{4})/g, "$1,") + time.substr(4).replace(/^(\d{2})(?=\d)/g, "$1,"),
                    warr = jet.IsNum(time) ? nocharDate.match(ymdMacth) : time.match(ymdMacth),
                    lunars = jeLunar(warr[0], warr[1] - 1, warr[2]);
                return {
                    nMonth: lunars.lnongMonth, //农历月
                    nDays: lunars.lnongDate, //农历日
                    yYear: parseInt(lunars.solarYear), //阳历年
                    yMonth: parseInt(lunars.solarMonth), //阳历月
                    yDays: parseInt(lunars.solarDate), //阳历日
                    cWeek: lunars.inWeekDays, //汉字星期几
                    nWeek: lunars.solarWeekDay //数字星期几
                };
            }
        };
        //为当前获取到的日期加减天数，这里只能控制到天数，不能控制时分秒加减
        $.addDate = function (time, num, type) {
            num = num | 0;type = type || "DD";
            return jet.addDateTime(time, num, type, jet.format);
        };
        return jeDate;
    });
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
//农历数据
;(function (root, factory) {
    root.jeLunar = factory(root.jeLunar);
})(this, function (jeLunar) {
    var lunarInfo = [19416, 19168, 42352, 21717, 53856, 55632, 91476, 22176, 39632, 21970, 19168, 42422, 42192, 53840, 119381, 46400, 54944, 44450, 38320, 84343, 18800, 42160, 46261, 27216, 27968, 109396, 11104, 38256, 21234, 18800, 25958, 54432, 59984, 28309, 23248, 11104, 100067, 37600, 116951, 51536, 54432, 120998, 46416, 22176, 107956, 9680, 37584, 53938, 43344, 46423, 27808, 46416, 86869, 19872, 42448, 83315, 21200, 43432, 59728, 27296, 44710, 43856, 19296, 43748, 42352, 21088, 62051, 55632, 23383, 22176, 38608, 19925, 19152, 42192, 54484, 53840, 54616, 46400, 46496, 103846, 38320, 18864, 43380, 42160, 45690, 27216, 27968, 44870, 43872, 38256, 19189, 18800, 25776, 29859, 59984, 27480, 21952, 43872, 38613, 37600, 51552, 55636, 54432, 55888, 30034, 22176, 43959, 9680, 37584, 51893, 43344, 46240, 47780, 44368, 21977, 19360, 42416, 86390, 21168, 43312, 31060, 27296, 44368, 23378, 19296, 42726, 42208, 53856, 60005, 54576, 23200, 30371, 38608, 19415, 19152, 42192, 118966, 53840, 54560, 56645, 46496, 22224, 21938, 18864, 42359, 42160, 43600, 111189, 27936, 44448],
        sTermInfo = [0, 21208, 43467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];
    var Gan = "甲乙丙丁戊己庚辛壬癸",
        Zhi = "子丑寅卯辰巳午未申酉戌亥",
        Animals = "鼠牛虎兔龙蛇马羊猴鸡狗猪";
    var solarTerm = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
    var nStr1 = "日一二三四五六七八九十",
        nStr2 = "初十廿卅",
        nStr3 = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "腊"],
        sFtv1 = {
        "0101": "*1元旦节", "0202": "湿地日",
        "0214": "情人节", "0308": "妇女节",
        "0312": "植树节", "0315": "消费者权益日",
        "0401": "愚人节", "0422": "地球日",
        "0501": "*1劳动节", "0504": "青年节",
        "0512": "护士节", "0518": "博物馆日",
        "0520": "母亲节", "0601": "儿童节",
        "0623": "奥林匹克日", "0630": "父亲节",
        "0701": "建党节", "0801": "建军节",
        "0903": "抗战胜利日", "0910": "教师节",
        "1001": "*3国庆节", "1201": "艾滋病日",
        "1224": "平安夜", "1225": "圣诞节"
    },
        sFtv2 = {
        "0100": "除夕", "0101": "*2春节",
        "0115": "元宵节", "0505": "*1端午节",
        "0707": "七夕节", "0715": "中元节",
        "0815": "*1中秋节", "0909": "*1重阳节",
        "1015": "下元节", "1208": "腊八节",
        "1223": "小年"

    };
    function flunar(Y) {
        var sTerm = function (j, i) {
            var h = new Date(31556925974.7 * (j - 1900) + sTermInfo[i] * 60000 + Date.UTC(1900, 0, 6, 2, 5));
            return h.getUTCDate();
        },
            d = function (k) {
            var h,
                j = 348;
            for (h = 32768; h > 8; h >>= 1) {
                j += lunarInfo[k - 1900] & h ? 1 : 0;
            }
            return j + b(k);
        },
            ymdCyl = function (h) {
            return Gan.charAt(h % 10) + Zhi.charAt(h % 12);
        },
            b = function (h) {
            var islp = g(h) ? lunarInfo[h - 1900] & 65536 ? 30 : 29 : 0;
            return islp;
        },
            g = function (h) {
            return lunarInfo[h - 1900] & 15;
        },
            e = function (i, h) {
            return lunarInfo[i - 1900] & 65536 >> h ? 30 : 29;
        },
            newymd = function (m) {
            var k,
                j = 0,
                h = 0,
                l = new Date(1900, 0, 31),
                n = (m - l) / 86400000;
            this.dayCyl = n + 40;
            this.monCyl = 14;
            for (k = 1900; k < 2050 && n > 0; k++) {
                h = d(k);n -= h;
                this.monCyl += 12;
            }
            if (n < 0) {
                n += h;k--;
                this.monCyl -= 12;
            }
            this.year = k;
            this.yearCyl = k - 1864;
            j = g(k);
            this.isLeap = false;
            for (k = 1; k < 13 && n > 0; k++) {
                if (j > 0 && k == j + 1 && this.isLeap == false) {
                    --k;
                    this.isLeap = true;
                    h = b(this.year);
                } else {
                    h = e(this.year, k);
                }
                if (this.isLeap == true && k == j + 1) {
                    this.isLeap = false;
                }
                n -= h;
                if (this.isLeap == false) this.monCyl++;
            }
            if (n == 0 && j > 0 && k == j + 1) {
                if (this.isLeap) {
                    this.isLeap = false;
                } else {
                    this.isLeap = true;
                    --k;
                    --this.monCyl;
                }
            }
            if (n < 0) {
                n += h;--k;
                --this.monCyl;
            }
            this.month = k;
            this.day = n + 1;
        },
            digit = function (num) {
            return num < 10 ? "0" + (num | 0) : num;
        },
            reymd = function (i, j) {
            var h = i;
            return j.replace(/dd?d?d?|MM?M?M?|yy?y?y?/g, function (k) {
                switch (k) {
                    case "yyyy":
                        var l = "000" + h.getFullYear();
                        return l.substring(l.length - 4);
                    case "dd":
                        return digit(h.getDate());
                    case "d":
                        return h.getDate().toString();
                    case "MM":
                        return digit(h.getMonth() + 1);
                    case "M":
                        return h.getMonth() + 1;
                }
            });
        },
            lunarMD = function (i, h) {
            var j;
            switch (i, h) {
                case 10:
                    j = "初十";break;
                case 20:
                    j = "二十";break;
                case 30:
                    j = "三十";break;
                default:
                    j = nStr2.charAt(Math.floor(h / 10));
                    j += nStr1.charAt(h % 10);
            }
            return j;
        };
        this.isToday = false;
        this.isRestDay = false;
        this.solarYear = reymd(Y, "yyyy");
        this.solarMonth = reymd(Y, "M");
        this.solarDate = reymd(Y, "d");
        this.solarWeekDay = Y.getDay();
        this.inWeekDays = "星期" + nStr1.charAt(this.solarWeekDay);
        var X = new newymd(Y);
        this.lunarYear = X.year;
        this.shengxiao = Animals.charAt((this.lunarYear - 4) % 12);
        this.lunarMonth = X.month;
        this.lunarIsLeapMonth = X.isLeap;
        this.lnongMonth = this.lunarIsLeapMonth ? "闰" + nStr3[X.month - 1] : nStr3[X.month - 1];
        this.lunarDate = X.day;
        this.showInLunar = this.lnongDate = lunarMD(this.lunarMonth, this.lunarDate);
        if (this.lunarDate == 1) {
            this.showInLunar = this.lnongMonth + "月";
        }
        this.ganzhiYear = ymdCyl(X.yearCyl);
        this.ganzhiMonth = ymdCyl(X.monCyl);
        this.ganzhiDate = ymdCyl(X.dayCyl++);
        this.jieqi = "";
        this.restDays = 0;
        if (sTerm(this.solarYear, (this.solarMonth - 1) * 2) == reymd(Y, "d")) {
            this.showInLunar = this.jieqi = solarTerm[(this.solarMonth - 1) * 2];
        }
        if (sTerm(this.solarYear, (this.solarMonth - 1) * 2 + 1) == reymd(Y, "d")) {
            this.showInLunar = this.jieqi = solarTerm[(this.solarMonth - 1) * 2 + 1];
        }
        if (this.showInLunar == "清明") {
            this.showInLunar = "清明节";
            this.restDays = 1;
        }
        this.solarFestival = sFtv1[reymd(Y, "MM") + reymd(Y, "dd")];
        if (typeof this.solarFestival == "undefined") {
            this.solarFestival = "";
        } else {
            if (/\*(\d)/.test(this.solarFestival)) {
                this.restDays = parseInt(RegExp.$1);
                this.solarFestival = this.solarFestival.replace(/\*\d/, "");
            }
        }
        this.showInLunar = this.solarFestival == "" ? this.showInLunar : this.solarFestival;
        this.lunarFestival = sFtv2[this.lunarIsLeapMonth ? "00" : digit(this.lunarMonth) + digit(this.lunarDate)];
        if (typeof this.lunarFestival == "undefined") {
            this.lunarFestival = "";
        } else {
            if (/\*(\d)/.test(this.lunarFestival)) {
                this.restDays = this.restDays > parseInt(RegExp.$1) ? this.restDays : parseInt(RegExp.$1);
                this.lunarFestival = this.lunarFestival.replace(/\*\d/, "");
            }
        }
        if (this.lunarMonth == 12 && this.lunarDate == e(this.lunarYear, 12)) {
            this.lunarFestival = sFtv2["0100"];
            this.restDays = 1;
        }
        this.showInLunar = this.lunarFestival == "" ? this.showInLunar : this.lunarFestival;
    }
    var jeLunar = function (y, m, d) {
        return new flunar(new Date(y, m, d));
    };
    return jeLunar;
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(1)))

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * jQuery File Upload Plugin
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global define, require, window, document, location, Blob, FormData */

;(function (factory) {
    'use strict';

    if (true) {
        // Register as an anonymous AMD module:
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1), __webpack_require__(35)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports === 'object') {
        // Node/CommonJS:
        factory(require('jquery')
        //require('./vendor/jquery.ui.widget')
        );
    } else {
        // Browser globals:
        factory(window.jQuery);
    }
})(function ($) {
    'use strict';

    // Detect file input support, based on
    // http://viljamis.com/blog/2012/file-upload-support-on-mobile/

    $.support.fileInput = !(new RegExp(
    // Handle devices which give false positives for the feature detection:
    '(Android (1\\.[0156]|2\\.[01]))' + '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' + '|(w(eb)?OSBrowser)|(webOS)' + '|(Kindle/(1\\.0|2\\.[05]|3\\.0))').test(window.navigator.userAgent) ||
    // Feature detection for all other devices:
    $('<input type="file">').prop('disabled'));

    // The FileReader API is not actually used, but works as feature detection,
    // as some Safari versions (5?) support XHR file uploads via the FormData API,
    // but not non-multipart XHR file uploads.
    // window.XMLHttpRequestUpload is not available on IE10, so we check for
    // window.ProgressEvent instead to detect XHR2 file upload capability:
    $.support.xhrFileUpload = !!(window.ProgressEvent && window.FileReader);
    $.support.xhrFormDataFileUpload = !!window.FormData;

    // Detect support for Blob slicing (required for chunked uploads):
    $.support.blobSlice = window.Blob && (Blob.prototype.slice || Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    // Helper function to create drag handlers for dragover/dragenter/dragleave:
    function getDragHandler(type) {
        var isDragOver = type === 'dragover';
        return function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var dataTransfer = e.dataTransfer;
            if (dataTransfer && $.inArray('Files', dataTransfer.types) !== -1 && this._trigger(type, $.Event(type, { delegatedEvent: e })) !== false) {
                e.preventDefault();
                if (isDragOver) {
                    dataTransfer.dropEffect = 'copy';
                }
            }
        };
    }

    // The fileupload widget listens for change events on file input fields defined
    // via fileInput setting and paste or drop events of the given dropZone.
    // In addition to the default jQuery Widget methods, the fileupload widget
    // exposes the "add" and "send" methods, to add or directly send files using
    // the fileupload API.
    // By default, files added via file input selection, paste, drag & drop or
    // "add" method are uploaded immediately, but it is possible to override
    // the "add" callback option to queue file uploads.
    $.widget('blueimp.fileupload', {

        options: {
            // The drop target element(s), by the default the complete document.
            // Set to null to disable drag & drop support:
            dropZone: $(document),
            // The paste target element(s), by the default undefined.
            // Set to a DOM node or jQuery object to enable file pasting:
            pasteZone: undefined,
            // The file input field(s), that are listened to for change events.
            // If undefined, it is set to the file input fields inside
            // of the widget element on plugin initialization.
            // Set to null to disable the change listener.
            fileInput: undefined,
            // By default, the file input field is replaced with a clone after
            // each input field change event. This is required for iframe transport
            // queues and allows change events to be fired for the same file
            // selection, but can be disabled by setting the following option to false:
            replaceFileInput: true,
            // The parameter name for the file form data (the request argument name).
            // If undefined or empty, the name property of the file input field is
            // used, or "files[]" if the file input name property is also empty,
            // can be a string or an array of strings:
            paramName: undefined,
            // By default, each file of a selection is uploaded using an individual
            // request for XHR type uploads. Set to false to upload file
            // selections in one request each:
            singleFileUploads: true,
            // To limit the number of files uploaded with one XHR request,
            // set the following option to an integer greater than 0:
            limitMultiFileUploads: undefined,
            // The following option limits the number of files uploaded with one
            // XHR request to keep the request size under or equal to the defined
            // limit in bytes:
            limitMultiFileUploadSize: undefined,
            // Multipart file uploads add a number of bytes to each uploaded file,
            // therefore the following option adds an overhead for each file used
            // in the limitMultiFileUploadSize configuration:
            limitMultiFileUploadSizeOverhead: 512,
            // Set the following option to true to issue all file upload requests
            // in a sequential order:
            sequentialUploads: false,
            // To limit the number of concurrent uploads,
            // set the following option to an integer greater than 0:
            limitConcurrentUploads: undefined,
            // Set the following option to true to force iframe transport uploads:
            forceIframeTransport: false,
            // Set the following option to the location of a redirect url on the
            // origin server, for cross-domain iframe transport uploads:
            redirect: undefined,
            // The parameter name for the redirect url, sent as part of the form
            // data and set to 'redirect' if this option is empty:
            redirectParamName: undefined,
            // Set the following option to the location of a postMessage window,
            // to enable postMessage transport uploads:
            postMessage: undefined,
            // By default, XHR file uploads are sent as multipart/form-data.
            // The iframe transport is always using multipart/form-data.
            // Set to false to enable non-multipart XHR uploads:
            multipart: true,
            // To upload large files in smaller chunks, set the following option
            // to a preferred maximum chunk size. If set to 0, null or undefined,
            // or the browser does not support the required Blob API, files will
            // be uploaded as a whole.
            maxChunkSize: undefined,
            // When a non-multipart upload or a chunked multipart upload has been
            // aborted, this option can be used to resume the upload by setting
            // it to the size of the already uploaded bytes. This option is most
            // useful when modifying the options object inside of the "add" or
            // "send" callbacks, as the options are cloned for each file upload.
            uploadedBytes: undefined,
            // By default, failed (abort or error) file uploads are removed from the
            // global progress calculation. Set the following option to false to
            // prevent recalculating the global progress data:
            recalculateProgress: true,
            // Interval in milliseconds to calculate and trigger progress events:
            progressInterval: 100,
            // Interval in milliseconds to calculate progress bitrate:
            bitrateInterval: 500,
            // By default, uploads are started automatically when adding files:
            autoUpload: true,

            // Error and info messages:
            messages: {
                uploadedBytes: 'Uploaded bytes exceed file size'
            },

            // Translation function, gets the message key to be translated
            // and an object with context specific data as arguments:
            i18n: function (message, context) {
                message = this.messages[message] || message.toString();
                if (context) {
                    $.each(context, function (key, value) {
                        message = message.replace('{' + key + '}', value);
                    });
                }
                return message;
            },

            // Additional form data to be sent along with the file uploads can be set
            // using this option, which accepts an array of objects with name and
            // value properties, a function returning such an array, a FormData
            // object (for XHR file uploads), or a simple object.
            // The form of the first fileInput is given as parameter to the function:
            formData: function (form) {
                return form.serializeArray();
            },

            // The add callback is invoked as soon as files are added to the fileupload
            // widget (via file input selection, drag & drop, paste or add API call).
            // If the singleFileUploads option is enabled, this callback will be
            // called once for each file in the selection for XHR file uploads, else
            // once for each file selection.
            //
            // The upload starts when the submit method is invoked on the data parameter.
            // The data object contains a files property holding the added files
            // and allows you to override plugin options as well as define ajax settings.
            //
            // Listeners for this callback can also be bound the following way:
            // .bind('fileuploadadd', func);
            //
            // data.submit() returns a Promise object and allows to attach additional
            // handlers using jQuery's Deferred callbacks:
            // data.submit().done(func).fail(func).always(func);
            add: function (e, data) {
                if (e.isDefaultPrevented()) {
                    return false;
                }
                if (data.autoUpload || data.autoUpload !== false && $(this).fileupload('option', 'autoUpload')) {
                    data.process().done(function () {
                        data.submit();
                    });
                }
            },

            // Other callbacks:

            // Callback for the submit event of each file upload:
            // submit: function (e, data) {}, // .bind('fileuploadsubmit', func);

            // Callback for the start of each file upload request:
            // send: function (e, data) {}, // .bind('fileuploadsend', func);

            // Callback for successful uploads:
            // done: function (e, data) {}, // .bind('fileuploaddone', func);

            // Callback for failed (abort or error) uploads:
            // fail: function (e, data) {}, // .bind('fileuploadfail', func);

            // Callback for completed (success, abort or error) requests:
            // always: function (e, data) {}, // .bind('fileuploadalways', func);

            // Callback for upload progress events:
            // progress: function (e, data) {}, // .bind('fileuploadprogress', func);

            // Callback for global upload progress events:
            // progressall: function (e, data) {}, // .bind('fileuploadprogressall', func);

            // Callback for uploads start, equivalent to the global ajaxStart event:
            // start: function (e) {}, // .bind('fileuploadstart', func);

            // Callback for uploads stop, equivalent to the global ajaxStop event:
            // stop: function (e) {}, // .bind('fileuploadstop', func);

            // Callback for change events of the fileInput(s):
            // change: function (e, data) {}, // .bind('fileuploadchange', func);

            // Callback for paste events to the pasteZone(s):
            // paste: function (e, data) {}, // .bind('fileuploadpaste', func);

            // Callback for drop events of the dropZone(s):
            // drop: function (e, data) {}, // .bind('fileuploaddrop', func);

            // Callback for dragover events of the dropZone(s):
            // dragover: function (e) {}, // .bind('fileuploaddragover', func);

            // Callback for the start of each chunk upload request:
            // chunksend: function (e, data) {}, // .bind('fileuploadchunksend', func);

            // Callback for successful chunk uploads:
            // chunkdone: function (e, data) {}, // .bind('fileuploadchunkdone', func);

            // Callback for failed (abort or error) chunk uploads:
            // chunkfail: function (e, data) {}, // .bind('fileuploadchunkfail', func);

            // Callback for completed (success, abort or error) chunk upload requests:
            // chunkalways: function (e, data) {}, // .bind('fileuploadchunkalways', func);

            // The plugin options are used as settings object for the ajax calls.
            // The following are jQuery ajax settings required for the file uploads:
            processData: false,
            contentType: false,
            cache: false,
            timeout: 0
        },

        // A list of options that require reinitializing event listeners and/or
        // special initialization code:
        _specialOptions: ['fileInput', 'dropZone', 'pasteZone', 'multipart', 'forceIframeTransport'],

        _blobSlice: $.support.blobSlice && function () {
            var slice = this.slice || this.webkitSlice || this.mozSlice;
            return slice.apply(this, arguments);
        },

        _BitrateTimer: function () {
            this.timestamp = Date.now ? Date.now() : new Date().getTime();
            this.loaded = 0;
            this.bitrate = 0;
            this.getBitrate = function (now, loaded, interval) {
                var timeDiff = now - this.timestamp;
                if (!this.bitrate || !interval || timeDiff > interval) {
                    this.bitrate = (loaded - this.loaded) * (1000 / timeDiff) * 8;
                    this.loaded = loaded;
                    this.timestamp = now;
                }
                return this.bitrate;
            };
        },

        _isXHRUpload: function (options) {
            return !options.forceIframeTransport && (!options.multipart && $.support.xhrFileUpload || $.support.xhrFormDataFileUpload);
        },

        _getFormData: function (options) {
            var formData;
            if ($.type(options.formData) === 'function') {
                return options.formData(options.form);
            }
            if ($.isArray(options.formData)) {
                return options.formData;
            }
            if ($.type(options.formData) === 'object') {
                formData = [];
                $.each(options.formData, function (name, value) {
                    formData.push({ name: name, value: value });
                });
                return formData;
            }
            return [];
        },

        _getTotal: function (files) {
            var total = 0;
            $.each(files, function (index, file) {
                total += file.size || 1;
            });
            return total;
        },

        _initProgressObject: function (obj) {
            var progress = {
                loaded: 0,
                total: 0,
                bitrate: 0
            };
            if (obj._progress) {
                $.extend(obj._progress, progress);
            } else {
                obj._progress = progress;
            }
        },

        _initResponseObject: function (obj) {
            var prop;
            if (obj._response) {
                for (prop in obj._response) {
                    if (obj._response.hasOwnProperty(prop)) {
                        delete obj._response[prop];
                    }
                }
            } else {
                obj._response = {};
            }
        },

        _onProgress: function (e, data) {
            if (e.lengthComputable) {
                var now = Date.now ? Date.now() : new Date().getTime(),
                    loaded;
                if (data._time && data.progressInterval && now - data._time < data.progressInterval && e.loaded !== e.total) {
                    return;
                }
                data._time = now;
                loaded = Math.floor(e.loaded / e.total * (data.chunkSize || data._progress.total)) + (data.uploadedBytes || 0);
                // Add the difference from the previously loaded state
                // to the global loaded counter:
                this._progress.loaded += loaded - data._progress.loaded;
                this._progress.bitrate = this._bitrateTimer.getBitrate(now, this._progress.loaded, data.bitrateInterval);
                data._progress.loaded = data.loaded = loaded;
                data._progress.bitrate = data.bitrate = data._bitrateTimer.getBitrate(now, loaded, data.bitrateInterval);
                // Trigger a custom progress event with a total data property set
                // to the file size(s) of the current upload and a loaded data
                // property calculated accordingly:
                this._trigger('progress', $.Event('progress', { delegatedEvent: e }), data);
                // Trigger a global progress event for all current file uploads,
                // including ajax calls queued for sequential file uploads:
                this._trigger('progressall', $.Event('progressall', { delegatedEvent: e }), this._progress);
            }
        },

        _initProgressListener: function (options) {
            var that = this,
                xhr = options.xhr ? options.xhr() : $.ajaxSettings.xhr();
            // Accesss to the native XHR object is required to add event listeners
            // for the upload progress event:
            if (xhr.upload) {
                $(xhr.upload).bind('progress', function (e) {
                    var oe = e.originalEvent;
                    // Make sure the progress event properties get copied over:
                    e.lengthComputable = oe.lengthComputable;
                    e.loaded = oe.loaded;
                    e.total = oe.total;
                    that._onProgress(e, options);
                });
                options.xhr = function () {
                    return xhr;
                };
            }
        },

        _isInstanceOf: function (type, obj) {
            // Cross-frame instanceof check
            return Object.prototype.toString.call(obj) === '[object ' + type + ']';
        },

        _initXHRData: function (options) {
            var that = this,
                formData,
                file = options.files[0],

            // Ignore non-multipart setting if not supported:
            multipart = options.multipart || !$.support.xhrFileUpload,
                paramName = $.type(options.paramName) === 'array' ? options.paramName[0] : options.paramName;
            options.headers = $.extend({}, options.headers);
            if (options.contentRange) {
                options.headers['Content-Range'] = options.contentRange;
            }
            if (!multipart || options.blob || !this._isInstanceOf('File', file)) {
                options.headers['Content-Disposition'] = 'attachment; filename="' + encodeURI(file.name) + '"';
            }
            if (!multipart) {
                options.contentType = file.type || 'application/octet-stream';
                options.data = options.blob || file;
            } else if ($.support.xhrFormDataFileUpload) {
                if (options.postMessage) {
                    // window.postMessage does not allow sending FormData
                    // objects, so we just add the File/Blob objects to
                    // the formData array and let the postMessage window
                    // create the FormData object out of this array:
                    formData = this._getFormData(options);
                    if (options.blob) {
                        formData.push({
                            name: paramName,
                            value: options.blob
                        });
                    } else {
                        $.each(options.files, function (index, file) {
                            formData.push({
                                name: $.type(options.paramName) === 'array' && options.paramName[index] || paramName,
                                value: file
                            });
                        });
                    }
                } else {
                    if (that._isInstanceOf('FormData', options.formData)) {
                        formData = options.formData;
                    } else {
                        formData = new FormData();
                        $.each(this._getFormData(options), function (index, field) {
                            formData.append(field.name, field.value);
                        });
                    }
                    if (options.blob) {
                        formData.append(paramName, options.blob, file.name);
                    } else {
                        $.each(options.files, function (index, file) {
                            // This check allows the tests to run with
                            // dummy objects:
                            if (that._isInstanceOf('File', file) || that._isInstanceOf('Blob', file)) {
                                formData.append($.type(options.paramName) === 'array' && options.paramName[index] || paramName, file, file.uploadName || file.name);
                            }
                        });
                    }
                }
                options.data = formData;
            }
            // Blob reference is not needed anymore, free memory:
            options.blob = null;
        },

        _initIframeSettings: function (options) {
            var targetHost = $('<a></a>').prop('href', options.url).prop('host');
            // Setting the dataType to iframe enables the iframe transport:
            options.dataType = 'iframe ' + (options.dataType || '');
            // The iframe transport accepts a serialized array as form data:
            options.formData = this._getFormData(options);
            // Add redirect url to form data on cross-domain uploads:
            if (options.redirect && targetHost && targetHost !== location.host) {
                options.formData.push({
                    name: options.redirectParamName || 'redirect',
                    value: options.redirect
                });
            }
        },

        _initDataSettings: function (options) {
            if (this._isXHRUpload(options)) {
                if (!this._chunkedUpload(options, true)) {
                    if (!options.data) {
                        this._initXHRData(options);
                    }
                    this._initProgressListener(options);
                }
                if (options.postMessage) {
                    // Setting the dataType to postmessage enables the
                    // postMessage transport:
                    options.dataType = 'postmessage ' + (options.dataType || '');
                }
            } else {
                this._initIframeSettings(options);
            }
        },

        _getParamName: function (options) {
            var fileInput = $(options.fileInput),
                paramName = options.paramName;
            if (!paramName) {
                paramName = [];
                fileInput.each(function () {
                    var input = $(this),
                        name = input.prop('name') || 'files[]',
                        i = (input.prop('files') || [1]).length;
                    while (i) {
                        paramName.push(name);
                        i -= 1;
                    }
                });
                if (!paramName.length) {
                    paramName = [fileInput.prop('name') || 'files[]'];
                }
            } else if (!$.isArray(paramName)) {
                paramName = [paramName];
            }
            return paramName;
        },

        _initFormSettings: function (options) {
            // Retrieve missing options from the input field and the
            // associated form, if available:
            if (!options.form || !options.form.length) {
                options.form = $(options.fileInput.prop('form'));
                // If the given file input doesn't have an associated form,
                // use the default widget file input's form:
                if (!options.form.length) {
                    options.form = $(this.options.fileInput.prop('form'));
                }
            }
            options.paramName = this._getParamName(options);
            if (!options.url) {
                options.url = options.form.prop('action') || location.href;
            }
            // The HTTP request method must be "POST" or "PUT":
            options.type = (options.type || $.type(options.form.prop('method')) === 'string' && options.form.prop('method') || '').toUpperCase();
            if (options.type !== 'POST' && options.type !== 'PUT' && options.type !== 'PATCH') {
                options.type = 'POST';
            }
            if (!options.formAcceptCharset) {
                options.formAcceptCharset = options.form.attr('accept-charset');
            }
        },

        _getAJAXSettings: function (data) {
            var options = $.extend({}, this.options, data);
            this._initFormSettings(options);
            this._initDataSettings(options);
            return options;
        },

        // jQuery 1.6 doesn't provide .state(),
        // while jQuery 1.8+ removed .isRejected() and .isResolved():
        _getDeferredState: function (deferred) {
            if (deferred.state) {
                return deferred.state();
            }
            if (deferred.isResolved()) {
                return 'resolved';
            }
            if (deferred.isRejected()) {
                return 'rejected';
            }
            return 'pending';
        },

        // Maps jqXHR callbacks to the equivalent
        // methods of the given Promise object:
        _enhancePromise: function (promise) {
            promise.success = promise.done;
            promise.error = promise.fail;
            promise.complete = promise.always;
            return promise;
        },

        // Creates and returns a Promise object enhanced with
        // the jqXHR methods abort, success, error and complete:
        _getXHRPromise: function (resolveOrReject, context, args) {
            var dfd = $.Deferred(),
                promise = dfd.promise();
            context = context || this.options.context || promise;
            if (resolveOrReject === true) {
                dfd.resolveWith(context, args);
            } else if (resolveOrReject === false) {
                dfd.rejectWith(context, args);
            }
            promise.abort = dfd.promise;
            return this._enhancePromise(promise);
        },

        // Adds convenience methods to the data callback argument:
        _addConvenienceMethods: function (e, data) {
            var that = this,
                getPromise = function (args) {
                return $.Deferred().resolveWith(that, args).promise();
            };
            data.process = function (resolveFunc, rejectFunc) {
                if (resolveFunc || rejectFunc) {
                    data._processQueue = this._processQueue = (this._processQueue || getPromise([this])).then(function () {
                        if (data.errorThrown) {
                            return $.Deferred().rejectWith(that, [data]).promise();
                        }
                        return getPromise(arguments);
                    }).then(resolveFunc, rejectFunc);
                }
                return this._processQueue || getPromise([this]);
            };
            data.submit = function () {
                if (this.state() !== 'pending') {
                    data.jqXHR = this.jqXHR = that._trigger('submit', $.Event('submit', { delegatedEvent: e }), this) !== false && that._onSend(e, this);
                }
                return this.jqXHR || that._getXHRPromise();
            };
            data.abort = function () {
                if (this.jqXHR) {
                    return this.jqXHR.abort();
                }
                this.errorThrown = 'abort';
                that._trigger('fail', null, this);
                return that._getXHRPromise(false);
            };
            data.state = function () {
                if (this.jqXHR) {
                    return that._getDeferredState(this.jqXHR);
                }
                if (this._processQueue) {
                    return that._getDeferredState(this._processQueue);
                }
            };
            data.processing = function () {
                return !this.jqXHR && this._processQueue && that._getDeferredState(this._processQueue) === 'pending';
            };
            data.progress = function () {
                return this._progress;
            };
            data.response = function () {
                return this._response;
            };
        },

        // Parses the Range header from the server response
        // and returns the uploaded bytes:
        _getUploadedBytes: function (jqXHR) {
            var range = jqXHR.getResponseHeader('Range'),
                parts = range && range.split('-'),
                upperBytesPos = parts && parts.length > 1 && parseInt(parts[1], 10);
            return upperBytesPos && upperBytesPos + 1;
        },

        // Uploads a file in multiple, sequential requests
        // by splitting the file up in multiple blob chunks.
        // If the second parameter is true, only tests if the file
        // should be uploaded in chunks, but does not invoke any
        // upload requests:
        _chunkedUpload: function (options, testOnly) {
            options.uploadedBytes = options.uploadedBytes || 0;
            var that = this,
                file = options.files[0],
                fs = file.size,
                ub = options.uploadedBytes,
                mcs = options.maxChunkSize || fs,
                slice = this._blobSlice,
                dfd = $.Deferred(),
                promise = dfd.promise(),
                jqXHR,
                upload;
            if (!(this._isXHRUpload(options) && slice && (ub || mcs < fs)) || options.data) {
                return false;
            }
            if (testOnly) {
                return true;
            }
            if (ub >= fs) {
                file.error = options.i18n('uploadedBytes');
                return this._getXHRPromise(false, options.context, [null, 'error', file.error]);
            }
            // The chunk upload method:
            upload = function () {
                // Clone the options object for each chunk upload:
                var o = $.extend({}, options),
                    currentLoaded = o._progress.loaded;
                o.blob = slice.call(file, ub, ub + mcs, file.type);
                // Store the current chunk size, as the blob itself
                // will be dereferenced after data processing:
                o.chunkSize = o.blob.size;
                // Expose the chunk bytes position range:
                o.contentRange = 'bytes ' + ub + '-' + (ub + o.chunkSize - 1) + '/' + fs;
                // Process the upload data (the blob and potential form data):
                that._initXHRData(o);
                // Add progress listeners for this chunk upload:
                that._initProgressListener(o);
                jqXHR = (that._trigger('chunksend', null, o) !== false && $.ajax(o) || that._getXHRPromise(false, o.context)).done(function (result, textStatus, jqXHR) {
                    ub = that._getUploadedBytes(jqXHR) || ub + o.chunkSize;
                    // Create a progress event if no final progress event
                    // with loaded equaling total has been triggered
                    // for this chunk:
                    if (currentLoaded + o.chunkSize - o._progress.loaded) {
                        that._onProgress($.Event('progress', {
                            lengthComputable: true,
                            loaded: ub - o.uploadedBytes,
                            total: ub - o.uploadedBytes
                        }), o);
                    }
                    options.uploadedBytes = o.uploadedBytes = ub;
                    o.result = result;
                    o.textStatus = textStatus;
                    o.jqXHR = jqXHR;
                    that._trigger('chunkdone', null, o);
                    that._trigger('chunkalways', null, o);
                    if (ub < fs) {
                        // File upload not yet complete,
                        // continue with the next chunk:
                        upload();
                    } else {
                        dfd.resolveWith(o.context, [result, textStatus, jqXHR]);
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    o.jqXHR = jqXHR;
                    o.textStatus = textStatus;
                    o.errorThrown = errorThrown;
                    that._trigger('chunkfail', null, o);
                    that._trigger('chunkalways', null, o);
                    dfd.rejectWith(o.context, [jqXHR, textStatus, errorThrown]);
                });
            };
            this._enhancePromise(promise);
            promise.abort = function () {
                return jqXHR.abort();
            };
            upload();
            return promise;
        },

        _beforeSend: function (e, data) {
            if (this._active === 0) {
                // the start callback is triggered when an upload starts
                // and no other uploads are currently running,
                // equivalent to the global ajaxStart event:
                this._trigger('start');
                // Set timer for global bitrate progress calculation:
                this._bitrateTimer = new this._BitrateTimer();
                // Reset the global progress values:
                this._progress.loaded = this._progress.total = 0;
                this._progress.bitrate = 0;
            }
            // Make sure the container objects for the .response() and
            // .progress() methods on the data object are available
            // and reset to their initial state:
            this._initResponseObject(data);
            this._initProgressObject(data);
            data._progress.loaded = data.loaded = data.uploadedBytes || 0;
            data._progress.total = data.total = this._getTotal(data.files) || 1;
            data._progress.bitrate = data.bitrate = 0;
            this._active += 1;
            // Initialize the global progress values:
            this._progress.loaded += data.loaded;
            this._progress.total += data.total;
        },

        _onDone: function (result, textStatus, jqXHR, options) {
            var total = options._progress.total,
                response = options._response;
            if (options._progress.loaded < total) {
                // Create a progress event if no final progress event
                // with loaded equaling total has been triggered:
                this._onProgress($.Event('progress', {
                    lengthComputable: true,
                    loaded: total,
                    total: total
                }), options);
            }
            response.result = options.result = result;
            response.textStatus = options.textStatus = textStatus;
            response.jqXHR = options.jqXHR = jqXHR;
            this._trigger('done', null, options);
        },

        _onFail: function (jqXHR, textStatus, errorThrown, options) {
            var response = options._response;
            if (options.recalculateProgress) {
                // Remove the failed (error or abort) file upload from
                // the global progress calculation:
                this._progress.loaded -= options._progress.loaded;
                this._progress.total -= options._progress.total;
            }
            response.jqXHR = options.jqXHR = jqXHR;
            response.textStatus = options.textStatus = textStatus;
            response.errorThrown = options.errorThrown = errorThrown;
            this._trigger('fail', null, options);
        },

        _onAlways: function (jqXHRorResult, textStatus, jqXHRorError, options) {
            // jqXHRorResult, textStatus and jqXHRorError are added to the
            // options object via done and fail callbacks
            this._trigger('always', null, options);
        },

        _onSend: function (e, data) {
            if (!data.submit) {
                this._addConvenienceMethods(e, data);
            }
            var that = this,
                jqXHR,
                aborted,
                slot,
                pipe,
                options = that._getAJAXSettings(data),
                send = function () {
                that._sending += 1;
                // Set timer for bitrate progress calculation:
                options._bitrateTimer = new that._BitrateTimer();
                jqXHR = jqXHR || ((aborted || that._trigger('send', $.Event('send', { delegatedEvent: e }), options) === false) && that._getXHRPromise(false, options.context, aborted) || that._chunkedUpload(options) || $.ajax(options)).done(function (result, textStatus, jqXHR) {
                    that._onDone(result, textStatus, jqXHR, options);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    that._onFail(jqXHR, textStatus, errorThrown, options);
                }).always(function (jqXHRorResult, textStatus, jqXHRorError) {
                    that._onAlways(jqXHRorResult, textStatus, jqXHRorError, options);
                    that._sending -= 1;
                    that._active -= 1;
                    if (options.limitConcurrentUploads && options.limitConcurrentUploads > that._sending) {
                        // Start the next queued upload,
                        // that has not been aborted:
                        var nextSlot = that._slots.shift();
                        while (nextSlot) {
                            if (that._getDeferredState(nextSlot) === 'pending') {
                                nextSlot.resolve();
                                break;
                            }
                            nextSlot = that._slots.shift();
                        }
                    }
                    if (that._active === 0) {
                        // The stop callback is triggered when all uploads have
                        // been completed, equivalent to the global ajaxStop event:
                        that._trigger('stop');
                    }
                });
                return jqXHR;
            };
            this._beforeSend(e, options);
            if (this.options.sequentialUploads || this.options.limitConcurrentUploads && this.options.limitConcurrentUploads <= this._sending) {
                if (this.options.limitConcurrentUploads > 1) {
                    slot = $.Deferred();
                    this._slots.push(slot);
                    pipe = slot.then(send);
                } else {
                    this._sequence = this._sequence.then(send, send);
                    pipe = this._sequence;
                }
                // Return the piped Promise object, enhanced with an abort method,
                // which is delegated to the jqXHR object of the current upload,
                // and jqXHR callbacks mapped to the equivalent Promise methods:
                pipe.abort = function () {
                    aborted = [undefined, 'abort', 'abort'];
                    if (!jqXHR) {
                        if (slot) {
                            slot.rejectWith(options.context, aborted);
                        }
                        return send();
                    }
                    return jqXHR.abort();
                };
                return this._enhancePromise(pipe);
            }
            return send();
        },

        _onAdd: function (e, data) {
            var that = this,
                result = true,
                options = $.extend({}, this.options, data),
                files = data.files,
                filesLength = files.length,
                limit = options.limitMultiFileUploads,
                limitSize = options.limitMultiFileUploadSize,
                overhead = options.limitMultiFileUploadSizeOverhead,
                batchSize = 0,
                paramName = this._getParamName(options),
                paramNameSet,
                paramNameSlice,
                fileSet,
                i,
                j = 0;
            if (!filesLength) {
                return false;
            }
            if (limitSize && files[0].size === undefined) {
                limitSize = undefined;
            }
            if (!(options.singleFileUploads || limit || limitSize) || !this._isXHRUpload(options)) {
                fileSet = [files];
                paramNameSet = [paramName];
            } else if (!(options.singleFileUploads || limitSize) && limit) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i += limit) {
                    fileSet.push(files.slice(i, i + limit));
                    paramNameSlice = paramName.slice(i, i + limit);
                    if (!paramNameSlice.length) {
                        paramNameSlice = paramName;
                    }
                    paramNameSet.push(paramNameSlice);
                }
            } else if (!options.singleFileUploads && limitSize) {
                fileSet = [];
                paramNameSet = [];
                for (i = 0; i < filesLength; i = i + 1) {
                    batchSize += files[i].size + overhead;
                    if (i + 1 === filesLength || batchSize + files[i + 1].size + overhead > limitSize || limit && i + 1 - j >= limit) {
                        fileSet.push(files.slice(j, i + 1));
                        paramNameSlice = paramName.slice(j, i + 1);
                        if (!paramNameSlice.length) {
                            paramNameSlice = paramName;
                        }
                        paramNameSet.push(paramNameSlice);
                        j = i + 1;
                        batchSize = 0;
                    }
                }
            } else {
                paramNameSet = paramName;
            }
            data.originalFiles = files;
            $.each(fileSet || files, function (index, element) {
                var newData = $.extend({}, data);
                newData.files = fileSet ? element : [element];
                newData.paramName = paramNameSet[index];
                that._initResponseObject(newData);
                that._initProgressObject(newData);
                that._addConvenienceMethods(e, newData);
                result = that._trigger('add', $.Event('add', { delegatedEvent: e }), newData);
                return result;
            });
            return result;
        },

        _replaceFileInput: function (data) {
            var input = data.fileInput,
                inputClone = input.clone(true),
                restoreFocus = input.is(document.activeElement);
            // Add a reference for the new cloned file input to the data argument:
            data.fileInputClone = inputClone;
            $('<form></form>').append(inputClone)[0].reset();
            // Detaching allows to insert the fileInput on another form
            // without loosing the file input value:
            input.after(inputClone).detach();
            // If the fileInput had focus before it was detached,
            // restore focus to the inputClone.
            if (restoreFocus) {
                inputClone.focus();
            }
            // Avoid memory leaks with the detached file input:
            $.cleanData(input.unbind('remove'));
            // Replace the original file input element in the fileInput
            // elements set with the clone, which has been copied including
            // event handlers:
            this.options.fileInput = this.options.fileInput.map(function (i, el) {
                if (el === input[0]) {
                    return inputClone[0];
                }
                return el;
            });
            // If the widget has been initialized on the file input itself,
            // override this.element with the file input clone:
            if (input[0] === this.element[0]) {
                this.element = inputClone;
            }
        },

        _handleFileTreeEntry: function (entry, path) {
            var that = this,
                dfd = $.Deferred(),
                errorHandler = function (e) {
                if (e && !e.entry) {
                    e.entry = entry;
                }
                // Since $.when returns immediately if one
                // Deferred is rejected, we use resolve instead.
                // This allows valid files and invalid items
                // to be returned together in one set:
                dfd.resolve([e]);
            },
                successHandler = function (entries) {
                that._handleFileTreeEntries(entries, path + entry.name + '/').done(function (files) {
                    dfd.resolve(files);
                }).fail(errorHandler);
            },
                readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        successHandler(entries);
                    } else {
                        entries = entries.concat(results);
                        readEntries();
                    }
                }, errorHandler);
            },
                dirReader,
                entries = [];
            path = path || '';
            if (entry.isFile) {
                if (entry._file) {
                    // Workaround for Chrome bug #149735
                    entry._file.relativePath = path;
                    dfd.resolve(entry._file);
                } else {
                    entry.file(function (file) {
                        file.relativePath = path;
                        dfd.resolve(file);
                    }, errorHandler);
                }
            } else if (entry.isDirectory) {
                dirReader = entry.createReader();
                readEntries();
            } else {
                // Return an empy list for file system items
                // other than files or directories:
                dfd.resolve([]);
            }
            return dfd.promise();
        },

        _handleFileTreeEntries: function (entries, path) {
            var that = this;
            return $.when.apply($, $.map(entries, function (entry) {
                return that._handleFileTreeEntry(entry, path);
            })).then(function () {
                return Array.prototype.concat.apply([], arguments);
            });
        },

        _getDroppedFiles: function (dataTransfer) {
            dataTransfer = dataTransfer || {};
            var items = dataTransfer.items;
            if (items && items.length && (items[0].webkitGetAsEntry || items[0].getAsEntry)) {
                return this._handleFileTreeEntries($.map(items, function (item) {
                    var entry;
                    if (item.webkitGetAsEntry) {
                        entry = item.webkitGetAsEntry();
                        if (entry) {
                            // Workaround for Chrome bug #149735:
                            entry._file = item.getAsFile();
                        }
                        return entry;
                    }
                    return item.getAsEntry();
                }));
            }
            return $.Deferred().resolve($.makeArray(dataTransfer.files)).promise();
        },

        _getSingleFileInputFiles: function (fileInput) {
            fileInput = $(fileInput);
            var entries = fileInput.prop('webkitEntries') || fileInput.prop('entries'),
                files,
                value;
            if (entries && entries.length) {
                return this._handleFileTreeEntries(entries);
            }
            files = $.makeArray(fileInput.prop('files'));
            if (!files.length) {
                value = fileInput.prop('value');
                if (!value) {
                    return $.Deferred().resolve([]).promise();
                }
                // If the files property is not available, the browser does not
                // support the File API and we add a pseudo File object with
                // the input value as name with path information removed:
                files = [{ name: value.replace(/^.*\\/, '') }];
            } else if (files[0].name === undefined && files[0].fileName) {
                // File normalization for Safari 4 and Firefox 3:
                $.each(files, function (index, file) {
                    file.name = file.fileName;
                    file.size = file.fileSize;
                });
            }
            return $.Deferred().resolve(files).promise();
        },

        _getFileInputFiles: function (fileInput) {
            if (!(fileInput instanceof $) || fileInput.length === 1) {
                return this._getSingleFileInputFiles(fileInput);
            }
            return $.when.apply($, $.map(fileInput, this._getSingleFileInputFiles)).then(function () {
                return Array.prototype.concat.apply([], arguments);
            });
        },

        _onChange: function (e) {
            var that = this,
                data = {
                fileInput: $(e.target),
                form: $(e.target.form)
            };
            this._getFileInputFiles(data.fileInput).always(function (files) {
                data.files = files;
                if (that.options.replaceFileInput) {
                    that._replaceFileInput(data);
                }
                if (that._trigger('change', $.Event('change', { delegatedEvent: e }), data) !== false) {
                    that._onAdd(e, data);
                }
            });
        },

        _onPaste: function (e) {
            var items = e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.items,
                data = { files: [] };
            if (items && items.length) {
                $.each(items, function (index, item) {
                    var file = item.getAsFile && item.getAsFile();
                    if (file) {
                        data.files.push(file);
                    }
                });
                if (this._trigger('paste', $.Event('paste', { delegatedEvent: e }), data) !== false) {
                    this._onAdd(e, data);
                }
            }
        },

        _onDrop: function (e) {
            e.dataTransfer = e.originalEvent && e.originalEvent.dataTransfer;
            var that = this,
                dataTransfer = e.dataTransfer,
                data = {};
            if (dataTransfer && dataTransfer.files && dataTransfer.files.length) {
                e.preventDefault();
                this._getDroppedFiles(dataTransfer).always(function (files) {
                    data.files = files;
                    if (that._trigger('drop', $.Event('drop', { delegatedEvent: e }), data) !== false) {
                        that._onAdd(e, data);
                    }
                });
            }
        },

        _onDragOver: getDragHandler('dragover'),

        _onDragEnter: getDragHandler('dragenter'),

        _onDragLeave: getDragHandler('dragleave'),

        _initEventHandlers: function () {
            if (this._isXHRUpload(this.options)) {
                this._on(this.options.dropZone, {
                    dragover: this._onDragOver,
                    drop: this._onDrop,
                    // event.preventDefault() on dragenter is required for IE10+:
                    dragenter: this._onDragEnter,
                    // dragleave is not required, but added for completeness:
                    dragleave: this._onDragLeave
                });
                this._on(this.options.pasteZone, {
                    paste: this._onPaste
                });
            }
            if ($.support.fileInput) {
                this._on(this.options.fileInput, {
                    change: this._onChange
                });
            }
        },

        _destroyEventHandlers: function () {
            this._off(this.options.dropZone, 'dragenter dragleave dragover drop');
            this._off(this.options.pasteZone, 'paste');
            this._off(this.options.fileInput, 'change');
        },

        _setOption: function (key, value) {
            var reinit = $.inArray(key, this._specialOptions) !== -1;
            if (reinit) {
                this._destroyEventHandlers();
            }
            this._super(key, value);
            if (reinit) {
                this._initSpecialOptions();
                this._initEventHandlers();
            }
        },

        _initSpecialOptions: function () {
            var options = this.options;
            if (options.fileInput === undefined) {
                options.fileInput = this.element.is('input[type="file"]') ? this.element : this.element.find('input[type="file"]');
            } else if (!(options.fileInput instanceof $)) {
                options.fileInput = $(options.fileInput);
            }
            if (!(options.dropZone instanceof $)) {
                options.dropZone = $(options.dropZone);
            }
            if (!(options.pasteZone instanceof $)) {
                options.pasteZone = $(options.pasteZone);
            }
        },

        _getRegExp: function (str) {
            var parts = str.split('/'),
                modifiers = parts.pop();
            parts.shift();
            return new RegExp(parts.join('/'), modifiers);
        },

        _isRegExpOption: function (key, value) {
            return key !== 'url' && $.type(value) === 'string' && /^\/.*\/[igm]{0,3}$/.test(value);
        },

        _initDataAttributes: function () {
            var that = this,
                options = this.options,
                data = this.element.data();
            // Initialize options set via HTML5 data-attributes:
            $.each(this.element[0].attributes, function (index, attr) {
                var key = attr.name.toLowerCase(),
                    value;
                if (/^data-/.test(key)) {
                    // Convert hyphen-ated key to camelCase:
                    key = key.slice(5).replace(/-[a-z]/g, function (str) {
                        return str.charAt(1).toUpperCase();
                    });
                    value = data[key];
                    if (that._isRegExpOption(key, value)) {
                        value = that._getRegExp(value);
                    }
                    options[key] = value;
                }
            });
        },

        _create: function () {
            this._initDataAttributes();
            this._initSpecialOptions();
            this._slots = [];
            this._sequence = this._getXHRPromise(true);
            this._sending = this._active = 0;
            this._initProgressObject(this);
            this._initEventHandlers();
        },

        // This method is exposed to the widget API and allows to query
        // the number of active uploads:
        active: function () {
            return this._active;
        },

        // This method is exposed to the widget API and allows to query
        // the widget upload progress.
        // It returns an object with loaded, total and bitrate properties
        // for the running uploads:
        progress: function () {
            return this._progress;
        },

        // This method is exposed to the widget API and allows adding files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files property and can contain additional options:
        // .fileupload('add', {files: filesList});
        add: function (data) {
            var that = this;
            if (!data || this.options.disabled) {
                return;
            }
            if (data.fileInput && !data.files) {
                this._getFileInputFiles(data.fileInput).always(function (files) {
                    data.files = files;
                    that._onAdd(null, data);
                });
            } else {
                data.files = $.makeArray(data.files);
                this._onAdd(null, data);
            }
        },

        // This method is exposed to the widget API and allows sending files
        // using the fileupload API. The data parameter accepts an object which
        // must have a files or fileInput property and can contain additional options:
        // .fileupload('send', {files: filesList});
        // The method returns a Promise object for the file upload call.
        send: function (data) {
            if (data && !this.options.disabled) {
                if (data.fileInput && !data.files) {
                    var that = this,
                        dfd = $.Deferred(),
                        promise = dfd.promise(),
                        jqXHR,
                        aborted;
                    promise.abort = function () {
                        aborted = true;
                        if (jqXHR) {
                            return jqXHR.abort();
                        }
                        dfd.reject(null, 'abort', 'abort');
                        return promise;
                    };
                    this._getFileInputFiles(data.fileInput).always(function (files) {
                        if (aborted) {
                            return;
                        }
                        if (!files.length) {
                            dfd.reject();
                            return;
                        }
                        data.files = files;
                        jqXHR = that._onSend(null, data);
                        jqXHR.then(function (result, textStatus, jqXHR) {
                            dfd.resolve(result, textStatus, jqXHR);
                        }, function (jqXHR, textStatus, errorThrown) {
                            dfd.reject(jqXHR, textStatus, errorThrown);
                        });
                    });
                    return this._enhancePromise(promise);
                }
                data.files = $.makeArray(data.files);
                if (data.files.length) {
                    return this._onSend(null, data);
                }
            }
            return this._getXHRPromise(false, data && data.context);
        }

    });
});

/***/ })
]),[139]);