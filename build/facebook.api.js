/** @type {{ users: {[user: string]: {lastMessage: string}} }} */ 
const pluginStorage = {users: {}};

module.exports = class FacebookApi {

    /** @param {{ tab: import('jjplugin').BrowserPuppeteer }} options */
    constructor(options) { this.options = options; }

    /** @param { typeof import('./index')['config'] } config */
    async login(config) {
        await this.options.tab.sendRequest(async (utils, login, pass) => {
            /** @type { HTMLButtonElement } */
            let cookiebanner = document.querySelector('[data-cookiebanner="accept_only_essential_button"]');
            if (cookiebanner !== null) cookiebanner.click();

            /** @type { HTMLButtonElement } */
            let not_me_link = document.querySelector('[ID=not_me_link]');
            if (not_me_link !== null) not_me_link.click();
        }, '$*');

        await this.options.tab.sendRequest(async (utils, login, pass) => {
            /** @type { HTMLInputElement } */ let loginEl = document.querySelector('#email');
            /** @type { HTMLInputElement } */ let passEl = document.querySelector('#pass');
            if (loginEl !== null) {
                loginEl.value = login;
                passEl.value = pass;
                (/** @type { HTMLButtonElement } */ (
                    document.querySelector('#loginbutton') || document.querySelector('[name="login"]')
                )).click();

                // required after reload page - this timeout will aborted of reloading
                await new Promise(res => { setTimeout(res, 5000); });
            }
        }, '$*', config.facebook.login.value, config.facebook.password.value);
    }

    async logout() {
        await this.options.tab.sendRequest(async (utils) => {
            let logout = document.querySelector('svg > g > image');
            if (logout) {
                logout.closest('div').click();
                (/** @type { HTMLDivElement } */ (
                    await utils.waitForElement('[data-visualcompletion="ignore-dynamic"][data-nocookies="true"] > div')
                )).click();
            }
        }, '$*');
    }

    /**
     * @param { string | string[] } names
     * @param { string } message
     * @returns { Promise<{[k: string]: string | false}> }
     */
    async sendMessage(names, message) {
        /** @type { {[k: string]: string | false} } */ const realNames = {};

        for (let name of Array.isArray(names) ? names : [names]) {
            let realName = await this.options.tab.sendRequest(async (utils, name, message) => {
                let realName;
                let friendTabs = await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="row"]');

                // searching in last writing firends
                for (let f of friendTabs) {
                    if (f.querySelectorAll('div[role="img"] > div').length > 1) continue; // group - not one person

                    /** @type { HTMLDivElement } */
                    let friendTab = f.querySelector('[dir="auto"]');
                    if (friendTab && new RegExp(name, 'i').test(friendTab.innerText)) {
                        friendTab.click();
                        realName = friendTab.innerText;
                        break;
                    }
                }

                if (!realName) {
                    await utils.typingToElement('[role="navigation"] input[type="search"]', name);

                    // searching in rearch input
                    let findedFindeds = await utils.waitForElementAll(`[role="listbox"] > li:first-child li:not([id="${name}"])`);
                    for (let f of findedFindeds) {
                        /** @type { HTMLDivElement } */
                        let findedFinded = f.querySelector('[dir="auto"]');
                        if (findedFinded && new RegExp(name, 'i').test(findedFinded.innerText)) {
                            findedFinded.click();
                            realName = findedFinded.innerText;
                            break;
                        }
                    }
                }

                if (message && realName) {
                    await utils.waitForElement(`[aria-label="${realName}"]`);
                    // write message
                    await utils.typingToElement('[role="textbox"] p', message);
                    // @ts-ignore
                    console.log(document.querySelector('[role="textbox"] p').innerText, '==', message);
                    await new Promise(res => { setTimeout(res, 1000); });

                    /** @type { NodeListOf<HTMLButtonElement> } */ 
                    let buttons = document.querySelector('[role="textbox"]').parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll('[role="button"]');
                    buttons[buttons.length-1].click();
                }

                return realName;
            }, '$*', name, message);

            realNames[name] = realName || false;
        }

        console.debug('Facebook Plugin sendMessage():', realNames);

        await this.setDefaultScreen();

        return realNames;
    }

    /**
     * @param { boolean | string } [rememberLastMessage = true]
     * @returns { Promise<{[name: string]: string[]}> }
     */
    async getMessages(rememberLastMessage = true, closeBrowserTab = false) {
        let result = await this.options.tab.sendRequest(async (utils, rememberLastMessage) => {
            /** @type {{ [name: string]: string[] }} */
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
                        messages[name].unshift(e.innerText);
                    } else run++;
                }

                if (rememberLastMessage === true || (typeof rememberLastMessage == 'string'
                    && new RegExp(rememberLastMessage, 'i').test(name)
                )) {
                    await utils.typingToElement('[role="textbox"] p', ' ');
                    await new Promise(res => setTimeout(res, 1000)); // wait for chat tab loading
                }
            }

            return messages;
        }, '$*', rememberLastMessage);
        console.debug('Facebook Plugin getMessages():', result);

        await this.setDefaultScreen(closeBrowserTab);

        // filter unread messages of this plugin
        for (let name in result) {
            if (rememberLastMessage === true || (typeof rememberLastMessage == 'string'
                && new RegExp(rememberLastMessage, 'i').test(name)
            )) {
                for (let i in result[name]) {
                    if (result[name][i] === pluginStorage.users[name]?.lastMessage) {
                        result[name] = result[name].slice(+i + 1);
                        if (!result[name].length) delete result[name];
                        break;
                    }
                }

                if (result[name]?.length) {
                    if (!pluginStorage.users[name])
                        pluginStorage.users[name] = {lastMessage: result[name][result[name].length-1]};
                    else pluginStorage.users[name].lastMessage = result[name][result[name].length-1];
                }
            } else if (typeof rememberLastMessage == 'string') delete result[name];
        }

        console.debug('Facebook Plugin getMessages():', result);

        return result;
    }

    /** Open new empty message to record new incomming messages */
    async setDefaultScreen(closeBrowserTab = false) {
        await this.options.tab.sendRequest(async utils => {
            (/** @type { HTMLDivElement } */(
                await utils.waitForElement('a[href="/messages/new/"]')
            )).click();
        }, '$*');
        closeBrowserTab && await this.options.tab.destructor();
    }
};
