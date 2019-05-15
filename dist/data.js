"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

var Data =
    /*#__PURE__*/
    function () {
        function Data() {
            _classCallCheck(this, Data);

            this.loadObjects();
            this.loadDictonary();
            var thisData = this;
            this.objectFromDictonary = new Proxy(this.dictionary, {
                get: function get(dictionary, word) {
                    return thisData[dictionary[word]];
                }
            });
        }

        _createClass(Data, [{
            key: "loadObjects",
            value: function loadObjects() {
                this.проект = {
                    notion: 'некоторый проект'
                };
            }
        }, {
            key: "loadDictonary",
            value: function loadDictonary() {
                this.dictionary = {
                    ты: 'я',
                    вы: 'я',
                    проект: 'проект'
                };
                this.operators = {
                    statement: ['это', '-', 'значит', 'равно', 'равняеться', 'выходит', 'что'],
                    question: ['?']
                };
            }
        }, {
            key: "attachObject",
            value: function attachObject() {
                var notion = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
                var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                if (!notion) if (!data.notion) return false; else notion = data.notion;
                if (!this[notion]) this[notion] = {};
                if (!this[notion].notion) this[notion].notion = notion;
                return Object.assign(this[notion], data);
            }
        }]);

        return Data;
    }();

exports["default"] = Data;