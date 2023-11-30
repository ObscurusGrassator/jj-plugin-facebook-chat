const FacebookApi = require('./facebook.api');

/** @type {{ tab: import('jjplugin').BrowserPuppeteer }} */
// @ts-ignore
const options = {};
const api = new FacebookApi(options);

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
    scriptStart: async ctx => {
        options.tab = await ctx.browserPluginStart('https://facebook.com/messages/t');
    },
    scriptDestructor: async ctx => {
        await api.logout();
        options.tab.destructor();
    },
    scriptPerInterval: async ctx => {
        if (!ctx.config.facebook.automatic.checkNewMessage.value) return;

        let result = '';

        try {
            await options.tab.pause.start();
            await api.login(ctx.config);

            const newMessages = await api.getMessages(false, true);
            const friends = Object.keys(newMessages);
            const newMessagesString = JSON.stringify(newMessages);

            if (lastMessages !== newMessagesString) {
                lastMessages = newMessagesString;

                if (friends.length  >  1) result = 'Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1');
                if (friends.length === 1) result = 'Máš novú správu od priateľa ' + friends[0];
            }
        }
        catch (err) { throw err; }
        finally { options.tab.pause.stop(); }
        return result;
    },
},

{
    sentenceMemberRequirementStrings: [
        'Písal<(na|od)?písať> mi niekto ?',
        'Mám<prísť> správu ?',
    ],
    sentenceMemberRequirements: {
        _or: [{
            example: 'Písal mi niekto?',
            type: 'question',
            predicates: {multiple: [{verbs: [{baseWord: /(na|od)písať/}]}]},
            objects: [{multiple: [{origWord: /niekto/}]}],
        }, {
            example: 'Mám nejaké nové správy?',
            type: 'question',
            predicates: {multiple: [{verbs: [{baseWord: /mať|prísť/}]}]},
            objects: [{multiple: [{baseWord: /správa/}]}],
        }]
    },
}, async ctx => {
    let result = '';
    
    try {
        await ctx.speech('Pozriem Facebook...');
        await options.tab.pause.start();
        await options.tab.viewTab();
        await api.login(ctx.config);

        const friends = Object.keys(await api.getMessages(false));
        if (friends.length  >  1) result = 'Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1');
        if (friends.length === 1) result = 'Máš novú správu od priateľa ' + friends[0];
        if (friends.length === 0) result = 'Nemáš žiadne nové správy';
    }
    catch (err) { throw err; }
    finally { options.tab.pause.stop(); }
    return result;
}, {
    sentenceMemberRequirements: {
        _or: [{
            example: 'Prečítaj mi nové správy!',
            type: 'command',
            predicates: {multiple: [{verbs: [{baseWord: /prečítať/}]}]},
            objects: [{multiple: [{origWord: /správy|ich/}]}],
        }]
    },
}, async ctx => {
    let result = '';

    try {
        await ctx.speech('Pozriem Facebook...');
        await options.tab.pause.start();
        await options.tab.viewTab();
        await api.login(ctx.config);

        let messages = await api.getMessages(true);
        if (Object.keys(messages).length === 0) result = 'Nemáš žiadne nové správy';
        else result = Object.keys(messages).map(name => `${name} píše, ${messages[name].join(', ')},`).join(', ');
    }
    catch (err) { throw err; }
    finally { options.tab.pause.stop(); }
    return result;
},

{
    sentenceMemberRequirements: {
        example: 'Čo mi píše <subject>?',
        type: 'question',
        predicates: {multiple: [{verbs: [{baseWord: [/(na|od)písať/]}]}]},
        subjects: {multiple: [{propName: {friend: 'required'}}]},
        objects: [{multiple: [{origWord: /čo/}]}],
    },
}, async ctx => {
    let result = '';

    try {
        await ctx.speech('Pozriem Facebook...');
        await options.tab.pause.start();
        await options.tab.viewTab();
        await api.login(ctx.config);

        let name = ctx.propName.friend.baseWord;
        let messages = await api.getMessages(name);
        if (!Object.keys(messages).length) result = `${name} ti nenapísal žiadnu novú správu.`;
        else result = Object.keys(messages).map(name => `${name} píše, ${messages[name].join(', ')},`).join(', ');
    }
    catch (err) { throw err; }
    finally { options.tab.pause.stop(); }
    return result;
},

{
    sentenceMemberRequirementStrings: [
        'Napíš<odpísať|(od|p)oslať> správu Adamovi<.+> !',
        'Napíš<odpísať|(od|p)oslať> správu pre Adama<.+> !'
    ],
    sentenceMemberRequirements: {
        example: 'Napíš správu pre <object> citujem ... koniec citácie!',
        type: 'command',
        predicates: {multiple: [{verbs: [ {baseWord: [/(na|od)písať/, /(od|p)oslať/]} ]}]},
        objects: [
            {multiple: [{origWord: 'správu'}]},
            {multiple: [{_or: [
                {case: {/* value: 'datív', */ key: '3'}},
                {preposition: {origWord: 'pre'}},
            ]}], propName: {friend: 'required'}},
        ],
    },
}, async ctx => {
    let result = '';

    try {
        await options.tab.pause.start();
        await ctx.speech('Pripravujem Facebook správu ...');
        await options.tab.viewTab();
        await api.login(ctx.config);
        
        let friends = ctx.propName.friend.multiple.map(f => f.baseWord);
        let realNames = await api.sendMessage(friends, '');

        let unfindedNames = friends.filter(n => !realNames[n]);
        if (unfindedNames.length) {
            return (unfindedNames.length > 1 ? 'Mená' : 'Meno') + unfindedNames.join(' a ') + ' som v blízkych kontaktoch nenašiel.';
        } else {
            if (!ctx.propName.citation) {
                let { text } = await ctx.speech('Môžeš diktovať Facebook správu', true);
                ctx.propName.citation = text;
            }

            let citation = ctx.propName.citation.replace(/ __? /g, ' ');

            if (await ctx.getSummaryAccept('FacebookChat plugin: Poslať správu '
                + (Object.values(realNames).length === 1 ? 'priateľovi: ' : 'priateľom: ')
                + Object.values(realNames).join(', ') + ' s textom: ' + citation)
            ) {
                await api.sendMessage(friends, citation);
                result = 'Odoslané...';
            }
        }
    }
    catch (err) { throw err; }
    finally { options.tab.pause.stop(); }
    return result;
});
