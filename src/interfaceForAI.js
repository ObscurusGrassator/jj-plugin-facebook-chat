module.exports = class {

    async login() {}

    /**
     * Send message by Facebook Messenger
     * @param { string } name
     * @param { string } message
     * @returns { Promise<void> }
     */
    async sendMessage(name, message) {}

    /**
     * Returns not readed messages array by sender mame from Facebook Messenger
     * @param { Object } [options]
     * @param { boolean } [options.makrAsReaded = true]
     * @param { string } [options.fromPersonName]
     * @returns { Promise<{[personName: string]: string[]}> }
     */
    async getMessages({makrAsReaded = true, fromPersonName} = {}, closeBrowserTab = false) { return {}; }
};
