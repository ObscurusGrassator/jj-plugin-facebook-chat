const FacebookChat = require('./FacebookChat');

let lastMessages = '';

module.exports = addPlugin({
    facebook: {
        login: {type: 'string'},
        password: {type: 'string'},
        automatic: {
            checkNewMessage: {type: 'boolean', value: false},
        },
    },
}, {
    os: { linux: true, darwin: true, win32: true, android: true, ios: true },
    pluginFormatVersion: 1,
}, {
    scriptInitializer: async ctx => new FacebookChat({...ctx, browserTab: await ctx.browserPluginStart('https://facebook.com/messages/t')}),
    translations: /** @type { const } */ ({
        preparingMessage: {
            "sk-SK": "Pripravujem Facebook správu ...",
            "en-US": "Preparing a Facebook message ..."
        },
        realNameNotFound: {
            "sk-SK": "Meno \"${name}\" sa v blízkych kontaktoch nenachádza.",
            "en-US": "The name \"${name}\" is not found in close contacts."
        },
        canSendMessage: {
            "sk-SK": "Môžem poslať Facebook správu priateľovi ${realName} s textom: ${message}",
            "en-US": "Can I send a Facebook message to friend ${realName} with the text: ${message}"
        },
        iCheck: {
            "sk-SK": "Pozriem Facebook...",
            "en-US": "I will check Facebook..."
        },
        recipientNameQuestion: {
            "sk-SK": "Komu mám správu odoslať?",
            "en-US": "Who should I send the message to?"
        },
        messageContentQuestion: {
            "sk-SK": "Môžete diktovať text správy:",
            "en-US": "You can dictate the message text:"
        },
        sendingMessage: {
            "sk-SK": "Odosielam Facebook správu...",
            "en-US": "I am sending the Facebook message..."
        },
    })
}, {
    scriptDestructor: async ctx => {
        await ctx.methodsForAI.logout();
        ctx.methodsForAI.options.browserTab.destructor();
    }
});
