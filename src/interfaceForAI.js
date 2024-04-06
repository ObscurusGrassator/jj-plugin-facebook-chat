module.exports = class {
    /**
     * Send message by Facebook Messenger
     * @param { string } name
     * @param { string } message
     * @returns { Promise<void> }
     */
    async sendMessage(name, message) {}

    /**
     * Returns unread messages array by sender mame from Facebook Messenger
     * @param { Object } [options]
     * @param { boolean } [options.makrAsReaded = false]
     * @param { string } [options.fromPersonName]
     * @returns { Promise<{[personName: string]: {message: string}[]}> }
     */
    async getMessages({makrAsReaded = false, fromPersonName} = {}, closeBrowserTab = false) { return {}; }
};
