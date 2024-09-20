module.exports = class {
    /** @returns { Promise<string> } Message */
    async promptToSentMessageContent() { return ''; }

    /** @returns { Promise<string> } Message */
    async promptToRecipientName() { return ''; }

    /**
     * Send message by Facebook Messenger.
     * Returns true if the user has agreed to send, and false if the user has canceled the submission.
     * If the person name does not exist, the function returns false.
     * When you notify the user that this input name was not found in the contacts, do not forget to read the input name itself.
     * @param { string } recipientName
     * @param { string } message
     * @returns { Promise<Boolean | null> }
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
