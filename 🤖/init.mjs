import Data from './data';

export default class AI {
    constructor() {
        this['🤖'] = {name: 'ИИ', entity: 'Искуственный интелект'};
        this.data = new Data();
        this.data.attachObject('я', this['🤖']);
        this.queryTypes = {question: this.questionWorker, statement: this.statementWorker, other: this.otherWorker}
    }

    query(text) {

        const queryParts = text.replace(/(\.+|\:|\!|\?)(\"*|\'*|\)*|}*|]*)(\s|\n|\r|\r\n)/gm, "$1$2|").split("|");

        const queriesData = queryParts.map(query => this.analyzeQuery(query));

        const response = queriesData.map(data => this.queryTypes[data.type].call(this, data));

        return response ? response.join(' ') : 'Мне не удалось понять запрос';

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
        const subjects = Object.keys(this.data.dictionary).filter(subject => queryData.text.includes(subject));
        if (!subjects) return 'В указанном вопросе не удалось найти известные предметы';
        return 'В указанном вопросе обнаружены следующие предметы: ' + subjects.map(subject => this.data.dictionary[subject]).join(', ');
    }

    statementWorker(queryData) {
        const statementParts = queryData.text.split(queryData.operator);
        const subjects = Object.keys(this.data.dictionary).filter(subject => statementParts[0].includes(subject));
        if (!subjects) {
            if (!this.data.rawStatements) this.data.rawStatements = {};
            this.data.rawStatements[statementParts[0].trim()] = statementParts[1].trim();
            return 'Утверждение зафиксировано';
        }
        return 'Утверждение относиться к следующим предметам: ' + subjects.map(subject => this.data.dictionary[subject]).join(', ');
    }

    otherWorker(queryData) {
        return 'Допустим';
    }

}