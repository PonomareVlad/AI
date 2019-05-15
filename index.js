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

    sendMessage(req.body.message.chat.id, Bot.query(req.body.message.text)).then(() => {
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

    let targetUrl = apiUrl + 'sendMessage?chat_id=' + encodeURI(chatId) + '&text=' + encodeURI(message);

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