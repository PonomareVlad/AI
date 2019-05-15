const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const {default: AI} = require('./dist/init.js');

const app = express();
module.exports = app;

const Bot = new AI();

const apiUrl = 'https://api.telegram.org/bot' + process.env['TELEGRAM_BOT_TOKEN'] + '/';

app.use(bodyParser.json());

app.post('*', (req, res) => {

    if (req.body == null) {
        return res.status(200).send({error: 'no JSON object in the request'})
    }

    let response = false;

    try {
        switch (req.body.message.text) {
            case '/data':
                response = '<pre>' + JSON.stringify(Bot.data, null, 2) + '</pre>';
                break;
            case '/reset':
                Bot.init();
                response = 'Память очищена';
                break;
            default:
                response = Bot.query(req.body.message.text);
                break;
        }
    } catch (e) {
        response = 'У меня произошла ошибка: ' + JSON.stringify(e);
    }

    sendMessage(req.body.message.chat.id, response).then(() => {
        res.set('Content-Type', 'application/json');
        res.status(200).send('true');
    })

});

app.all('*', (req, res) => {
    res.status(200).send('🤖');
});

function setWebHook() {

    let targetUrl = apiUrl + 'setWebhook?url=https://bot.ponomarevlad.ru';

    return axios.get(targetUrl)
        .then(response => {
            console.log(response.data);
            return true;
        })
        .catch(error => {
            console.log(error);
            return true;
        }).then(() => {
            return true;
        });
}

function sendMessage(chatId, message) {

    let targetUrl = apiUrl + 'sendMessage?chat_id=' + encodeURI(chatId) + '&parse_mode=HTML&text=' + encodeURI(message);

    return axios.get(targetUrl)
        .then(response => {
            console.log(response.data);
            return true;
        })
        .catch(error => {
            console.log(error);
            return true;
        }).then(() => {
            return true;
        });
}

setWebHook();