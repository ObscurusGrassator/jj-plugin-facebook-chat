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

                if (friends.length  >  1) result = 'Prišli nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1');
                if (friends.length === 1) result = 'Prišli novú správu od priateľa ' + friends[0];
            }
        }
        catch (err) { throw err; }
        finally { ctx.methodsForAI.options.browserTab.pause.stop(); }
        return result;
    }
});
