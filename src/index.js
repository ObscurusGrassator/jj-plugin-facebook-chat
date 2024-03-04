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

            if (friends && friends.length && lastMessages !== newMessagesString) {
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
        'Písal<(na|od)?písať> ?mi ?niekto na<vo> ?Facebooku na<v> ?Messengeri na ?Messenger do ?Messengera ?novú ?správu ?',
        'Mám ?nejakú<dajaký> ?novú správu na<vo> ?Facebooku na<v> ?Messengeri ?',
        'Prišla ?mi ?nejaká<dajaký> ?nová správa na ?Facebook do ?Facebooku na ?Messenger do ?Messengera ?',
    ],
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
},

{
    sentenceMemberRequirementStrings: [
        'Prečítaj<ukázať|zobraziť> ?mi ?všetky nové správy na<vo|z> ?Facebooku na<v> ?Messengeri z ?Messengera !'
    ],
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
    sentenceMemberRequirementStrings: [
        'Čo ?mi píše Adam<.+> na<vo> ?Facebooku na<v> ?Messengeri ?',
    ],
}, async ctx => {
    let result = '';

    try {
        await ctx.speech('Pozriem Facebook...');
        await options.tab.pause.start();
        await options.tab.viewTab();
        await api.login(ctx.config);

        let name = ctx.propName['adam'].multiple[0].baseWord;
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
        'Napíš<odpísať|(od|p)oslať> ?novú ?správu Adamovi<.+> na<vo|z> ?Facebooku na<v> ?Messengeri z ?Messengera !',
        'Napíš<odpísať|(od|p)oslať> ?novú správu pre Adama<.+> na<vo|z> ?Facebooku na<v> ?Messengeri z ?Messengera !'
    ],
}, async ctx => {
    let result = '';

    try {
        await options.tab.pause.start();
        await ctx.speech('Pripravujem Facebook správu ...');
        await options.tab.viewTab();
        await api.login(ctx.config);

        let friends = ctx.propName['adamovi'].multiple.map(f => f.baseWord);
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
