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
    })
}, {
    scriptDestructor: async ctx => {
        await ctx.methodsForAI.logout();
        ctx.methodsForAI.options.browserTab.destructor();
    }
});
