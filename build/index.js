const FacebookApi = require('./facebook.api');

/** @type {{ tab: import('jjplugin').BrowserPuppeteer }} */
// @ts-ignore
const options = {};
const api = new FacebookApi(options);

let lastMessages = '';

module.exports = require("server/types/pluginFunctions.cjs").addPlugin(
    {
        "facebook": {
            "login": { "type": "string" },
            "password": { "type": "string" },
            "automatic": {
                "checkNewMessage": {
                    "type": "boolean",
                    "value": false
                }
            }
        }
    }, {
        "os": {
            "linux": true,
            "darwin": true,
            "win32": true,
            "android": true,
            "ios": true
        },
        "pluginFormatVersion": 1
    }, {
        "scriptStart": async ctx => {
            options.tab = await ctx.browserPluginStart('https://facebook.com/messages/t');
        },
        "scriptDestructor": async ctx => {
            await api.logout();
            options.tab.destructor();
        },
        "scriptPerInterval": async ctx => {
            if (!ctx.config.facebook.automatic.checkNewMessage.value) return;
    
            let result = '';
    
            try {
                await options.tab.pause.start();
                await api.login(ctx.config);
    
                const newMessages = await api.getMessages(false, true);
                const friends = Object.keys(newMessages);
                const newMessagesString = JSON.stringify(newMessages);
    
                if (friends && friends.length && lastMessages !== newMessagesString) {
                    lastMessages = newMessagesString;
    
                    if (friends.length  >  1) result = 'Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1');
                    if (friends.length === 1) result = 'Máš novú správu od priateľa ' + friends[0];
                }
            }
            catch (err) { throw err; }
            finally { options.tab.pause.stop(); }
            return result;
        }
    }, {
        "sentenceMemberRequirements": {
            "_or": [
                {
                    "type": "question",
                    "predicates": {
                        "multiple": [
                            {
                                "verbs": [
                                    {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "Písal",
                                                "origIndex": 0,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 40752,
                                                "pos": {
                                                    "key": "V",
                                                    "name": "Slovní druh",
                                                    "value": "sloveso",
                                                    "subpos": {
                                                        "key": "p",
                                                        "value": "minulý čas",
                                                        "example": "(p) minulý čas - tvar minulého aktivního příčestí --> example: dělali"
                                                    }
                                                },
                                                "gender": {
                                                    "key": "Y",
                                                    "name": "Rod",
                                                    "value": "mužský {M, I}",
                                                    "example": "(Y) mužský {M, I} --> example: schopen, běhal, jeden, on"
                                                },
                                                "number": {
                                                    "key": "S",
                                                    "name": "Číslo",
                                                    "value": "jednotné",
                                                    "example": "(S) jednotné --> example: malá noha"
                                                },
                                                "tense": {
                                                    "key": "R",
                                                    "name": "Čas",
                                                    "value": "minulý",
                                                    "example": "(R) minulý --> example: psal, byl"
                                                },
                                                "negation": {
                                                    "key": "A",
                                                    "name": "Negace",
                                                    "value": "bez negácie",
                                                    "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                                },
                                                "voice": {
                                                    "key": "A",
                                                    "name": "Slovesný rod",
                                                    "value": "činný",
                                                    "example": "(A) činný --> example: píšu, pojedu, psala"
                                                }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /(na|od)?písať/i,
                                                "origIndex": 0,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 40752,
                                                "pos": {
                                                    "key": "V",
                                                    "name": "Slovní druh",
                                                    "value": "sloveso",
                                                    "subpos": {
                                                        "key": "p",
                                                        "value": "minulý čas",
                                                        "example": "(p) minulý čas - tvar minulého aktivního příčestí --> example: dělali"
                                                    }
                                                },
                                                "gender": {
                                                    "key": "Y",
                                                    "name": "Rod",
                                                    "value": "mužský {M, I}",
                                                    "example": "(Y) mužský {M, I} --> example: schopen, běhal, jeden, on"
                                                },
                                                "number": {
                                                    "key": "S",
                                                    "name": "Číslo",
                                                    "value": "jednotné",
                                                    "example": "(S) jednotné --> example: malá noha"
                                                },
                                                "tense": {
                                                    "key": "R",
                                                    "name": "Čas",
                                                    "value": "minulý",
                                                    "example": "(R) minulý --> example: psal, byl"
                                                },
                                                "negation": {
                                                    "key": "A",
                                                    "name": "Negace",
                                                    "value": "bez negácie",
                                                    "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                                },
                                                "voice": {
                                                    "key": "A",
                                                    "name": "Slovesný rod",
                                                    "value": "činný",
                                                    "example": "(A) činný --> example: píšu, pojedu, psala"
                                                }
                                            }
                                        ]
                                    }
                                ],
                                "propName": { "Písal": "required" }
                            }
                        ]
                    },
                    "subjects": {
                        "multiple": [
                            {
                                "origWord": "niekto",
                                "origIndex": 2,
                                "baseWord": "niekto",
                                "unknownWord": false,
                                "wordUsingFrequency": 31642,
                                "pos": {
                                    "key": "P",
                                    "name": "Slovní druh",
                                    "value": "zámeno",
                                    "subpos": {
                                        "key": "Z",
                                        "value": "neurčité",
                                        "example": "(Z) neurčité --> example: nějaký, číkoli, cosi"
                                    }
                                },
                                "gender": {
                                    "key": "M",
                                    "name": "Rod",
                                    "value": "mužský - životný",
                                    "example": "(M) mužský - životný --> example: učitel, mladí, oni"
                                },
                                "case": {
                                    "key": "1",
                                    "name": "Pád",
                                    "value": "nominatív",
                                    "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                },
                                "attributes": [  ],
                                "values": [  ]
                            }
                        ],
                        "propName": { "niekto": "optional" }
                    },
                    "objects": [
                        {
                            "multiple": [
                                {
                                    "origWord": "mi",
                                    "origIndex": 1,
                                    "baseWord": "ja",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 206096,
                                    "pos": {
                                        "key": "P",
                                        "name": "Slovní druh",
                                        "value": "zámeno",
                                        "subpos": {
                                            "key": "H",
                                            "value": "osobné - krátky tvar",
                                            "example": "(H) osobné - krátky tvar --> example: mě, mi, ti, mu"
                                        }
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "3",
                                        "name": "Pád",
                                        "value": "datív",
                                        "example": "(3) [komu/čomu] datív --> example: ženě, ženám"
                                    },
                                    "person": {
                                        "key": "1",
                                        "name": "Osoba",
                                        "value": "1.",
                                        "example": "(1) 1. --> example: píšu, píšeme, my"
                                    },
                                    "attributes": [  ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "mi": "required" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Facebooku",
                                    "origIndex": 4,
                                    "baseWord": "Facebook",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 5319,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 3,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /vo/i,
                                                "origIndex": 3,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Facebooku": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messengeri",
                                    "origIndex": 6,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 5,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /v/i,
                                                "origIndex": 5,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Messengeri": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messenger",
                                    "origIndex": 8,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "P",
                                        "name": "Číslo",
                                        "value": "množné",
                                        "example": "(P) množné --> example: dvě malé nohy"
                                    },
                                    "case": {
                                        "key": "4",
                                        "name": "Pád",
                                        "value": "akuzatív",
                                        "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "origWord": "na",
                                        "origIndex": 7,
                                        "baseWord": "na",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 2747148,
                                        "pos": {
                                            "key": "R",
                                            "name": "Slovní druh",
                                            "value": "predložka",
                                            "subpos": {
                                                "key": "R",
                                                "value": "bez vokálu",
                                                "example": "(R) bez vokálu --> example: v"
                                            }
                                        },
                                        "case": {
                                            "key": "4",
                                            "name": "Pád",
                                            "value": "akuzatív",
                                            "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                        },
                                        "propName": { "na": "required" }
                                    }
                                }
                            ],
                            "propName": { "Messenger": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messengera",
                                    "origIndex": 10,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "2",
                                        "name": "Pád",
                                        "value": "genitív",
                                        "example": "(2) [koho/čoho] genitív --> example: ženy, žen"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "origWord": "do",
                                        "origIndex": 9,
                                        "baseWord": "do",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 808316,
                                        "pos": {
                                            "key": "R",
                                            "name": "Slovní druh",
                                            "value": "predložka",
                                            "subpos": {
                                                "key": "R",
                                                "value": "bez vokálu",
                                                "example": "(R) bez vokálu --> example: v"
                                            }
                                        },
                                        "case": {
                                            "key": "2",
                                            "name": "Pád",
                                            "value": "genitív",
                                            "example": "(2) [koho/čoho] genitív --> example: ženy, žen"
                                        },
                                        "propName": { "do": "required" }
                                    }
                                }
                            ],
                            "propName": { "Messengera": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "správu",
                                    "origIndex": 12,
                                    "baseWord": "správa",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 67277,
                                    "explanation": "spravovanie;_inštitúcia",
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "F",
                                        "name": "Rod",
                                        "value": "ženský",
                                        "example": "(F) ženský --> example: píseň, malá"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "4",
                                        "name": "Pád",
                                        "value": "akuzatív",
                                        "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [
                                        {
                                            "origWord": "novú",
                                            "origIndex": 11,
                                            "baseWord": "nový",
                                            "unknownWord": false,
                                            "wordUsingFrequency": 261966,
                                            "pos": {
                                                "key": "A",
                                                "name": "Slovní druh",
                                                "value": "prídavné meno",
                                                "subpos": {
                                                    "key": "A",
                                                    "value": "základné",
                                                    "example": "(A) základné --> example: technický"
                                                }
                                            },
                                            "gender": {
                                                "key": "F",
                                                "name": "Rod",
                                                "value": "ženský",
                                                "example": "(F) ženský --> example: píseň, malá"
                                            },
                                            "number": {
                                                "key": "S",
                                                "name": "Číslo",
                                                "value": "jednotné",
                                                "example": "(S) jednotné --> example: malá noha"
                                            },
                                            "case": {
                                                "key": "4",
                                                "name": "Pád",
                                                "value": "akuzatív",
                                                "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                            },
                                            "grade": {
                                                "key": "1",
                                                "name": "Stupeň",
                                                "value": "1.",
                                                "example": "(1) 1. --> example: velká, pěkně"
                                            },
                                            "negation": {
                                                "key": "A",
                                                "name": "Negace",
                                                "value": "bez negácie",
                                                "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                            },
                                            "propName": { "novú": "optional" }
                                        }
                                    ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "správu": "optional" }
                        }
                    ],
                    "adverbs": [  ],
                    "dateTimes": [  ],
                    "cronString": [  ],
                    "example": "Písal<(na|od)?písať> mi ?niekto na<vo> ?Facebooku na<v> ?Messengeri na ?Messenger do ?Messengera ?novú ?správu ?"
                }, {
                    "type": "question",
                    "predicates": {
                        "multiple": [
                            {
                                "verbs": [
                                    {
                                        "origWord": "Mám",
                                        "origIndex": 0,
                                        "baseWord": "mať",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 709895,
                                        "explanation": "vlastniť",
                                        "pos": {
                                            "key": "V",
                                            "name": "Slovní druh",
                                            "value": "sloveso",
                                            "subpos": {
                                                "key": "B",
                                                "value": "prítomný a budúci čas",
                                                "example": "(B) prítomný a budúci čas --> example: dělám"
                                            }
                                        },
                                        "number": {
                                            "key": "S",
                                            "name": "Číslo",
                                            "value": "jednotné",
                                            "example": "(S) jednotné --> example: malá noha"
                                        },
                                        "person": {
                                            "key": "1",
                                            "name": "Osoba",
                                            "value": "1.",
                                            "example": "(1) 1. --> example: píšu, píšeme, my"
                                        },
                                        "tense": {
                                            "key": "P",
                                            "name": "Čas",
                                            "value": "prítomný",
                                            "example": "(P) prítomný --> example: napíšu, píšu, jsem"
                                        },
                                        "negation": {
                                            "key": "A",
                                            "name": "Negace",
                                            "value": "bez negácie",
                                            "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                        },
                                        "voice": {
                                            "key": "A",
                                            "name": "Slovesný rod",
                                            "value": "činný",
                                            "example": "(A) činný --> example: píšu, pojedu, psala"
                                        }
                                    }
                                ],
                                "propName": { "Mám": "required" }
                            }
                        ]
                    },
                    "subjects": {
                        "multiple": [
                            {
                                "origWord": "ja",
                                "baseWord": "ja",
                                "origIndex": -1,
                                "number": {
                                    "key": "S",
                                    "name": "Číslo",
                                    "value": "jednotné",
                                    "example": "(S) jednotné --> example: malá noha"
                                },
                                "case": {
                                    "name": "Pád",
                                    "key": "1",
                                    "value": "nominatív"
                                },
                                "person": {
                                    "key": "1",
                                    "name": "Osoba",
                                    "value": "1.",
                                    "example": "(1) 1. --> example: píšu, píšeme, my"
                                },
                                "attributes": [  ],
                                "values": [  ],
                                "pos": {
                                    "name": "Slovní druh",
                                    "key": "P",
                                    "value": "zámeno",
                                    "subpos": {
                                        "key": "P",
                                        "value": "osobné"
                                    }
                                }
                            }
                        ],
                        "propName": { "ja": "optional" }
                    },
                    "objects": [
                        {
                            "multiple": [
                                {
                                    "origWord": "správu",
                                    "origIndex": 2,
                                    "baseWord": "správa",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 67277,
                                    "explanation": "spravovanie;_inštitúcia",
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "F",
                                        "name": "Rod",
                                        "value": "ženský",
                                        "example": "(F) ženský --> example: píseň, malá"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "4",
                                        "name": "Pád",
                                        "value": "akuzatív",
                                        "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [
                                        {
                                            "origWord": "novú",
                                            "origIndex": 1,
                                            "baseWord": "nový",
                                            "unknownWord": false,
                                            "wordUsingFrequency": 261966,
                                            "pos": {
                                                "key": "A",
                                                "name": "Slovní druh",
                                                "value": "prídavné meno",
                                                "subpos": {
                                                    "key": "A",
                                                    "value": "základné",
                                                    "example": "(A) základné --> example: technický"
                                                }
                                            },
                                            "gender": {
                                                "key": "F",
                                                "name": "Rod",
                                                "value": "ženský",
                                                "example": "(F) ženský --> example: píseň, malá"
                                            },
                                            "number": {
                                                "key": "S",
                                                "name": "Číslo",
                                                "value": "jednotné",
                                                "example": "(S) jednotné --> example: malá noha"
                                            },
                                            "case": {
                                                "key": "4",
                                                "name": "Pád",
                                                "value": "akuzatív",
                                                "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                            },
                                            "grade": {
                                                "key": "1",
                                                "name": "Stupeň",
                                                "value": "1.",
                                                "example": "(1) 1. --> example: velká, pěkně"
                                            },
                                            "negation": {
                                                "key": "A",
                                                "name": "Negace",
                                                "value": "bez negácie",
                                                "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                            },
                                            "propName": { "novú": "optional" }
                                        }
                                    ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "správu": "required" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Facebooku",
                                    "origIndex": 4,
                                    "baseWord": "Facebook",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 5319,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 3,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /vo/i,
                                                "origIndex": 3,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Facebooku": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messengeri",
                                    "origIndex": 6,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 5,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /v/i,
                                                "origIndex": 5,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Messengeri": "optional" }
                        }
                    ],
                    "adverbs": [  ],
                    "dateTimes": [  ],
                    "cronString": [  ],
                    "example": "Mám ?novú správu na<vo> ?Facebooku na<v> ?Messengeri ?"
                }, {
                    "type": "question",
                    "predicates": {
                        "multiple": [
                            {
                                "verbs": [
                                    {
                                        "origWord": "Prišla",
                                        "origIndex": 0,
                                        "baseWord": "prísť",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 60859,
                                        "pos": {
                                            "key": "V",
                                            "name": "Slovní druh",
                                            "value": "sloveso",
                                            "subpos": {
                                                "key": "p",
                                                "value": "minulý čas",
                                                "example": "(p) minulý čas - tvar minulého aktivního příčestí --> example: dělali"
                                            }
                                        },
                                        "gender": {
                                            "key": "F",
                                            "name": "Rod",
                                            "value": "ženský",
                                            "example": "(F) ženský --> example: píseň, malá"
                                        },
                                        "number": {
                                            "key": "S",
                                            "name": "Číslo",
                                            "value": "jednotné",
                                            "example": "(S) jednotné --> example: malá noha"
                                        },
                                        "tense": {
                                            "key": "R",
                                            "name": "Čas",
                                            "value": "minulý",
                                            "example": "(R) minulý --> example: psal, byl"
                                        },
                                        "negation": {
                                            "key": "A",
                                            "name": "Negace",
                                            "value": "bez negácie",
                                            "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                        },
                                        "voice": {
                                            "key": "A",
                                            "name": "Slovesný rod",
                                            "value": "činný",
                                            "example": "(A) činný --> example: píšu, pojedu, psala"
                                        }
                                    }
                                ],
                                "propName": { "Prišla": "required" }
                            }
                        ]
                    },
                    "subjects": {
                        "multiple": [
                            {
                                "origWord": "Facebooku",
                                "origIndex": 8,
                                "baseWord": "Facebook",
                                "unknownWord": true,
                                "wordUsingFrequency": 5319,
                                "pos": {
                                    "key": "N",
                                    "name": "Slovní druh",
                                    "value": "podstatné meno",
                                    "subpos": { "key": "N" }
                                },
                                "gender": {
                                    "key": "F",
                                    "name": "Rod",
                                    "value": "ženský",
                                    "example": "(F) ženský --> example: píseň, malá"
                                },
                                "number": {
                                    "key": "S",
                                    "name": "Číslo",
                                    "value": "jednotné",
                                    "example": "(S) jednotné --> example: malá noha"
                                },
                                "case": {
                                    "key": "2",
                                    "name": "Pád",
                                    "value": "genitív",
                                    "example": "(2) [koho/čoho] genitív --> example: ženy, žen"
                                },
                                "negation": {
                                    "key": "A",
                                    "name": "Negace",
                                    "value": "bez negácie",
                                    "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                },
                                "attributes": [  ],
                                "values": [  ],
                                "preposition": {
                                    "origWord": "do",
                                    "origIndex": 7,
                                    "baseWord": "do",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 808316,
                                    "pos": {
                                        "key": "R",
                                        "name": "Slovní druh",
                                        "value": "predložka",
                                        "subpos": {
                                            "key": "R",
                                            "value": "bez vokálu",
                                            "example": "(R) bez vokálu --> example: v"
                                        }
                                    },
                                    "case": {
                                        "key": "2",
                                        "name": "Pád",
                                        "value": "genitív",
                                        "example": "(2) [koho/čoho] genitív --> example: ženy, žen"
                                    },
                                    "propName": { "do": "required" }
                                }
                            }
                        ],
                        "propName": { "Facebooku": "optional" }
                    },
                    "objects": [
                        {
                            "multiple": [
                                {
                                    "origWord": "mi",
                                    "origIndex": 1,
                                    "baseWord": "ja",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 206096,
                                    "pos": {
                                        "key": "P",
                                        "name": "Slovní druh",
                                        "value": "zámeno",
                                        "subpos": {
                                            "key": "H",
                                            "value": "osobné - krátky tvar",
                                            "example": "(H) osobné - krátky tvar --> example: mě, mi, ti, mu"
                                        }
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "3",
                                        "name": "Pád",
                                        "value": "datív",
                                        "example": "(3) [komu/čomu] datív --> example: ženě, ženám"
                                    },
                                    "person": {
                                        "key": "1",
                                        "name": "Osoba",
                                        "value": "1.",
                                        "example": "(1) 1. --> example: píšu, píšeme, my"
                                    },
                                    "attributes": [  ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "mi": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Facebook",
                                    "origIndex": 6,
                                    "baseWord": "Facebook",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 5319,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "P",
                                        "name": "Číslo",
                                        "value": "množné",
                                        "example": "(P) množné --> example: dvě malé nohy"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "origWord": "na",
                                        "origIndex": 5,
                                        "baseWord": "na",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 2747148,
                                        "pos": {
                                            "key": "R",
                                            "name": "Slovní druh",
                                            "value": "predložka",
                                            "subpos": {
                                                "key": "R",
                                                "value": "bez vokálu",
                                                "example": "(R) bez vokálu --> example: v"
                                            }
                                        },
                                        "case": {
                                            "key": "6",
                                            "name": "Pád",
                                            "value": "lokál",
                                            "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                        },
                                        "propName": { "na": "required" }
                                    }
                                }
                            ],
                            "propName": { "Facebook": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "_or": [
                                        {
                                            "baseWord": /.+/i,
                                            "origWord": "nejaká",
                                            "origIndex": 2,
                                            "unknownWord": false,
                                            "wordUsingFrequency": 47326,
                                            "pos": {
                                                "key": "P",
                                                "name": "Slovní druh",
                                                "value": "zámeno",
                                                "subpos": {
                                                    "key": "Z",
                                                    "value": "neurčité",
                                                    "example": "(Z) neurčité --> example: nějaký, číkoli, cosi"
                                                }
                                            },
                                            "gender": {
                                                "key": "F",
                                                "name": "Rod",
                                                "value": "ženský",
                                                "example": "(F) ženský --> example: píseň, malá"
                                            },
                                            "number": {
                                                "key": "S",
                                                "name": "Číslo",
                                                "value": "jednotné",
                                                "example": "(S) jednotné --> example: malá noha"
                                            },
                                            "case": {
                                                "key": "1",
                                                "name": "Pád",
                                                "value": "nominatív",
                                                "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                            },
                                            "attributes": [  ],
                                            "values": [  ]
                                        }, {
                                            "origWord": /.+/i,
                                            "baseWord": /dajaký/i,
                                            "origIndex": 2,
                                            "unknownWord": false,
                                            "wordUsingFrequency": 47326,
                                            "pos": {
                                                "key": "P",
                                                "name": "Slovní druh",
                                                "value": "zámeno",
                                                "subpos": {
                                                    "key": "Z",
                                                    "value": "neurčité",
                                                    "example": "(Z) neurčité --> example: nějaký, číkoli, cosi"
                                                }
                                            },
                                            "gender": {
                                                "key": "F",
                                                "name": "Rod",
                                                "value": "ženský",
                                                "example": "(F) ženský --> example: píseň, malá"
                                            },
                                            "number": {
                                                "key": "S",
                                                "name": "Číslo",
                                                "value": "jednotné",
                                                "example": "(S) jednotné --> example: malá noha"
                                            },
                                            "case": {
                                                "key": "1",
                                                "name": "Pád",
                                                "value": "nominatív",
                                                "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                            },
                                            "attributes": [  ],
                                            "values": [  ]
                                        }
                                    ]
                                }
                            ],
                            "propName": { "nejaká": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messenger",
                                    "origIndex": 10,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "P",
                                        "name": "Číslo",
                                        "value": "množné",
                                        "example": "(P) množné --> example: dvě malé nohy"
                                    },
                                    "case": {
                                        "key": "4",
                                        "name": "Pád",
                                        "value": "akuzatív",
                                        "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "origWord": "na",
                                        "origIndex": 9,
                                        "baseWord": "na",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 2747148,
                                        "pos": {
                                            "key": "R",
                                            "name": "Slovní druh",
                                            "value": "predložka",
                                            "subpos": {
                                                "key": "R",
                                                "value": "bez vokálu",
                                                "example": "(R) bez vokálu --> example: v"
                                            }
                                        },
                                        "case": {
                                            "key": "4",
                                            "name": "Pád",
                                            "value": "akuzatív",
                                            "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                        },
                                        "propName": { "na": "required" }
                                    }
                                }
                            ],
                            "propName": { "Messenger": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messengera",
                                    "origIndex": 12,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "2",
                                        "name": "Pád",
                                        "value": "genitív",
                                        "example": "(2) [koho/čoho] genitív --> example: ženy, žen"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "origWord": "do",
                                        "origIndex": 11,
                                        "baseWord": "do",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 808316,
                                        "pos": {
                                            "key": "R",
                                            "name": "Slovní druh",
                                            "value": "predložka",
                                            "subpos": {
                                                "key": "R",
                                                "value": "bez vokálu",
                                                "example": "(R) bez vokálu --> example: v"
                                            }
                                        },
                                        "case": {
                                            "key": "2",
                                            "name": "Pád",
                                            "value": "genitív",
                                            "example": "(2) [koho/čoho] genitív --> example: ženy, žen"
                                        },
                                        "propName": { "do": "required" }
                                    }
                                }
                            ],
                            "propName": { "Messengera": "optional" }
                        }
                    ],
                    "adverbs": [  ],
                    "dateTimes": [  ],
                    "cronString": [  ],
                    "example": "Prišla ?mi ?nejaká<dajaký> ?nová správa na ?Facebook do ?Facebooku na ?Messenger do ?Messengera ?"
                }
            ]
        }
    },
    async ctx => {
        let result = '';
        
        try {
            await ctx.speech('Pozriem Facebook...');
            await options.tab.pause.start();
            await options.tab.viewTab();
            await api.login(ctx.config);
    
            const friends = Object.keys(await api.getMessages(false));
            if (friends.length  >  1) result = 'Máš nové správy od priateľov ' + friends.join(', ').replace(/, ([^,]+)$/, ' a $1');
            if (friends.length === 1) result = 'Máš novú správu od priateľa ' + friends[0];
            if (friends.length === 0) result = 'Nemáš žiadne nové správy';
        }
        catch (err) { throw err; }
        finally { options.tab.pause.stop(); }
        return result;
    }, {
        "sentenceMemberRequirements": {
            "_or": [
                {
                    "type": "command",
                    "predicates": {
                        "multiple": [
                            {
                                "verbs": [
                                    {
                                        "origWord": "Prečítaj",
                                        "origIndex": 0,
                                        "baseWord": "prečítať",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 9136,
                                        "pos": {
                                            "key": "V",
                                            "name": "Slovní druh",
                                            "value": "sloveso",
                                            "subpos": {
                                                "key": "i",
                                                "value": "rozkazovacie",
                                                "example": "(i) rozkazovacie --> example: dělejme"
                                            }
                                        },
                                        "number": {
                                            "key": "S",
                                            "name": "Číslo",
                                            "value": "jednotné",
                                            "example": "(S) jednotné --> example: malá noha"
                                        },
                                        "person": {
                                            "key": "2",
                                            "name": "Osoba",
                                            "value": "2.",
                                            "example": "(2) 2. --> example: píšeš, píšete, ty"
                                        },
                                        "negation": {
                                            "key": "A",
                                            "name": "Negace",
                                            "value": "bez negácie",
                                            "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                        }
                                    }
                                ],
                                "propName": { "Prečítaj": "required" }
                            }
                        ]
                    },
                    "subjects": {
                        "multiple": [
                            {
                                "origWord": "ty",
                                "baseWord": "ty",
                                "origIndex": -1,
                                "number": {
                                    "key": "S",
                                    "name": "Číslo",
                                    "value": "jednotné",
                                    "example": "(S) jednotné --> example: malá noha"
                                },
                                "case": {
                                    "name": "Pád",
                                    "key": "1",
                                    "value": "nominatív"
                                },
                                "person": {
                                    "key": "2",
                                    "name": "Osoba",
                                    "value": "2.",
                                    "example": "(2) 2. --> example: píšeš, píšete, ty"
                                },
                                "attributes": [  ],
                                "values": [  ],
                                "pos": {
                                    "name": "Slovní druh",
                                    "key": "P",
                                    "value": "zámeno",
                                    "subpos": {
                                        "key": "P",
                                        "value": "osobné"
                                    }
                                }
                            }
                        ],
                        "propName": { "ty": "optional" }
                    },
                    "objects": [
                        {
                            "multiple": [
                                {
                                    "origWord": "mi",
                                    "origIndex": 1,
                                    "baseWord": "ja",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 206096,
                                    "pos": {
                                        "key": "P",
                                        "name": "Slovní druh",
                                        "value": "zámeno",
                                        "subpos": {
                                            "key": "H",
                                            "value": "osobné - krátky tvar",
                                            "example": "(H) osobné - krátky tvar --> example: mě, mi, ti, mu"
                                        }
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "3",
                                        "name": "Pád",
                                        "value": "datív",
                                        "example": "(3) [komu/čomu] datív --> example: ženě, ženám"
                                    },
                                    "person": {
                                        "key": "1",
                                        "name": "Osoba",
                                        "value": "1.",
                                        "example": "(1) 1. --> example: píšu, píšeme, my"
                                    },
                                    "attributes": [  ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "mi": "required" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "všetky",
                                    "origIndex": 2,
                                    "baseWord": "všetko",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 69,
                                    "pos": {
                                        "key": "P",
                                        "name": "Slovní druh",
                                        "value": "zámeno",
                                        "subpos": {
                                            "key": "L",
                                            "value": "neurčité - extrémy - kladné",
                                            "example": "(L) neurčité - extrémy - kladné --> example: všechen, sám"
                                        }
                                    },
                                    "gender": {
                                        "key": "F",
                                        "name": "Rod",
                                        "value": "ženský",
                                        "example": "(F) ženský --> example: píseň, malá"
                                    },
                                    "number": {
                                        "key": "P",
                                        "name": "Číslo",
                                        "value": "množné",
                                        "example": "(P) množné --> example: dvě malé nohy"
                                    },
                                    "case": {
                                        "key": "4",
                                        "name": "Pád",
                                        "value": "akuzatív",
                                        "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                    },
                                    "attributes": [  ],
                                    "values": [  ]
                                }, {
                                    "origWord": "správy",
                                    "origIndex": 4,
                                    "baseWord": "správa",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 67277,
                                    "explanation": "spravovanie;_inštitúcia",
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "F",
                                        "name": "Rod",
                                        "value": "ženský",
                                        "example": "(F) ženský --> example: píseň, malá"
                                    },
                                    "number": {
                                        "key": "P",
                                        "name": "Číslo",
                                        "value": "množné",
                                        "example": "(P) množné --> example: dvě malé nohy"
                                    },
                                    "case": {
                                        "key": "4",
                                        "name": "Pád",
                                        "value": "akuzatív",
                                        "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [
                                        {
                                            "origWord": "všetky",
                                            "origIndex": 2,
                                            "baseWord": "všetko",
                                            "unknownWord": false,
                                            "wordUsingFrequency": 69,
                                            "pos": {
                                                "key": "P",
                                                "name": "Slovní druh",
                                                "value": "zámeno",
                                                "subpos": {
                                                    "key": "L",
                                                    "value": "neurčité - extrémy - kladné",
                                                    "example": "(L) neurčité - extrémy - kladné --> example: všechen, sám"
                                                }
                                            },
                                            "gender": {
                                                "key": "F",
                                                "name": "Rod",
                                                "value": "ženský",
                                                "example": "(F) ženský --> example: píseň, malá"
                                            },
                                            "number": {
                                                "key": "P",
                                                "name": "Číslo",
                                                "value": "množné",
                                                "example": "(P) množné --> example: dvě malé nohy"
                                            },
                                            "case": {
                                                "key": "1",
                                                "name": "Pád",
                                                "value": "nominatív",
                                                "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                            },
                                            "propName": { "všetky": "optional" }
                                        }, {
                                            "origWord": "nové",
                                            "origIndex": 3,
                                            "baseWord": "nový",
                                            "unknownWord": false,
                                            "wordUsingFrequency": 261966,
                                            "pos": {
                                                "key": "A",
                                                "name": "Slovní druh",
                                                "value": "prídavné meno",
                                                "subpos": {
                                                    "key": "A",
                                                    "value": "základné",
                                                    "example": "(A) základné --> example: technický"
                                                }
                                            },
                                            "gender": {
                                                "key": "F",
                                                "name": "Rod",
                                                "value": "ženský",
                                                "example": "(F) ženský --> example: píseň, malá"
                                            },
                                            "number": {
                                                "key": "P",
                                                "name": "Číslo",
                                                "value": "množné",
                                                "example": "(P) množné --> example: dvě malé nohy"
                                            },
                                            "case": {
                                                "key": "4",
                                                "name": "Pád",
                                                "value": "akuzatív",
                                                "example": "(4) [koho/čo] akuzatív --> example: ženu, ženy"
                                            },
                                            "grade": {
                                                "key": "1",
                                                "name": "Stupeň",
                                                "value": "1.",
                                                "example": "(1) 1. --> example: velká, pěkně"
                                            },
                                            "negation": {
                                                "key": "A",
                                                "name": "Negace",
                                                "value": "bez negácie",
                                                "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                            },
                                            "propName": { "nové": "required" }
                                        }
                                    ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "všetky": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Facebooku",
                                    "origIndex": 6,
                                    "baseWord": "Facebook",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 5319,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 5,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /vo|z/i,
                                                "origIndex": 5,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Facebooku": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messengeri",
                                    "origIndex": 8,
                                    "baseWord": "Messenger",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 258,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 7,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /v/i,
                                                "origIndex": 7,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Messengeri": "optional" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Messengera",
                                    "origIndex": 10,
                                    "baseWord": "Messengera",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 0,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "F",
                                        "name": "Rod",
                                        "value": "ženský",
                                        "example": "(F) ženský --> example: píseň, malá"
                                    },
                                    "number": {
                                        "key": "X",
                                        "name": "Číslo",
                                        "value": "pomnožné",
                                        "example": "(X) pomnožné --> example: Any finále, jejich"
                                    },
                                    "case": {
                                        "key": "X",
                                        "name": "Pád",
                                        "value": "neurčitý",
                                        "example": "(X) neurčitý --> example: finále"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [
                                        {
                                            "origWord": "z",
                                            "origIndex": 9,
                                            "baseWord": "z",
                                            "unknownWord": false,
                                            "wordUsingFrequency": 1337560,
                                            "explanation": "označenie_pomocou_písmena",
                                            "pos": {
                                                "key": "N",
                                                "name": "Slovní druh",
                                                "value": "podstatné meno",
                                                "subpos": { "key": "N" }
                                            },
                                            "gender": {
                                                "key": "N",
                                                "name": "Rod",
                                                "value": "stredný",
                                                "example": "(N) stredný --> example: město, malé, běhalo"
                                            },
                                            "number": {
                                                "key": "X",
                                                "name": "Číslo",
                                                "value": "pomnožné",
                                                "example": "(X) pomnožné --> example: Any finále, jejich"
                                            },
                                            "case": {
                                                "key": "X",
                                                "name": "Pád",
                                                "value": "neurčitý",
                                                "example": "(X) neurčitý --> example: finále"
                                            },
                                            "negation": {
                                                "key": "A",
                                                "name": "Negace",
                                                "value": "bez negácie",
                                                "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                            },
                                            "propName": { "z": "required" }
                                        }
                                    ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "Messengera": "optional" }
                        }
                    ],
                    "adverbs": [  ],
                    "dateTimes": [  ],
                    "cronString": [  ],
                    "example": "Prečítaj mi ?všetky nové správy na<vo|z> ?Facebooku na<v> ?Messengeri z ?Messengera !"
                }
            ]
        }
    },
    async ctx => {
        let result = '';
    
        try {
            await ctx.speech('Pozriem Facebook...');
            await options.tab.pause.start();
            await options.tab.viewTab();
            await api.login(ctx.config);
    
            let messages = await api.getMessages(true);
            if (Object.keys(messages).length === 0) result = 'Nemáš žiadne nové správy';
            else result = Object.keys(messages).map(name => `${name} píše, ${messages[name].join(', ')},`).join(', ');
        }
        catch (err) { throw err; }
        finally { options.tab.pause.stop(); }
        return result;
    }, {
        "sentenceMemberRequirements": {
            "_or": [
                {
                    "type": "question",
                    "predicates": {
                        "multiple": [
                            {
                                "verbs": [
                                    {
                                        "origWord": "píše",
                                        "origIndex": 2,
                                        "baseWord": "písať",
                                        "unknownWord": false,
                                        "wordUsingFrequency": 40752,
                                        "pos": {
                                            "key": "V",
                                            "name": "Slovní druh",
                                            "value": "sloveso",
                                            "subpos": {
                                                "key": "B",
                                                "value": "prítomný a budúci čas",
                                                "example": "(B) prítomný a budúci čas --> example: dělám"
                                            }
                                        },
                                        "number": {
                                            "key": "S",
                                            "name": "Číslo",
                                            "value": "jednotné",
                                            "example": "(S) jednotné --> example: malá noha"
                                        },
                                        "person": {
                                            "key": "3",
                                            "name": "Osoba",
                                            "value": "3.",
                                            "example": "(3) 3. --> example: píše, píšou, ony"
                                        },
                                        "tense": {
                                            "key": "P",
                                            "name": "Čas",
                                            "value": "prítomný",
                                            "example": "(P) prítomný --> example: napíšu, píšu, jsem"
                                        },
                                        "negation": {
                                            "key": "A",
                                            "name": "Negace",
                                            "value": "bez negácie",
                                            "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                        },
                                        "voice": {
                                            "key": "A",
                                            "name": "Slovesný rod",
                                            "value": "činný",
                                            "example": "(A) činný --> example: píšu, pojedu, psala"
                                        }
                                    }
                                ],
                                "propName": { "píše": "required" }
                            }
                        ]
                    },
                    "subjects": {
                        "multiple": [
                            {
                                "origWord": "Messengeri",
                                "origIndex": 7,
                                "baseWord": "Messenger",
                                "unknownWord": true,
                                "wordUsingFrequency": 258,
                                "pos": {
                                    "key": "N",
                                    "name": "Slovní druh",
                                    "value": "podstatné meno",
                                    "subpos": { "key": "N" }
                                },
                                "gender": {
                                    "key": "I",
                                    "name": "Rod",
                                    "value": "mužský - neživotný",
                                    "example": "(I) mužský - neživotný --> example: dům, malý"
                                },
                                "number": {
                                    "key": "S",
                                    "name": "Číslo",
                                    "value": "jednotné",
                                    "example": "(S) jednotné --> example: malá noha"
                                },
                                "case": {
                                    "key": "6",
                                    "name": "Pád",
                                    "value": "lokál",
                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                },
                                "negation": {
                                    "key": "A",
                                    "name": "Negace",
                                    "value": "bez negácie",
                                    "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                },
                                "attributes": [  ],
                                "values": [  ],
                                "preposition": {
                                    "_or": [
                                        {
                                            "baseWord": /.+/i,
                                            "origWord": "na",
                                            "origIndex": 6,
                                            "unknownWord": false,
                                            "wordUsingFrequency": 2747148,
                                            "pos": {
                                                "key": "R",
                                                "name": "Slovní druh",
                                                "value": "predložka",
                                                "subpos": {
                                                    "key": "R",
                                                    "value": "bez vokálu",
                                                    "example": "(R) bez vokálu --> example: v"
                                                }
                                            },
                                            "case": {
                                                "key": "6",
                                                "name": "Pád",
                                                "value": "lokál",
                                                "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                            },
                                            "propName": { "na": "required" }
                                        }, {
                                            "origWord": /.+/i,
                                            "baseWord": /v/i,
                                            "origIndex": 6,
                                            "unknownWord": false,
                                            "wordUsingFrequency": 2747148,
                                            "pos": {
                                                "key": "R",
                                                "name": "Slovní druh",
                                                "value": "predložka",
                                                "subpos": {
                                                    "key": "R",
                                                    "value": "bez vokálu",
                                                    "example": "(R) bez vokálu --> example: v"
                                                }
                                            },
                                            "case": {
                                                "key": "6",
                                                "name": "Pád",
                                                "value": "lokál",
                                                "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                            },
                                            "propName": { "na": "required" }
                                        }
                                    ]
                                }
                            }
                        ],
                        "propName": { "Messengeri": "optional" }
                    },
                    "objects": [
                        {
                            "multiple": [
                                {
                                    "origWord": "mi",
                                    "origIndex": 1,
                                    "baseWord": "ja",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 206096,
                                    "pos": {
                                        "key": "P",
                                        "name": "Slovní druh",
                                        "value": "zámeno",
                                        "subpos": {
                                            "key": "H",
                                            "value": "osobné - krátky tvar",
                                            "example": "(H) osobné - krátky tvar --> example: mě, mi, ti, mu"
                                        }
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "3",
                                        "name": "Pád",
                                        "value": "datív",
                                        "example": "(3) [komu/čomu] datív --> example: ženě, ženám"
                                    },
                                    "person": {
                                        "key": "1",
                                        "name": "Osoba",
                                        "value": "1.",
                                        "example": "(1) 1. --> example: píšu, píšeme, my"
                                    },
                                    "attributes": [  ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "mi": "required" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Čo",
                                    "origIndex": 0,
                                    "baseWord": "čo",
                                    "unknownWord": false,
                                    "wordUsingFrequency": 460807,
                                    "pos": {
                                        "key": "P",
                                        "name": "Slovní druh",
                                        "value": "zámeno",
                                        "subpos": {
                                            "key": "Q",
                                            "value": "vzťažné alebo opytovacie čo",
                                            "example": "(Q) vzťažné alebo opytovacie --> example: co, copak, cožpak"
                                        }
                                    },
                                    "case": {
                                        "key": "1",
                                        "name": "Pád",
                                        "value": "nominatív",
                                        "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                    },
                                    "attributes": [  ],
                                    "values": [  ]
                                }
                            ],
                            "propName": { "Čo": "required" }
                        }, {
                            "multiple": [
                                {
                                    "_or": [
                                        {
                                            "baseWord": /.+/i,
                                            "origWord": "Adam",
                                            "origIndex": 3,
                                            "unknownWord": false,
                                            "wordUsingFrequency": 5325,
                                            "pos": {
                                                "key": "N",
                                                "name": "Slovní druh",
                                                "value": "podstatné meno",
                                                "subpos": { "key": "N" }
                                            },
                                            "gender": {
                                                "key": "M",
                                                "name": "Rod",
                                                "value": "mužský - životný",
                                                "example": "(M) mužský - životný --> example: učitel, mladí, oni"
                                            },
                                            "number": {
                                                "key": "S",
                                                "name": "Číslo",
                                                "value": "jednotné",
                                                "example": "(S) jednotné --> example: malá noha"
                                            },
                                            "case": {
                                                "key": "1",
                                                "name": "Pád",
                                                "value": "nominatív",
                                                "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                            },
                                            "negation": {
                                                "key": "A",
                                                "name": "Negace",
                                                "value": "bez negácie",
                                                "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                            },
                                            "attributes": [  ],
                                            "values": [  ]
                                        }, {
                                            "origWord": /.+/i,
                                            "baseWord": /.+/i,
                                            "origIndex": 3,
                                            "unknownWord": false,
                                            "wordUsingFrequency": 5325,
                                            "pos": {
                                                "key": "N",
                                                "name": "Slovní druh",
                                                "value": "podstatné meno",
                                                "subpos": { "key": "N" }
                                            },
                                            "gender": {
                                                "key": "M",
                                                "name": "Rod",
                                                "value": "mužský - životný",
                                                "example": "(M) mužský - životný --> example: učitel, mladí, oni"
                                            },
                                            "number": {
                                                "key": "S",
                                                "name": "Číslo",
                                                "value": "jednotné",
                                                "example": "(S) jednotné --> example: malá noha"
                                            },
                                            "case": {
                                                "key": "1",
                                                "name": "Pád",
                                                "value": "nominatív",
                                                "example": "(1) [kto/čo] nominatív --> example: žena, ženy"
                                            },
                                            "negation": {
                                                "key": "A",
                                                "name": "Negace",
                                                "value": "bez negácie",
                                                "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                            },
                                            "attributes": [  ],
                                            "values": [  ]
                                        }
                                    ]
                                }
                            ],
                            "propName": { "Adam": "required" }
                        }, {
                            "multiple": [
                                {
                                    "origWord": "Facebooku",
                                    "origIndex": 5,
                                    "baseWord": "Facebook",
                                    "unknownWord": true,
                                    "wordUsingFrequency": 5319,
                                    "pos": {
                                        "key": "N",
                                        "name": "Slovní druh",
                                        "value": "podstatné meno",
                                        "subpos": { "key": "N" }
                                    },
                                    "gender": {
                                        "key": "I",
                                        "name": "Rod",
                                        "value": "mužský - neživotný",
                                        "example": "(I) mužský - neživotný --> example: dům, malý"
                                    },
                                    "number": {
                                        "key": "S",
                                        "name": "Číslo",
                                        "value": "jednotné",
                                        "example": "(S) jednotné --> example: malá noha"
                                    },
                                    "case": {
                                        "key": "6",
                                        "name": "Pád",
                                        "value": "lokál",
                                        "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                    },
                                    "negation": {
                                        "key": "A",
                                        "name": "Negace",
                                        "value": "bez negácie",
                                        "example": "(A) bez negácie --> example: velká, pěkně, přišel, ochota"
                                    },
                                    "attributes": [  ],
                                    "values": [  ],
                                    "preposition": {
                                        "_or": [
                                            {
                                                "baseWord": /.+/i,
                                                "origWord": "na",
                                                "origIndex": 4,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }, {
                                                "origWord": /.+/i,
                                                "baseWord": /vo/i,
                                                "origIndex": 4,
                                                "unknownWord": false,
                                                "wordUsingFrequency": 2747148,
                                                "pos": {
                                                    "key": "R",
                                                    "name": "Slovní druh",
                                                    "value": "predložka",
                                                    "subpos": {
                                                        "key": "R",
                                                        "value": "bez vokálu",
                                                        "example": "(R) bez vokálu --> example: v"
                                                    }
                                                },
                                                "case": {
                                                    "key": "6",
                                                    "name": "Pád",
                                                    "value": "lokál",
                                                    "example": "(6) [o kom/o čom] lokál --> example: ženě, ženách"
                                                },
                                                "propName": { "na": "required" }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "propName": { "Facebooku": "optional" }
                        }
                    ],
                    "adverbs": [  ],
                    "dateTimes": [  ],
                    "cronString": [  ],
                    "example": "Čo mi píše Adam<.+> na<vo> ?Facebooku na<v> ?Messengeri ?"
                }
            ]
        }
    },
    async ctx => {
        let result = '';
    
        try {
            await ctx.speech('Pozriem Facebook...');
            await options.tab.pause.start();
            await options.tab.viewTab();
            await api.login(ctx.config);
    
            let name = ctx.propName['adam'].multiple[0].baseWord;
            let messages = await api.getMessages(name);
            if (!Object.keys(messages).length) result = `${name} ti nenapísal žiadnu novú správu.`;
            else result = Object.keys(messages).map(name => `${name} píše, ${messages[name].join(', ')},`).join(', ');
        }
        catch (err) { throw err; }
        finally { options.tab.pause.stop(); }
        return result;
    }, {
        "sentenceMemberRequirements": {
            "example": "Napíš správu pre <object> citujem ... koniec citácie!",
            "type": "command",
            "predicates": {
                "multiple": [
                    {
                        "verbs": [
                            {
                                "baseWord": [
                                    /(na|od)písať/,
                                    /(od|p)oslať/
                                ]
                            }
                        ]
                    }
                ]
            },
            "objects": [
                {
                    "multiple": [
                        {
                            "origWord": "správu"
                        }
                    ]
                }, {
                    "multiple": [
                        {
                            "_or": [
                                {
                                    "case": { "key": "3" }
                                }, {
                                    "preposition": { "origWord": "pre" }
                                }
                            ]
                        }
                    ],
                    "propName": { "friend": "required" }
                }
            ]
        }
    },
    async ctx => {
        let result = '';
    
        try {
            await options.tab.pause.start();
            await ctx.speech('Pripravujem Facebook správu ...');
            await options.tab.viewTab();
            await api.login(ctx.config);
            
            let friends = ctx.propName['adamovi'].multiple.map(f => f.baseWord);
            let realNames = await api.sendMessage(friends, '');
    
            let unfindedNames = friends.filter(n => !realNames[n]);
            if (unfindedNames.length) {
                return (unfindedNames.length > 1 ? 'Mená' : 'Meno') + unfindedNames.join(' a ') + ' som v blízkych kontaktoch nenašiel.';
            } else {
                if (!ctx.propName.citation) {
                    let { text } = await ctx.speech('Môžeš diktovať Facebook správu', true);
                    ctx.propName.citation = text;
                }
    
                let citation = ctx.propName.citation.replace(/ __? /g, ' ');
    
                if (await ctx.getSummaryAccept('FacebookChat plugin: Poslať správu '
                    + (Object.values(realNames).length === 1 ? 'priateľovi: ' : 'priateľom: ')
                    + Object.values(realNames).join(', ') + ' s textom: ' + citation)
                ) {
                    await api.sendMessage(friends, citation);
                    result = 'Odoslané...';
                }
            }
        }
        catch (err) { throw err; }
        finally { options.tab.pause.stop(); }
        return result;
    }
);