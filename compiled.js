var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));var _createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass"));var b=require('server/src/_index.js');var pluginStorage={users:{}};module.exports=function(){function FacebookApi(options){(0,_classCallCheck2.default)(this,FacebookApi);this.options=options;}(0,_createClass2.default)(FacebookApi,[{key:"login",value:function(){var _login=(0,_asyncToGenerator2.default)(function*(config){yield this.options.tab.sendRequest(`async (utils, login, pass) => {
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
        }`,config.facebook.login,config.facebook.password);});function login(_x){return _login.apply(this,arguments);}return login;}()},{key:"logout",value:function(){var _logout=(0,_asyncToGenerator2.default)(function*(){yield this.options.tab.sendRequest(`async (utils) => {
            (await utils.waitForElement('svg > g > image')).closest('div').click();
            (/** @type { HTMLDivElement } */ (
                await utils.waitForElement('[data-visualcompletion="ignore-dynamic"][data-nocookies="true"] > div')
            )).click();
        }`);});function logout(){return _logout.apply(this,arguments);}return logout;}()},{key:"sendMessage",value:function(){var _sendMessage=(0,_asyncToGenerator2.default)(function*(names,message){var realNames={};for(var name of Array.isArray(names)?names:[names]){var realName=yield this.options.tab.sendRequest(`async (utils, name, message) => {
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
            }`,name,message);realNames[name]=realName||false;}console.debug('Facebook Plugin sendMessage():',realNames);yield this.setDefaultScreen();return realNames;});function sendMessage(_x2,_x3){return _sendMessage.apply(this,arguments);}return sendMessage;}()},{key:"getMessages",value:function(){var _getMessages=(0,_asyncToGenerator2.default)(function*(){var rememberlastMessage=arguments.length>0&&arguments[0]!==undefined?arguments[0]:true;var closeBrowserTab=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;var result=yield this.options.tab.sendRequest(`async (utils, rememberlastMessage) => {
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
        }`,rememberlastMessage);console.debug('Facebook Plugin getMessages():',result);yield this.setDefaultScreen(closeBrowserTab);for(var name in result){if(rememberlastMessage===true||typeof rememberlastMessage=='string'&&new RegExp(rememberlastMessage,'i').test(name)){var _result$name;for(var i in result[name]){var _pluginStorage$users$;if(result[name][i]===((_pluginStorage$users$=pluginStorage.users[name])==null?void 0:_pluginStorage$users$.lastMessage)){result[name]=result[name].slice(+i+1);if(!result[name].length)delete result[name];break;}}if((_result$name=result[name])!=null&&_result$name.length){if(!pluginStorage.users[name])pluginStorage.users[name]={lastMessage:result[name][result[name].length-1]};else pluginStorage.users[name].lastMessage=result[name][result[name].length-1];}}else if(typeof rememberlastMessage=='string')delete result[name];}console.debug('Facebook Plugin getMessages():',result);return result;});function getMessages(){return _getMessages.apply(this,arguments);}return getMessages;}()},{key:"setDefaultScreen",value:function(){var _setDefaultScreen=(0,_asyncToGenerator2.default)(function*(){var closeBrowserTab=arguments.length>0&&arguments[0]!==undefined?arguments[0]:false;yield this.options.tab.sendRequest(`async utils => {
            (/** @type { HTMLDivElement } */(
                await utils.waitForElement('a[role="link"] > i[data-visualcompletion="css-img"]')
            )).click();
        }`);closeBrowserTab&&(yield this.options.tab.destructor());});function setDefaultScreen(){return _setDefaultScreen.apply(this,arguments);}return setDefaultScreen;}()}]);return FacebookApi;}();
var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var addPlugin=function addPlugin(config,systemRequirements,pluginFunctions){return Object.assign({config:config,systemRequirements:systemRequirements},pluginFunctions);};var addCommand=function addCommand(sentenceMemberRequirements,execute){return{sentenceMemberRequirements:sentenceMemberRequirements,execute:execute};};var FacebookApi=require("./facebook.api");var options={};var api=new FacebookApi(options);var lastMessages='';module.exports=addPlugin({facebook:{login:'',password:'',automatic:{checkNewMessage:false}}},{os:{linux:true,darwin:true,win32:true,android:true,ios:true},pluginFormatVersion:1},{scriptStart:function(){var _scriptStart=(0,_asyncToGenerator2.default)(function*(config,services){options.tab=yield services.browserPluginStart('https://facebook.com/messages/t');});function scriptStart(_x,_x2){return _scriptStart.apply(this,arguments);}return scriptStart;}(),scriptDestructor:function(){var _scriptDestructor=(0,_asyncToGenerator2.default)(function*(config,services){yield api.logout();options.tab.destructor();});function scriptDestructor(_x3,_x4){return _scriptDestructor.apply(this,arguments);}return scriptDestructor;}(),scriptPerInterval:function(){var _scriptPerInterval=(0,_asyncToGenerator2.default)(function*(config,services){if(!config.facebook.automatic.checkNewMessage)return;yield options.tab.pause.start();try{yield api.login(config);var newMessages=yield api.getMessages(false,true);var friends=Object.keys(newMessages);var newMessagesString=JSON.stringify(newMessages);if(lastMessages!==newMessagesString){lastMessages=newMessagesString;if(friends.length>1)yield services.speech('Máš nové správy od priateľov '+friends.join(', ').replace(/, ([^,]+)$/,' a $1'));if(friends.length===1)yield services.speech('Máš novú správu od priateľa '+friends[0]);}}catch(err){throw err;}finally{options.tab.pause.stop();}});function scriptPerInterval(_x5,_x6){return _scriptPerInterval.apply(this,arguments);}return scriptPerInterval;}(),commands:[function(config,services){return{sentenceMemberRequirements:{_or:[{type:'question',predicates:{multiple:[{verbs:[{baseWord:/(na|od)písať/}]}]},objects:[{multiple:[{origWord:/niekto/}]}]},{type:'question',predicates:{multiple:[{verbs:[{baseWord:/mať|prísť/}]}]},objects:[{multiple:[{baseWord:/správa/}]}]}]},execute:function(){var _execute=(0,_asyncToGenerator2.default)(function*(getSummaryAccept,propName){yield options.tab.pause.start();try{yield services.speech('Pozriem...');yield options.tab.viewTab();yield api.login(config);var friends=Object.keys(yield api.getMessages(false));if(friends.length>1)yield services.speech('Máš nové správy od priateľov '+friends.join(', ').replace(/, ([^,]+)$/,' a $1'));if(friends.length===1)yield services.speech('Máš novú správu od priateľa '+friends[0]);if(friends.length===0)yield services.speech('Nemáš žiadne nové správy');}catch(err){throw err;}finally{options.tab.pause.stop();}});function execute(_x7,_x8){return _execute.apply(this,arguments);}return execute;}()};},function(config,services){return{sentenceMemberRequirements:{_or:[{type:'command',predicates:{multiple:[{verbs:[{baseWord:/prečítať/}]}]},objects:[{multiple:[{origWord:/správy|ich/}]}]}]},execute:function(){var _execute2=(0,_asyncToGenerator2.default)(function*(getSummaryAccept,propName){yield options.tab.pause.start();try{yield services.speech('Okamih...');yield options.tab.viewTab();yield api.login(config);var messages=yield api.getMessages(true);yield services.speech(Object.keys(messages).map(function(name){return`${name} píše, ${messages[name].join(' ')},`;}).join(' '));if(Object.keys(messages).length===0)yield services.speech('Nemáš žiadne nové správy');}catch(err){throw err;}finally{options.tab.pause.stop();}});function execute(_x9,_x10){return _execute2.apply(this,arguments);}return execute;}()};},function(config,services){return{sentenceMemberRequirements:{type:'question',predicates:{multiple:[{verbs:[{baseWord:[/(na|od)?písať/]}]}]},subjects:{multiple:[{propName:{friend:'required'}}]},objects:[{multiple:[{origWord:/čo/}]}]},execute:function(){var _execute3=(0,_asyncToGenerator2.default)(function*(getSummaryAccept,propName){yield options.tab.pause.start();try{yield services.speech('Pozriem...');yield options.tab.viewTab();yield api.login(config);var name=propName.friend.baseWord;var messages=yield api.getMessages(name);if(!Object.keys(messages).length)yield services.speech(`${name} ti nenapísal žiadnu novú správu.`);else yield services.speech(Object.keys(messages).map(function(name){return`${name} píše, ${messages[name].join(' ')},`;}).join(' '));}catch(err){throw err;}finally{options.tab.pause.stop();}});function execute(_x11,_x12){return _execute3.apply(this,arguments);}return execute;}()};},function(config,services){return{sentenceMemberRequirements:{type:'command',predicates:{multiple:[{verbs:[{baseWord:[/(na|od)?písať/,/(od|p)oslať/]}]}]},objects:[{multiple:[{baseWord:'správa'}]},{multiple:[{_or:[{case:{value:'datív'},propName:{friend:'required'}},{preposition:{origWord:'pre'},propName:{friend:'required'}}]}]}]},execute:function(){var _execute4=(0,_asyncToGenerator2.default)(function*(getSummaryAccept,propName){yield options.tab.pause.start();try{yield options.tab.viewTab();yield api.login(config);if(!propName.citation){var _yield$services$speec=yield services.speech('Môžeš diktovať',true),text=_yield$services$speec.text;propName.citation=text;}else yield services.speech('OK');var fiends=propName.friend.parent.multiple.map(function(f){return f.baseWord;});var preFriends=propName.friend.parent.multiple.filter(function(w){return w.preposition.origWord=='pre';}).map(function(f){return f.baseWord;});if(preFriends.length)fiends=preFriends;var realNames=yield api.sendMessage(fiends,'');var unfindedNames=fiends.filter(function(n){return!realNames[n];});if(unfindedNames.length){yield services.speech((unfindedNames.length>1?'Mená':'Meno')+unfindedNames.join(' a ')+' som v blízkych kontaktoch nenašiel.');}else if(yield getSummaryAccept('FacebookChat plugin: Poslať správu '+(Object.values(realNames).length===1?'priateľovi: ':'priateľom: ')+Object.values(realNames).join(', ')+' s textom: '+propName.citation)){yield api.sendMessage(fiends,propName.citation);yield services.speech('Odoslané...');}}catch(err){throw err;}finally{options.tab.pause.stop();}});function execute(_x13,_x14){return _execute4.apply(this,arguments);}return execute;}()};}]});
var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var fs=require('react-native-fs');module.exports=Object.assign({},fs,{readdir:function(){var _readdir=(0,_asyncToGenerator2.default)(function*(path){return(yield fs.readDir(path)).map(function(f){return f.name;});});function readdir(_x){return _readdir.apply(this,arguments);}return readdir;}()});
var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault");var _asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));var _require=require('react-native'),Platform=_require.Platform;var fs=require('react-native-fs');module.exports={resolve:function resolve(){return'';},join:function join(){return'';},platform:function platform(){return Platform.OS;},release:function release(){return Platform.Version;},machine:function machine(){return(Platform.__constants.Model.match(/^sdk_[^_]+_(.*)$/)||['',Platform.__constants.Model])[1];},readdir:function(){var _readdir=(0,_asyncToGenerator2.default)(function*(path){return(yield fs.readDir(path)).map(function(f){return f.name;});});function readdir(_x){return _readdir.apply(this,arguments);}return readdir;}(),DocumentDirectoryPath:fs.DocumentDirectoryPath};
module.exports=undefined;
