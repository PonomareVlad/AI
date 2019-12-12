const fetch = require('node-fetch');
const {default: AI} = require('./🤖/init.js');

const Bot = new AI();
const apiUrl = 'https://api.telegram.org/bot' + process.env['TELEGRAM_BOT_TOKEN'] + '/';

let webHookInstalled = false;

export default async (req, res) => {

    // res.setHeader('Content-Type', 'application/json; charset=utf-8');

    let data, message, chatId;

    try {
        if (!webHookInstalled && req.headers.host && req.headers.host !== 'localhost') await setWebHook(req.headers.host);
        data = req.body;
        if (data && data.message) {
            message = data.message.text;
            chatId = data.message.chat.id;
        } else return await emojiResponse(res);
    } catch (e) {
        console.error(e);
        return await emojiResponse(res);
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
            case '/host':
                response = req.headers.host;
                break;
            default:
                response = Bot.query(message);
                break;
        }
    } catch (e) {
        response = 'У меня произошла ошибка: <pre>' + JSON.stringify(e) + '</pre>';
    }

    console.debug('Response: ', chatId, response);

    await sendMessage(chatId, response).then(() => res.status(200).send('true'));

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

async function emojiResponse(res) {
    const randomEmoji = require("random-emoji");
    const emoji = randomEmoji.random({count: 1}).pop().character;
    return res.status(200).send(emoji);
}