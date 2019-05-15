"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

require("./utils");

var _data = _interopRequireDefault(require("./data"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var AI =
/*#__PURE__*/
function () {
  function AI() {
    _classCallCheck(this, AI);

    this['🤖'] = {
      name: 'ИИ',
      entity: 'Искуственный интелект'
    };
    this.data = new _data["default"]();
    this.data.attachObject('я', this['🤖']);
    this.queryTypes = {
      question: this.questionWorker,
      statement: this.statementWorker,
      other: this.otherWorker
    };
  }

  _createClass(AI, [{
    key: "query",
    value: function query(text) {
      var _this = this;

      var queryParts = text.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|");
      var queriesData = queryParts.map(function (query) {
        return _this.analyzeQuery(query.toLowerCase());
      });
      var response = queriesData.map(function (data) {
        return _this.queryTypes[data.type].call(_this, data);
      });
      return response ? response.map(function (responsePart) {
        return responsePart.capitalize();
      }).join('. ') : 'Мне не удалось понять запрос';
    }
  }, {
    key: "analyzeQuery",
    value: function analyzeQuery(query) {
      var _this$analyzeQueryTyp = this.analyzeQueryType(query),
          type = _this$analyzeQueryTyp.type,
          operator = _this$analyzeQueryTyp.operator;

      return {
        text: query,
        type: type,
        operator: operator
      };
    }
  }, {
    key: "analyzeQueryType",
    value: function analyzeQueryType(query) {
      var _this2 = this;

      var found = {
        type: false,
        operator: false
      };
      Object.keys(this.queryTypes).forEach(function (type) {
        if (found.type) return;
        if (!_this2.data.operators[type]) return;

        _this2.data.operators[type].forEach(function (operator) {
          if (query.includes(operator)) {
            found.type = type;
            found.operator = operator;
          }
        });
      });
      if (!found.type) found.type = 'other';
      return found;
    }
  }, {
    key: "questionWorker",
    value: function questionWorker(queryData) {
      var _this3 = this;

      var subjects = this.findSubjects(queryData.text);
      if (!subjects.length) return 'В указанном вопросе не удалось найти известные предметы';
      return 'В указанном вопросе обнаружены следующие предметы: ' + subjects.map(function (subject) {
        return _this3.getSubjectData(subject);
      }).join(', ');
    }
  }, {
    key: "statementWorker",
    value: function statementWorker(queryData) {
      var _this4 = this;

      var statementParts = queryData.text.trimDot().split(queryData.operator.toLowerCase());
      var subjects = this.findSubjects(statementParts[0]);

      if (!subjects.length) {
        if (!this.data.rawStatements) this.data.rawStatements = {};
        this.data.rawStatements[statementParts[0].trim()] = statementParts[1].trim();
        return 'Утверждение зафиксировано';
      }

      return 'Утверждение относиться к следующим предметам: ' + subjects.map(function (subject) {
        return _this4.getSubjectData(subject);
      }).join(', ');
    }
  }, {
    key: "findSubjects",
    value: function findSubjects(text) {
      var foundSubjects = [];
      foundSubjects = Array.from(new Set(foundSubjects.concat(Object.keys(this.data.dictionary).filter(function (subject) {
        return text.includes(subject.toLowerCase());
      }))));
      foundSubjects = Array.from(new Set(foundSubjects.concat(Object.keys(this.data.rawStatements).filter(function (subject) {
        return text.includes(subject.toLowerCase());
      }))));
      return foundSubjects;
    }
  }, {
    key: "getSubjectData",
    value: function getSubjectData(subject) {
      var _this5 = this;

      var variants = this.findSubjectVariants(subject);
      variants.forEach(function (variant) {
        return variants = Array.from(new Set(variants.concat(_this5.findSubjectVariants(variant))));
      });
      var objectsList = variants.map(function (variant) {
        return _this5.data[variant] || null;
      }).filter(function (object) {
        return object;
      });
      return objectsList.length ? objectsList[0] : new _data.DataObject({
        notion: subject
      });
    }
  }, {
    key: "findSubjectVariants",
    value: function findSubjectVariants(subject) {
      var variants = [subject];
      if (this.data.dictionary[subject]) variants.push(this.data.dictionary[subject]);
      if (this.data.rawStatements[subject]) variants.push(this.data.rawStatements[subject]);
      return variants;
    }
  }, {
    key: "otherWorker",
    value: function otherWorker(queryData) {
      return 'Допустим';
    }
  }]);

  return AI;
}();

exports["default"] = AI;