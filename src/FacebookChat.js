/** @typedef { import('./interfaceForAI.js') } InterfaceForAI */
/** @implements { InterfaceForAI } */
module.exports = class FacebookChat {
    constructor(options) {
        /**
         * @type { { browserTab: import('jjplugin').BrowserPuppeteer }
         *      & import('jjplugin').Ctx<import('jjplugin').ConfigFrom<typeof import('./index')['config']>, FacebookChat>
         * }
         */
        this.options = options;
    }

    async login() {
        await this.options.browserTab.sendRequest(async utils => {
            /** @type { HTMLButtonElement } */
            let cookiebanner = document.querySelector('[data-cookiebanner="accept_only_essential_button"]');
            if (cookiebanner !== null) cookiebanner.click();

            /** @type { HTMLButtonElement } */
            let not_me_link = document.querySelector('[ID=not_me_link]');
            if (not_me_link !== null) not_me_link.click();
        }, '$*');

        await this.options.browserTab.sendRequest(async (utils, login, pass) => {
            /** @type { HTMLInputElement } */ let loginEl = document.querySelector('#email');
            /** @type { HTMLInputElement } */ let passEl = document.querySelector('#pass');
            if (loginEl !== null) {
                loginEl.value = login;
                passEl.value = pass;
                (/** @type { HTMLButtonElement } */ (
                    document.querySelector('#loginbutton') || document.querySelector('[name="login"]')
                )).click();
            }
        }, '$*', this.options.config.facebook.login.value, this.options.config.facebook.password.value);

        // WTF? Čakanie na spasenie?
        try {
            await this.options.browserTab.sendRequest(async (utils, makrAsReaded, fromPersonName) => {
                await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="button"] > [data-visualcompletion="ignore"]');
            }, '$*');
        } catch (err) {}
    }

    async logout() {
        await this.options.browserTab.sendRequest(async (utils) => {
            let logout = document.querySelector('svg > g > image');
            if (logout) {
                logout.closest('div').click();
                (/** @type { HTMLDivElement } */ (
                    await utils.waitForElement('[data-visualcompletion="ignore-dynamic"][data-nocookies="true"] > div')
                )).click();
            }
        }, '$*');
    }

    /** @returns { Promise<string> } Message */
    async promptToSentMessageContent(textInvitingUserToDictateMessage) { return (await this.options.speech(textInvitingUserToDictateMessage, true)).text; }

    /** @returns { Promise<string> } Message */
    async promptToRecipientName(textInvitingUserToDictateRecipientName) { return (await this.options.speech(textInvitingUserToDictateRecipientName, true)).text; }

    /**
     * @param { string } personName
     * @param { string } message
     * @returns { Promise<Boolean> } Returns true if the user has agreed to send.
     */
    async sendMessage(personName, message) {
        await this.options.speech('Pripravujem Facebook správu ...');
    
        let realName = await this._sendMessage(personName, '');

        if (!realName) throw `Meno "${realName}" sa v blízkych kontaktoch nenachádza.`;

        message = message.replace(/ __? /g, ' ');

        if (await this.options.getSummaryAccept(`Môžem poslať Facebook správu priateľovi ${realName} s textom: ${message}`)) {
            await this._sendMessage(personName, message);
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param { string } personName
     * @param { string } message
     * @returns { Promise<string | false> }
     */
    async _sendMessage(personName, message) {    
        /** @type { String } */ let realName;
        try {
            await this.options.browserTab.pause.start();
            await this.options.browserTab.viewTab();
            await this.login();

            realName = await this.options.browserTab.sendRequest(async (utils, personName, message) => {
                let realName;
                let friendTabs = await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="row"]');

                // searching in last writing firends
                for (let f of friendTabs) {
                    if (f.querySelectorAll('div[role="img"] > div').length > 1) continue; // group - not one person

                    /** @type { HTMLDivElement } */
                    let friendTab = f.querySelector('[dir="auto"]');
                    if (friendTab && new RegExp(personName, 'i').test(friendTab.innerText)) {
                        friendTab.click();
                        realName = friendTab.innerText;
                        break;
                    }
                }

                if (!realName) {
                    await utils.typingToElement(personName, '[role="navigation"] input[type="search"]');

                    // searching in rearch input
                    let findedFindeds = await utils.waitForElementAll(`[role="listbox"] > li:first-child li:not([id="${personName}"])`);
                    for (let f of findedFindeds) {
                        /** @type { HTMLDivElement } */
                        let findedFinded = f.querySelector('[dir="auto"]');
                        if (findedFinded && new RegExp(personName, 'i').test(findedFinded.innerText)) {
                            findedFinded.click();
                            realName = findedFinded.innerText;
                            break;
                        }
                    }
                }

                if (message && realName) {
                    await utils.waitForElement(`[aria-label="${realName}"]`);
                    // write message
                    await utils.typingToElement(message, '[role="textbox"] p');
                    // @ts-ignore
                    console.log(document.querySelector('[role="textbox"] p').innerText, '==', message);
                    await new Promise(res => { setTimeout(res, 1000); });

                    /** @type { NodeListOf<HTMLButtonElement> } */ 
                    let buttons = document.querySelector('[role="textbox"]').parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll('[role="button"]');
                    buttons[buttons.length-1].click();
                }

                return realName;
            }, '$*', personName, message);

            console.debug('Facebook Plugin sendMessage():', realName || false);

            await this.setDefaultScreen();
        }
        catch (err) { throw err; }
        finally { this.options.browserTab.pause.stop(); }

        return realName || false;
    }

    /** @type {{ users: {[user: string]: {lastMessage: string}} }} */ 
    #lastMessages = {users: {}};

    /**
     * @param { Object } [options]
     * @param { boolean } [options.makrAsReaded = false]
     * @param { string } [options.fromPersonName]
     * @returns { Promise<{[name: string]: {message: string}[]}> }
     */
    async getMessages({makrAsReaded = false, fromPersonName} = {}, closeBrowserTab = false) {
        /** @type {{ [name: string]: {message: string}[] }} */
        let result;

        try {
            await this.options.speech('Pozriem Facebook...');
            await this.options.browserTab.pause.start();
            await this.options.browserTab.viewTab();
            await this.login();

            result = await this.options.browserTab.sendRequest(async (utils, makrAsReaded, fromPersonName) => {
                /** @type {{ [name: string]: {message: string}[] }} */
                let messages = {};
                let codeByName = {};

                let friendTabs = await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="button"] > [data-visualcompletion="ignore"]');

                for (let e of friendTabs) {
                    let link = e.closest('[role="gridcell"]').parentElement.querySelector('div:first-child > div > a');
                    if (window.getComputedStyle(e).backgroundColor.substring(0, 4) == 'rgb(' // only new messages
                            && link.querySelectorAll('div[role="img"] > div').length === 1) { // without groups
                        // @ts-ignore
                        let name = e.closest('[role="row"]').querySelector('[dir="auto"]').innerText.replace(/\\n/, '');
                        messages[name] = [];
                        codeByName[name] = link.getAttribute('href').match(/\/[0-9]+\//)[0];
                    }
                }
                for (let name in messages) {
                    let link = /** @type { HTMLLinkElement } */ await utils.waitForElement(
                        `[data-pagelet="MWThreadList"] a[aria-current="false"][href*="${codeByName[name]}"]`);
                    link.setAttribute('href', `javascript: void(0)/* ${codeByName[name]} */`);
                    link.click(); // this click() regenerate full fiend list and I must search HTMLElement again

                    await utils.waitForElement(`[aria-label*="${name}"]:not([role="img"])`);

                    let elems = await utils.waitForElementAll('[data-scope="messages_table"]'); // wait for rendering message of writing user
                    let lastColor;
                    // all last messages
                    for (let i = elems.length - 1, run = -2; i >= 0 && run; i--) {
                        let e = elems[i].querySelector('[style^=background-color]');
                        if (e && !lastColor) lastColor = window.getComputedStyle(e).color;
                        if (e && lastColor == window.getComputedStyle(e).color) {
                            // @ts-ignore
                            messages[name].unshift({message: e.innerText});
                        } else run++;
                    }

                    if (makrAsReaded === true && (typeof fromPersonName != 'string'
                        || new RegExp(fromPersonName, 'i').test(name)
                    )) {
                        await utils.typingToElement(' ', '[role="textbox"] p');
                        await new Promise(res => setTimeout(res, 1000)); // wait for chat tab loading
                    }
                }

                return messages;
            }, '$*', makrAsReaded, fromPersonName);

            console.debug('Facebook Plugin getMessages():', result);

            await this.setDefaultScreen(closeBrowserTab);

            // filter unread messages of this plugin
            for (let name in result) {
                if (makrAsReaded === true && (typeof fromPersonName != 'string'
                    || new RegExp(fromPersonName, 'i').test(name)
                )) {
                    for (let i in result[name]) {
                        if (result[name][i].message === this.#lastMessages.users[name]?.lastMessage) {
                            result[name] = result[name].slice(+i + 1);
                            if (!result[name].length) delete result[name];
                            break;
                        }
                    }

                    if (result[name]?.length) {
                        if (!this.#lastMessages.users[name])
                             this.#lastMessages.users[name] = {lastMessage: result[name][result[name].length-1].message};
                        else this.#lastMessages.users[name].lastMessage = result[name][result[name].length-1].message;
                    }
                } else if (typeof fromPersonName == 'string') delete result[name];
            }
        }
        catch (err) { throw err; }
        finally { this.options.browserTab.pause.stop(); }

        console.debug('Facebook Plugin getMessages():', result);

        return result;
    }

    /** Open new empty message to record new incomming messages */
    async setDefaultScreen(closeBrowserTab = false) {
        await this.options.browserTab.sendRequest(async utils => {
            (/** @type { HTMLDivElement } */(
                await utils.waitForElement('a[href="/messages/new/"]')
            )).click();
        }, '$*');
        closeBrowserTab && await this.options.browserTab.destructor();
    }
};
