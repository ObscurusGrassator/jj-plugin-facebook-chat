/** @typedef { import('./interfaceForAI.js') } InterfaceForAI */
/** @implements {InterfaceForAI} */
module.exports = class FacebookChat {
    /** @type { string } */
    lastChatPersonName;

    constructor(options) {
        /**
         * @type { import('jjplugin').Ctx< import('jjplugin').ConfigFrom<typeof import('./index')['config']>, FacebookChat, typeof import('./index')['translations'] >
         *      & { browserTab: import('jjplugin').BrowserPuppeteer }
         * }
         */
        this.options = options;
    }

    async login() {
        await this.options.browserTab.sendRequest(async utils => {
            /** @type { NodeListOf<HTMLButtonElement> } */
            let cookiebanner = document.querySelectorAll('[aria-labelledby="manage_cookies_title"] [aria-label][role="button"][tabindex="0"]');
            if (cookiebanner !== null && cookiebanner.length) cookiebanner[cookiebanner.length-1].click();

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
    async promptToSentMessageContent() { return (await this.options.speech(this.options.translate.messageContentQuestion, true)).text; }

    /** @returns { Promise<string> } Message */
    async promptToRecipientName() { return (await this.options.speech(this.options.translate.recipientNameQuestion, true)).text; }

    /**
     * @param { string } recipientName
     * @param { string } message
     * @returns { Promise<Boolean | null> }
     */
    async sendMessage(recipientName, message) {
        await this.options.speech(this.options.translate.preparingMessage);
    
        let realName = await this._sendMessage(recipientName, '');

        if (!realName) return null;

        message = message.replace(/ __? /g, ' ');

        if (await this.options.getSummaryAccept(this.options.translate.canSendMessage({realName, message}))) {
            this.options.speech(this.options.translate.sendingMessage);

            this.lastChatPersonName = realName;

            await this._sendMessage(recipientName, message);

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
                    if (f.querySelectorAll('img').length > 1) continue; // group - not one person

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

            console.debug('Facebook Plugin sendMessage():', realName);

            await this.setDefaultScreen();
        }
        catch (err) { throw err; }
        finally { this.options.browserTab.pause.stop(); }

        return realName;
    }

    /** @type {{ users: {[user: string]: {lastMessage: string}} }} */ 
    #lastMessages = {users: {}};

    /**
     * @param { Object } [options]
     * @param { boolean } [options.makrAsReaded = false]
     * @param { string } [options.fromPersonName]
     * @returns { Promise<{[personName: string]: {message: string}[]}> }
     */
    async getMessages({makrAsReaded = false, fromPersonName = undefined} = {}, closeBrowserTab = false) {
        /** @type {{ [name: string]: {message: string}[] }} */
        let result;

        try {
            await this.options.speech(this.options.translate.iCheck);
            await this.options.browserTab.pause.start();
            await this.options.browserTab.viewTab();
            await this.login();

            result = await this.options.browserTab.sendRequest(async (utils, makrAsReaded, fromPersonName) => {
                /** @type {{ [name: string]: {message: string}[] }} */
                let messages = {};
                let codeByName = {};

                // let friendTabs = await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="button"] > [data-visualcompletion="ignore"]');
                // for (let e of friendTabs) {
                //     let link = e.closest('[role="gridcell"]').parentElement.querySelector('div:first-child > div > a');
                //     if (window.getComputedStyle(e).backgroundColor.substring(0, 4) == 'rgb(' // only new messages
                //             && link.querySelectorAll('div[role="img"] > div').length === 1) { // without groups
                //         // @ts-ignore
                //         let name = e.closest('[role="row"]').querySelector('[dir="auto"]').innerText.replace(/\\n/, '');
                //         messages[name] = [];
                //         codeByName[name] = link.getAttribute('href').match(/\/[0-9]+\//)[0];
                //     }
                // }
                await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="button"]');
                let friendTabs = document.querySelectorAll('[data-pagelet="MWThreadList"] [role="button"] > span[data-visualcompletion="ignore"]');
                for (let e of friendTabs) {
                    let link = e.closest('[role="gridcell"]').parentElement.querySelector('div:first-child > div > a');
                    if (link.querySelectorAll('img').length === 1) { // without groups
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
                        let e = elems[i].querySelector('[role="presentation"] > span:not(:has([role="presentation"]))');
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

            if (Object.keys(result).length === 1) this.lastChatPersonName = Object.keys(result)[0];
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
                // (await utils.waitForElementAll('[role="navigation"]'))[2].querySelectorAll('[aria-label][role="button"]')[1]
                (await utils.waitForElementAll('[role="navigation"]:has([data-pagelet="MWThreadList"]) [aria-label][role="button"]'))[1]
            )).click();
        }, '$*');
        closeBrowserTab && await this.options.browserTab.destructor();
    }
};
