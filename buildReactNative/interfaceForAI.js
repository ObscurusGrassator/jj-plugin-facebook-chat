module.exports = class {
    /** @returns { Promise<string> } Message */
    async promptToSentMessageContent() { return ''; }

    /** @returns { Promise<string> } Message */
    async promptToRecipientName() { return ''; }

    /**
     * Send message by Facebook Messenger.
     * @param { string } recipientName
     * @param { string } message
     * @returns { Promise<Boolean> } Returns true if the user has agreed to send.
     */
    async sendMessage(recipientName, message) { return true; }

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
