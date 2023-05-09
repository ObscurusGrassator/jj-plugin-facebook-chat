function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
const b = require('server/src/_index.js');

/** @type {{ users: {[user: string]: {lastMessage: string}} }} */
const pluginStorage = {
  users: {}
};
module.exports = class FacebookApi {
  /** @param {{ tab: import('server/types/processComunication').BrowserPuppeteer }} options */
  constructor(options) {
    this.options = options;
  }

  /** @param { typeof import('./index')['config'] } config */
  login(config) {
    var _this = this;
    return _asyncToGenerator(function* () {
      yield _this.options.tab.sendRequest(`async (utils, login, pass) => {
            /** @type { HTMLButtonElement } */ 
            let cookiebanner = document.querySelector('[data-cookiebanner="accept_only_essential_button"]')
            if (cookiebanner !== null) cookiebanner.click();

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
        }`, config.facebook.login, config.facebook.password);
    })();
  }
  logout() {
    var _this2 = this;
    return _asyncToGenerator(function* () {
      yield _this2.options.tab.sendRequest(`async (utils) => {
            (await utils.waitForElement('svg > g > image')).closest('div').click();
            (/** @type { HTMLDivElement } */ (
                await utils.waitForElement('[data-visualcompletion="ignore-dynamic"][data-nocookies="true"] > div')
            )).click();
        }`);
    })();
  }

  /**
   * @param { string | string[] } names
   * @param { string } message
   * @returns { Promise<{[k: string]: string | false}> }
   */
  sendMessage(names, message) {
    var _this3 = this;
    return _asyncToGenerator(function* () {
      /** @type { {[k: string]: string | false} } */const realNames = {};
      for (let name of Array.isArray(names) ? names : [names]) {
        let realName = yield _this3.options.tab.sendRequest(`async (utils, name, message) => {
                let realName;
                let friendTabs = await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="row"]');

                // searching in last writing firends
                for (let f of friendTabs) {
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
                    let findedFindeds = await utils.waitForElementAll(\`[role="listbox"] > li:first-child li:not([id="\${name}"])\`);
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
                    await utils.waitForElement(\`[aria-label="\${realName}"]\`);
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
            }`, name, message);
        realNames[name] = realName || false;
      }
      console.debug('Facebook Plugin sendMessage():', realNames);
      yield _this3.setDefaultScreen();
      return realNames;
    })();
  }

  /**
   * @param { boolean | string } [rememberlastMessage = true]
   * @returns { Promise<{[name: string]: string[]}> }
   */
  getMessages(rememberlastMessage = true, closeBrowserTab = false) {
    var _this4 = this;
    return _asyncToGenerator(function* () {
      let result = yield _this4.options.tab.sendRequest(`async (utils, rememberlastMessage) => {
            /** @type {{ [name: string]: string[] }} */
            let messages = {};

            let friendTabs = await utils.waitForElementAll('[data-pagelet="MWThreadList"] [role="button"] > [data-visualcompletion="ignore"]');

            for (let e of friendTabs) {
                if (window.getComputedStyle(e).backgroundColor.substring(0, 4) !== 'rgb(') continue;

                // @ts-ignore
                let name = e.closest('[role="row"]').querySelector('[dir="auto"]').innerText.replace(/\\\\n/, '');
                messages[name] = [];

                // @ts-ignore
                e.closest('[role="gridcell"]').parentElement.querySelector('div:first-child > div > a').click();
                await utils.waitForElement(\`[aria-label*="\${name}"]:not([role="img"])\`);
                // await new Promise(res => setTimeout(res, 500)); // wait for remove message of previous user

                let elems = await utils.waitForElementAll('[data-scope="messages_table"]'); // wait for rendering message of writing user
                let lastColor;
                // all last messages
                for (let i = elems.length - 1, run = -2; i >= 0 && run; i--) {
                    let e = elems[i].querySelector('[dir="auto"][role="none"]');
                    if (e && !lastColor) lastColor = window.getComputedStyle(e).color;
                    if (e && lastColor == window.getComputedStyle(e).color) {
                        // @ts-ignore
                        messages[name].unshift(e.innerText);
                    } else run++;
                }

                if (rememberlastMessage === true || (typeof rememberlastMessage == 'string'
                    && new RegExp(rememberlastMessage, 'i').test(name)
                )) {
                    await utils.typingToElement('[role="textbox"] p', ' ');
                    await new Promise(res => setTimeout(res, 1000)); // wait for chat tab loading
                }
            }

            return messages;
        }`, rememberlastMessage);
      console.debug('Facebook Plugin getMessages():', result);
      yield _this4.setDefaultScreen(closeBrowserTab);

      // filter unread messages of this plugin
      for (let name in result) {
        if (rememberlastMessage === true || typeof rememberlastMessage == 'string' && new RegExp(rememberlastMessage, 'i').test(name)) {
          for (let i in result[name]) {
            if (result[name][i] === pluginStorage.users[name]?.lastMessage) {
              result[name] = result[name].slice(+i + 1);
              if (!result[name].length) delete result[name];
              break;
            }
          }
          if (result[name]?.length) {
            if (!pluginStorage.users[name]) pluginStorage.users[name] = {
              lastMessage: result[name][result[name].length - 1]
            };else pluginStorage.users[name].lastMessage = result[name][result[name].length - 1];
          }
        } else if (typeof rememberlastMessage == 'string') delete result[name];
      }
      console.debug('Facebook Plugin getMessages():', result);
      return result;
    })();
  }

  /** Open new empty message to record new incomming messages */
  setDefaultScreen(closeBrowserTab = false) {
    var _this5 = this;
    return _asyncToGenerator(function* () {
      yield _this5.options.tab.sendRequest(`async utils => {
            (/** @type { HTMLDivElement } */(
                await utils.waitForElement('a[role="link"] > i[data-visualcompletion="css-img"]')
            )).click();
        }`);
      closeBrowserTab && (yield _this5.options.tab.destructor());
    })();
  }
};
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
const addPlugin = (config, systemRequirements, pluginFunctions) => ({config, systemRequirements, ...pluginFunctions});
const addCommand = (sentenceMemberRequirements, execute) => ({sentenceMemberRequirements, execute});
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
      checkNewMessage: false
    }
  }
}, {
  os: {
    linux: true,
    darwin: true,
    win32: true,
    android: true,
    ios: true
  },
  pluginFormatVersion: 1
}, {
  scriptStart: function () {
    var _ref = _asyncToGenerator(function* (config, services) {
      options.tab = yield services.browserPluginStart('https://facebook.com/messages/t');
    });
    return function scriptStart(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }(),
  scriptDestructor: function () {
    var _ref2 = _asyncToGenerator(function* (config, services) {
      yield api.logout();
      options.tab.destructor();
    });
    return function scriptDestructor(_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }(),
  scriptPerInterval: function () {
    var _ref3 = _asyncToGenerator(function* (config, services) {
      if (!config.facebook.automatic.checkNewMessage) return;
      yield options.tab.pause.start();
      try {
        yield api.login(config);
        const newMessages = yield api.getMessages(false, true);
        const friends = Object.keys(newMessages);
        const newMessagesString = JSON.stringify(newMessages);
        if (lastMessages !== newMessagesString) {
          lastMessages = newMessagesString;
          if (friends.length > 1) yield services.speech('Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1'));
          if (friends.length === 1) yield services.speech('Máš novú správu od priateľa ' + friends[0]);
        }
      } catch (err) {
        throw err;
      } finally {
        options.tab.pause.stop();
      }
    });
    return function scriptPerInterval(_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }(),
  commands: [(config, services) => ({
    sentenceMemberRequirements: {
      _or: [{
        // Písal mi niekto?
        type: 'question',
        predicates: {
          multiple: [{
            verbs: [{
              baseWord: /(na|od)písať/
            }]
          }]
        },
        objects: [{
          multiple: [{
            origWord: /niekto/
          }]
        }]
      }, {
        // Mám nejaké nové správy?
        type: 'question',
        predicates: {
          multiple: [{
            verbs: [{
              baseWord: /mať|prísť/
            }]
          }]
        },
        objects: [{
          multiple: [{
            baseWord: /správa/
          }]
        }]
      }]
    },
    execute: function () {
      var _ref4 = _asyncToGenerator(function* (getSummaryAccept, propName) {
        yield options.tab.pause.start();
        try {
          yield services.speech('Pozriem...');
          yield options.tab.viewTab();
          yield api.login(config);
          const friends = Object.keys(yield api.getMessages(false));
          if (friends.length > 1) yield services.speech('Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1'));
          if (friends.length === 1) yield services.speech('Máš novú správu od priateľa ' + friends[0]);
          if (friends.length === 0) yield services.speech('Nemáš žiadne nové správy');
        } catch (err) {
          throw err;
        } finally {
          options.tab.pause.stop();
        }
      });
      return function execute(_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }()
  }), (config, services) => ({
    sentenceMemberRequirements: {
      _or: [{
        // Prečítaj mi nové správy!
        type: 'command',
        predicates: {
          multiple: [{
            verbs: [{
              baseWord: /prečítať/
            }]
          }]
        },
        objects: [{
          multiple: [{
            origWord: /správy|ich/
          }]
        }]
      }]
    },
    execute: function () {
      var _ref5 = _asyncToGenerator(function* (getSummaryAccept, propName) {
        yield options.tab.pause.start();
        try {
          yield services.speech('Okamih...');
          yield options.tab.viewTab();
          yield api.login(config);
          let messages = yield api.getMessages(true);
          yield services.speech(Object.keys(messages).map(name => `${name} píše, ${messages[name].join(' ')},`).join(' '));
          if (Object.keys(messages).length === 0) yield services.speech('Nemáš žiadne nové správy');
        } catch (err) {
          throw err;
        } finally {
          options.tab.pause.stop();
        }
      });
      return function execute(_x9, _x10) {
        return _ref5.apply(this, arguments);
      };
    }()
  }), (config, services) => ({
    sentenceMemberRequirements: {
      // Čo mi píše <subject>?
      type: 'question',
      predicates: {
        multiple: [{
          verbs: [{
            baseWord: [/(na|od)?písať/]
          }]
        }]
      },
      subjects: {
        multiple: [{
          propName: {
            friend: 'required'
          }
        }]
      },
      objects: [{
        multiple: [{
          origWord: /čo/
        }]
      }]
    },
    execute: function () {
      var _ref6 = _asyncToGenerator(function* (getSummaryAccept, propName) {
        yield options.tab.pause.start();
        try {
          yield services.speech('Pozriem...');
          yield options.tab.viewTab();
          yield api.login(config);
          let name = propName.friend.baseWord;
          let messages = yield api.getMessages(name);
          if (!Object.keys(messages).length) yield services.speech(`${name} ti nenapísal žiadnu novú správu.`);else yield services.speech(Object.keys(messages).map(name => `${name} píše, ${messages[name].join(' ')},`).join(' '));
        } catch (err) {
          throw err;
        } finally {
          options.tab.pause.stop();
        }
      });
      return function execute(_x11, _x12) {
        return _ref6.apply(this, arguments);
      };
    }()
  }), (config, services) => ({
    sentenceMemberRequirements: {
      // Napíš správu pre <object> citujem ... koniec citácie!
      type: 'command',
      predicates: {
        multiple: [{
          verbs: [{
            baseWord: [/(na|od)?písať/, /(od|p)oslať/]
          }]
        }]
      },
      objects: [{
        multiple: [{
          baseWord: 'správa'
        }]
      }, {
        multiple: [{
          _or: [{
            case: {
              value: 'datív'
            },
            propName: {
              friend: 'required'
            }
          }, {
            preposition: {
              origWord: 'pre'
            },
            propName: {
              friend: 'required'
            }
          }]
        }]
      }]
    },
    execute: function () {
      var _ref7 = _asyncToGenerator(function* (getSummaryAccept, propName) {
        yield options.tab.pause.start();
        try {
          yield options.tab.viewTab();
          yield api.login(config);
          if (!propName.citation) {
            let {
              text
            } = yield services.speech('Môžeš diktovať', true);
            propName.citation = text;
          } else yield services.speech('OK');
          let fiends = propName.friend.parent.multiple.map(f => f.baseWord);
          let preFriends = propName.friend.parent.multiple.filter(w => w.preposition.origWord == 'pre').map(f => f.baseWord);
          if (preFriends.length) fiends = preFriends;
          let realNames = yield api.sendMessage(fiends, '');
          let unfindedNames = fiends.filter(n => !realNames[n]);
          if (unfindedNames.length) {
            yield services.speech((unfindedNames.length > 1 ? 'Mená' : 'Meno') + unfindedNames.join(' a ') + ' som v blízkych kontaktoch nenašiel.');
          } else if (yield getSummaryAccept('FacebookChat plugin: Poslať správu ' + (Object.values(realNames).length === 1 ? 'priateľovi: ' : 'priateľom: ') + Object.values(realNames).join(', ') + ' s textom: ' + propName.citation)) {
            yield api.sendMessage(fiends, propName.citation);
            yield services.speech('Odoslané...');
          }
        } catch (err) {
          throw err;
        } finally {
          options.tab.pause.stop();
        }
      });
      return function execute(_x13, _x14) {
        return _ref7.apply(this, arguments);
      };
    }()
  })]
});
