import './utils.js';
import Data, {DataObject} from './data.js';

export default class AI {
    constructor() {
        this.init();
    }

    init() {
        this['🤖'] = {name: 'ИИ', entity: 'Искуственный интелект'};
        this.data = new Data();
        this.data.attachObject('я', this['🤖']);
        this.queryTypes = {question: this.questionWorker, statement: this.statementWorker, other: this.otherWorker}
    }

    query(text) {

        const queryParts = text.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|");

        const queriesData = queryParts.map(query => this.analyzeQuery(query.toLowerCase()));

        const response = queriesData.map(data => this.queryTypes[data.type].call(this, data));

        return response ? response.map(responsePart => responsePart.capitalize()).join('. ') : 'Мне не удалось понять запрос';

    }

    analyzeQuery(query) {

        const {type, operator} = this.analyzeQueryType(query);

        return {text: query, type, operator};

    }

    analyzeQueryType(query) {

        let found = {type: false, operator: false};

        Object.keys(this.queryTypes).forEach(type => {
            if (found.type) return;
            if (!this.data.operators[type]) return;
            this.data.operators[type].forEach(operator => {
                if (query.includes(operator)) {
                    found.type = type;
                    found.operator = operator;
                }
            });
        });

        if (!found.type) found.type = 'other';

        return found;

    }

    questionWorker(queryData) {
        const subjects = this.findSubjects(queryData.text);
        if (!subjects.length) return 'В указанном вопросе не удалось найти известные предметы';
        return 'В указанном вопросе обнаружены следующие предметы: ' + subjects.map(subject => this.getSubjectData(subject)).join(', ');
    }

    statementWorker(queryData) {
        const statementParts = queryData.text.trimDot().split(queryData.operator.toLowerCase());
        const subjects = this.findSubjects(statementParts[0]);

        if (!this.data.rawStatements) this.data.rawStatements = {};
        this.data.rawStatements[statementParts[0].trim()] = statementParts[1].trim();

        if (subjects.length) return 'Утверждение относиться к следующим предметам: ' + subjects.map(subject => this.getSubjectData(subject)).join(', ');
        else return 'Утверждение зафиксировано';

    }

    findSubjects(text) {
        let foundSubjects = [];
        foundSubjects = Array.from(new Set(foundSubjects.concat(Object.keys(this.data.dictionary).filter(subject => text.includes(subject.toLowerCase())))));
        foundSubjects = Array.from(new Set(foundSubjects.concat(Object.keys(this.data.rawStatements).filter(subject => text.includes(subject.toLowerCase())))));
        return foundSubjects;
    }

    getSubjectData(subject) {
        let variants = this.findSubjectVariants(subject);

        let count;
        let loopLimit = 10;
        do {
            loopLimit--;
            let oldVariantsCount = variants.length;
            variants.forEach(variant => variants = Array.from(new Set(variants.concat(this.findSubjectVariants(variant)))));
            count = variants.length - oldVariantsCount;
        } while (count > 0 && loopLimit > 0);

        const objectsList = variants.map(variant => this.data[variant] || null).filter(object => object);

        return objectsList.length ? objectsList[0] : new DataObject({notion: subject});

    }

    findSubjectVariants(subject) {
        let variants = [subject];
        if (this.data.dictionary[subject]) variants.push(this.data.dictionary[subject]);
        if (this.data.rawStatements[subject]) variants.push(this.data.rawStatements[subject]);
        return variants;
    }

    otherWorker(queryData) {
        return 'Допустим';
    }

}