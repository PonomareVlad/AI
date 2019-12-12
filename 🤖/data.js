export default class Data {
    constructor() {
        this.loadObjects();
        this.loadDictonary();

        let thisData = this;
        this.objectFromDictonary = new Proxy(this.dictionary, {
            get(dictionary, word) {
                return thisData[dictionary[word]];
            }
        });
    }

    loadObjects() {
        this.attachObject('проект', {notion: 'некоторый проект'});
    }

    loadDictonary() {
        this.dictionary = {
            ты: 'я',
            вы: 'я',
            проект: 'проект'
        };
        this.operators = {
            statement: ['это', '-', 'значит', 'равно', 'равняеться', 'выходит', 'что'],
            question: ['?']
        };
        this.rawStatements = {};
    }

    attachObject(notion = null, data = {}) {
        if (!notion) if (!data.notion) return false; else notion = data.notion;
        if (!this[notion]) this[notion] = new DataObject({notion});
        return Object.assign(this[notion], data);
    }

}

export class DataObject {
    constructor({notion} = {}) {
        if (notion) this.notion = notion;
        this.toString = function () {
            return JSON.stringify(this);
        }
    }
}