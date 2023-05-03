const { addPlugin, addCommand } = require('server/types/pluginFunctions');
const FacebookApi = require('./facebook.api');

/** @type {{ tab: import('server/types/processComunication').BrowserPuppeteer }} */
// @ts-ignore
const options = {};
const api = new FacebookApi(options);

let lastMessages = '';

module.exports = addPlugin({
    facebook: {
        login: '',
        password: '',
        automatic: {
            checkNewMessage: false,
        },
    },
}, {
    os: { linux: true, darwin: true, win32: true, android: true, ios: true },
    pluginFormatVersion: 1,
}, {
    scriptStart: async (config, services) => {
        options.tab = await services.browserPluginStart('https://facebook.com/messages/t');
    },
    scriptDestructor: async (config, services) => {
        await api.logout();
        options.tab.destructor();
    },
    scriptPerInterval: async (config, services) => {
        if (!config.facebook.automatic.checkNewMessage) return;

        await options.tab.pause.start();
        try {
            await api.login(config);
    
            const newMessages = await api.getMessages(false, true);
            const friends = Object.keys(newMessages);
            const newMessagesString = JSON.stringify(newMessages);
    
            if (lastMessages !== newMessagesString) {
                lastMessages = newMessagesString;
    
                if (friends.length  >  1) await services.speech('Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1'));
                if (friends.length === 1) await services.speech('Máš novú správu od priateľa ' + friends[0]);
            }
        }
        catch (err) { throw err; }
        finally { options.tab.pause.stop(); }
    },
    commands: [
        (config, services) => ({
            sentenceMemberRequirements: {
                _or: [{
                    // Písal mi niekto?
                    type: 'question',
                    predicates: {multiple: [{verbs: [{baseWord: /(na|od)písať/}]}]},
                    objects: [{multiple: [{origWord: /niekto/}]}],
                }, {
                    // Mám nejaké nové správy?
                    type: 'question',
                    predicates: {multiple: [{verbs: [{baseWord: /mať|prísť/}]}]},
                    objects: [{multiple: [{baseWord: /správa/}]}],
                }]
            },
            execute: async (getSummaryAccept, propName) => {
                await options.tab.pause.start();
                try {
                    await services.speech('Pozriem...');
                    await options.tab.viewTab();
                    await api.login(config);
    
                    const friends = Object.keys(await api.getMessages(false));
                    if (friends.length  >  1) await services.speech('Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1'));
                    if (friends.length === 1) await services.speech('Máš novú správu od priateľa ' + friends[0]);
                    if (friends.length === 0) await services.speech('Nemáš žiadne nové správy');
                }
                catch (err) { throw err; }
                finally { options.tab.pause.stop(); }
            },
        }),
        (config, services) => ({
            sentenceMemberRequirements: {
                _or: [{
                    // Prečítaj mi nové správy!
                    type: 'command',
                    predicates: {multiple: [{verbs: [{baseWord: /prečítať/}]}]},
                    objects: [{multiple: [{origWord: /správy|ich/}]}],
                }]
            },
            execute: async (getSummaryAccept, propName) => {
                await options.tab.pause.start();
                try {
                    await services.speech('Okamih...');
                    await options.tab.viewTab();
                    await api.login(config);
    
                    let messages = await api.getMessages(true);
                    await services.speech(Object.keys(messages).map(name => `${name} píše, ${messages[name].join(' ')},`).join(' '));
                    if (Object.keys(messages).length === 0) await services.speech('Nemáš žiadne nové správy');
                }
                catch (err) { throw err; }
                finally { options.tab.pause.stop(); }
            },
        }),
        (config, services) => ({
            sentenceMemberRequirements: {
                // Čo mi píše <subject>?
                type: 'question',
                predicates: {multiple: [{verbs: [{baseWord: [/(na|od)?písať/]}]}]},
                subjects: {multiple: [{propName: {friend: 'required'}}]},
                objects: [{multiple: [{origWord: /čo/}]}],
            },
            execute: async (getSummaryAccept, propName) => {
                await options.tab.pause.start();
                try {
                    await services.speech('Pozriem...');
                    await options.tab.viewTab();
                    await api.login(config);
    
                    let name = propName.friend.baseWord;
                    let messages = await api.getMessages(name);
                    if (!Object.keys(messages).length) await services.speech(`${name} ti nenapísal žiadnu novú správu.`);
                    else await services.speech(Object.keys(messages).map(name => `${name} píše, ${messages[name].join(' ')},`).join(' '));
                }
                catch (err) { throw err; }
                finally { options.tab.pause.stop(); }
            },
        }),
        (config, services) => ({
            sentenceMemberRequirements: {
                // Napíš správu pre <object> citujem ... koniec citácie!
                type: 'command',
                predicates: {multiple: [{verbs: [ {baseWord: [/(na|od)?písať/, /(od|p)oslať/]} ]}]},
                objects: [
                    {multiple: [{baseWord: 'správa'}]},
                    {multiple: [{_or:[
                        {case: {value: 'datív'}, propName: {friend: 'required'}},
                        {preposition: {origWord: 'pre'}, propName: {friend: 'required'}},
                    ]}]},
                ],
            },
            execute: async (getSummaryAccept, propName) => {
                await options.tab.pause.start();
                try {
                    await options.tab.viewTab();
                    await api.login(config);
    
                    if (!propName.citation) {
                        let { text } = await services.speech('Môžeš diktovať', true);
                        propName.citation = text;
                    }
                    else await services.speech('OK');
    
                    let fiends = propName.friend.parent.multiple.map(f => f.baseWord);
                    let preFriends = propName.friend.parent.multiple
                        .filter(w => w.preposition.origWord == 'pre')
                        .map(f => f.baseWord);
                    if (preFriends.length) fiends = preFriends;
    
                    let realNames = await api.sendMessage(fiends, '');
    
                    let unfindedNames = fiends.filter(n => !realNames[n]);
                    if (unfindedNames.length) {
                        await services.speech( (unfindedNames.length > 1 ? 'Mená' : 'Meno')
                            + unfindedNames.join(' a ') + ' som v blízkych kontaktoch nenašiel.'
                        );
                    }
                    else if (await getSummaryAccept('FacebookChat plugin: Poslať správu '
                        + (Object.values(realNames).length === 1 ? 'priateľovi: ' : 'priateľom: ')
                        + Object.values(realNames).join(', ') + ' s textom: ' + propName.citation)
                    ) {
                        await api.sendMessage(fiends, propName.citation);
                        await services.speech('Odoslané...');
                    }
                }
                catch (err) { throw err; }
                finally { options.tab.pause.stop(); }
            },
        }),
    ],
});
