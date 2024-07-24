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
        receivingMessages: {
            "sk-SK": "Prišli nové správy od priateľov",
            "en-US": "There are new messages from friends"
        },
        receivingMessage: {
            "sk-SK": "Prišla nová správa od priateľa",
            "en-US": "There are new message from friend"
        },
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
    },
    scriptPerInterval: async ctx => {
        if (!ctx.config.facebook.automatic.checkNewMessage.value) return;

        let result = '';

        try {
            await ctx.methodsForAI.options.browserTab.pause.start();
            await ctx.methodsForAI.login();

            const newMessages = await ctx.methodsForAI.getMessages({makrAsReaded: false}, true);
            const friends = Object.keys(newMessages);
            const newMessagesString = JSON.stringify(newMessages);

            if (friends && friends.length && lastMessages !== newMessagesString) {
                lastMessages = newMessagesString;

                if (friends.length  >  1) result = ctx.translate.receivingMessages + ' ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1');
                if (friends.length === 1) result = ctx.translate.receivingMessage + ' ' + friends[0];
            }
        }
        catch (err) { throw err; }
        finally { ctx.methodsForAI.options.browserTab.pause.stop(); }
        return result;
    }
});
