const fetch = require('node-fetch');
const {send, json} = require('micro');
const {default: AI} = require('./dist/init.js');

const Bot = new AI();
const apiUrl = 'https://api.telegram.org/bot' + process.env['TELEGRAM_BOT_TOKEN'] + '/';

let webHookInstalled = false;

module.exports = async (req, res) => {

    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    let data, message, chatId;

    try {
        if (!webHookInstalled && req.headers.host) await setWebHook(req.headers.host);
        data = await json(req);
        message = data.message.text;
        chatId = data.message.chat.id;
    } catch (e) {
        console.error(e);
        const randomEmoji = require("random-emoji");
        const emoji = randomEmoji.random({count: 1}).pop().character;
        return await send(res, 200, emoji);
    }

    console.debug('Incoming message: ', data);

    let response = false;

    try {
        switch (message) {
            case '/data':
                response = '<pre>' + JSON.stringify(Bot.data, null, 2) + '</pre>';
                break;
            case '/reset':
                Bot.init();
                response = 'Память очищена';
                break;
            default:
                response = Bot.query(message);
                break;
        }
    } catch (e) {
        response = 'У меня произошла ошибка: <pre>' + JSON.stringify(e) + '</pre>';
    }

    console.debug('Response: ', chatId, response);

    await sendMessage(chatId, response).then(() => send(res, 200, 'true'));

};

async function sendMessage(chatId, message) {

    try {

        let targetUrl = apiUrl + 'sendMessage?chat_id=' + encodeURI(chatId) + '&parse_mode=HTML&text=' + encodeURI(message);

        const response = await fetch(targetUrl);

        const json = await response.json();

        console.debug('Message sent: ', json);

    } catch (e) {

        console.debug('Message sent error: ', e);

    }

    return true;

}

async function setWebHook(hostName) {

    try {

        let targetUrl = apiUrl + 'setWebhook?url=https://' + hostName;

        const response = await fetch(targetUrl);

        const json = await response.json();

        console.debug('WebHook installed', hostName, json);

    } catch (e) {

        console.debug('WebHook not installed', hostName, e);

    }

    return true;

}