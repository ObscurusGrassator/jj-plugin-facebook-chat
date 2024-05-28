module.exports = class {
    /**
     * Send message by Facebook Messenger.
     * @param { string } personName
     * @param { string } message
     * @returns { Promise<void> }
     */
    async sendMessage(personName, message) {}

    /**
     * Returns unread messages array by sender mame from Facebook Messenger.
     * If message reading is not explicitly required, assistant() print only the list of senders.
     * Only if you print the message content, assistant() mark them as readed.
     * @param { Object } [options]
     * @param { boolean } [options.makrAsReaded = false]
     * @param { string } [options.fromPersonName]
     * @returns { Promise<{[personName: string]: {message: string}[]}> }
     */
    async getMessages({makrAsReaded = false, fromPersonName} = {}, closeBrowserTab = false) { return {}; }
};
