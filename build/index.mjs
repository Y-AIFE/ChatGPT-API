var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};

// src/ConversationStore.ts
import Keyv from "keyv";
import LRUCache from "lru-cache";
var _store, _lru, _maxFindDepth, _debug;
var ConversationStore = class {
  constructor(params) {
    __privateAdd(this, _store, void 0);
    __privateAdd(this, _lru, void 0);
    /**
     * in case some bad things happen
     */
    __privateAdd(this, _maxFindDepth, void 0);
    __privateAdd(this, _debug, void 0);
    const { maxKeys = 1e5, maxFindDepth = 20, debug = false } = params;
    __privateSet(this, _lru, new LRUCache({
      max: maxKeys
    }));
    __privateSet(this, _store, new Keyv({
      store: __privateGet(this, _lru)
    }));
    __privateSet(this, _maxFindDepth, maxFindDepth);
    __privateSet(this, _debug, debug);
    if (__privateGet(this, _debug))
      console.log("ConversationStore params", params);
  }
  /**
   * get message by id
   * @param id
   * @returns
   */
  async get(id) {
    return await __privateGet(this, _store).get(id);
  }
  /**
   * set new message
   * @param msg
   * @returns
   */
  async set(msgs) {
    for (const msg of msgs) {
      await __privateGet(this, _store).set(msg.id, msg);
    }
    if (__privateGet(this, _debug))
      console.log("lru size", __privateGet(this, _lru).size);
  }
  /**
   * check if the id exists in the store
   * @param id
   * @returns
   */
  async has(id) {
    return await __privateGet(this, _store).has(id);
  }
  /**
   * delete one message
   * @param id
   * @returns
   */
  async delete(id) {
    return await __privateGet(this, _store).delete(id);
  }
  /**
   * clear one conversation，it will be used when you set a new system prompt，which means that you will be in a new context，so early messages will be deleted
   * @param id last conversation id
   */
  async clear1Conversation(id) {
    let parentMessageId = id;
    let cnt = 0;
    while (parentMessageId && cnt < __privateGet(this, _maxFindDepth)) {
      cnt++;
      const msg = await this.get(parentMessageId);
      if (msg) {
        await this.delete(msg.id);
      }
      parentMessageId = msg == null ? void 0 : msg.parentMessageId;
    }
  }
  /**
   * find messages in a conversation by id
   * @param id parentMessageId
   */
  async findMessages(opts) {
    let {
      id = void 0,
      tokenizer,
      limit,
      availableTokens,
      ignore = false
    } = opts;
    let parentMessageId = id;
    let cnt = 0;
    const messages = [];
    while (parentMessageId && cnt < __privateGet(this, _maxFindDepth)) {
      const msg = await __privateGet(this, _store).get(
        parentMessageId
      );
      if (msg && !(ignore && msg.role === "assistant" /* assistant */)) {
        let tokensCnt = msg.tokens || tokenizer.getTokenCnt(msg.text);
        if (tokensCnt <= limit) {
          if (availableTokens < tokensCnt)
            break;
          messages.unshift({
            role: msg.role,
            content: msg.text
          });
          cnt++;
          availableTokens -= tokensCnt;
        }
      }
      parentMessageId = msg == null ? void 0 : msg.parentMessageId;
    }
    if (__privateGet(this, _debug)) {
      console.log("availableTokens", availableTokens);
    }
    return messages;
  }
  /**
   * clear the store
   */
  async clearAll() {
    await __privateGet(this, _store).clear();
  }
};
_store = new WeakMap();
_lru = new WeakMap();
_maxFindDepth = new WeakMap();
_debug = new WeakMap();

// src/Tokenizer.ts
import { get_encoding } from "@dqbd/tiktoken";
var _tokenizer, _replaceReg, _replaceCallback, _encode, encode_fn;
var Tokenizer = class {
  constructor(opts) {
    __privateAdd(this, _encode);
    __privateAdd(this, _tokenizer, void 0);
    __privateAdd(this, _replaceReg, void 0);
    __privateAdd(this, _replaceCallback, void 0);
    const {
      encoding = "cl100k_base",
      replaceReg = /<\|endoftext\|>/g,
      replaceCallback = (...args) => ""
    } = opts;
    __privateSet(this, _tokenizer, get_encoding(encoding));
    __privateSet(this, _replaceReg, replaceReg);
    __privateSet(this, _replaceCallback, replaceCallback);
  }
  /**
   * get the text tokens count
   * @param text
   * @returns
   */
  getTokenCnt(msg) {
    if (typeof msg === "object" && msg.tokens)
      return msg.tokens;
    msg = typeof msg === "object" ? msg.text : msg;
    const text = msg.replace(__privateGet(this, _replaceReg), __privateGet(this, _replaceCallback));
    return __privateMethod(this, _encode, encode_fn).call(this, text).length;
  }
};
_tokenizer = new WeakMap();
_replaceReg = new WeakMap();
_replaceCallback = new WeakMap();
_encode = new WeakSet();
encode_fn = function(text) {
  return __privateGet(this, _tokenizer).encode(text);
};

// src/utils/request.ts
import axios from "axios";
async function post(config, opts) {
  const ins = axios.create({
    method: "POST"
  });
  if (opts.debug) {
    ins.interceptors.request.use((config2) => {
      console.log(config2);
      return config2;
    });
  }
  return (await ins({ ...config })).data;
}

// src/utils/urls.ts
var urls = {
  listModels: "https://api.openai.com/v1/models",
  // get
  createCompletion: "https://api.openai.com/v1/completions",
  // post
  createChatCompletion: "https://api.openai.com/v1/chat/completions"
  // post
};
var urls_default = urls;

// src/utils/index.ts
import { v4 as uuid } from "uuid";
function genId() {
  return uuid();
}

// src/ChatGPT.ts
var _apiKey, _model, _urls, _debug2, _requestConfig, _store2, _tokenizer2, _maxTokens, _limitTokensInAMessage, _ignoreServerMessagesInPrompt, _makeConversations, makeConversations_fn, _genAuthorization, genAuthorization_fn;
var ChatGPT = class {
  constructor(opts) {
    /**
     * make conversations for http request data.messages
     */
    __privateAdd(this, _makeConversations);
    /**
     * generate HTTP Authorization
     * @returns
     */
    __privateAdd(this, _genAuthorization);
    __privateAdd(this, _apiKey, "");
    __privateAdd(this, _model, "");
    __privateAdd(this, _urls, urls_default);
    __privateAdd(this, _debug2, false);
    __privateAdd(this, _requestConfig, void 0);
    __privateAdd(this, _store2, void 0);
    __privateAdd(this, _tokenizer2, void 0);
    __privateAdd(this, _maxTokens, void 0);
    __privateAdd(this, _limitTokensInAMessage, void 0);
    __privateAdd(this, _ignoreServerMessagesInPrompt, void 0);
    const {
      apiKey,
      model = "gpt-3.5-turbo",
      debug = false,
      requestConfig = {},
      storeConfig = {},
      tokenizerConfig = {},
      maxTokens = 4096,
      limitTokensInAMessage = 1e3,
      ignoreServerMessagesInPrompt = true
    } = opts;
    __privateSet(this, _apiKey, apiKey);
    __privateSet(this, _model, model);
    __privateSet(this, _debug2, debug);
    __privateSet(this, _requestConfig, requestConfig);
    __privateSet(this, _store2, new ConversationStore({
      ...storeConfig,
      debug: __privateGet(this, _debug2)
    }));
    __privateSet(this, _tokenizer2, new Tokenizer(tokenizerConfig));
    __privateSet(this, _maxTokens, maxTokens);
    __privateSet(this, _limitTokensInAMessage, limitTokensInAMessage);
    __privateSet(this, _ignoreServerMessagesInPrompt, ignoreServerMessagesInPrompt);
  }
  /**
   * send message to ChatGPT server
   * @param opts.text new message
   * @param opts.systemPrompt prompt message
   * @param opts.parentMessageId
   */
  async sendMessage(opts) {
    var _a, _b, _c;
    opts = typeof opts === "string" ? { text: opts } : opts;
    let { text, systemPrompt = void 0, parentMessageId = void 0 } = opts;
    if (systemPrompt) {
      if (parentMessageId)
        await __privateGet(this, _store2).clear1Conversation(parentMessageId);
      parentMessageId = void 0;
    }
    const model = __privateGet(this, _model);
    const userMessage = {
      id: genId(),
      text,
      role: "user" /* user */,
      parentMessageId,
      tokens: __privateGet(this, _tokenizer2).getTokenCnt(text)
    };
    const messages = await __privateMethod(this, _makeConversations, makeConversations_fn).call(this, userMessage, systemPrompt);
    if (__privateGet(this, _debug2)) {
      console.log("messages", messages);
    }
    const res = await post(
      {
        url: __privateGet(this, _urls).createChatCompletion,
        headers: {
          Authorization: __privateMethod(this, _genAuthorization, genAuthorization_fn).call(this),
          "Content-Type": "application/json"
        },
        data: {
          model,
          messages
        },
        ...__privateGet(this, _requestConfig)
      },
      {
        debug: __privateGet(this, _debug2)
      }
    );
    if (__privateGet(this, _debug2)) {
      console.log(
        "response",
        JSON.stringify({
          ...res,
          choices: []
        })
      );
    }
    const response = {
      id: res.id,
      text: (_b = (_a = res == null ? void 0 : res.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content,
      created: res.created,
      role: "assistant" /* assistant */,
      parentMessageId: userMessage.id,
      tokens: (_c = res == null ? void 0 : res.usage) == null ? void 0 : _c.completion_tokens
    };
    const msgsToBeStored = [userMessage, response];
    if (systemPrompt) {
      const systemMessage = {
        id: genId(),
        text: systemPrompt,
        role: "system" /* system */,
        tokens: __privateGet(this, _tokenizer2).getTokenCnt(systemPrompt)
      };
      msgsToBeStored.unshift(systemMessage);
    }
    await __privateGet(this, _store2).set(msgsToBeStored);
    return response;
  }
};
_apiKey = new WeakMap();
_model = new WeakMap();
_urls = new WeakMap();
_debug2 = new WeakMap();
_requestConfig = new WeakMap();
_store2 = new WeakMap();
_tokenizer2 = new WeakMap();
_maxTokens = new WeakMap();
_limitTokensInAMessage = new WeakMap();
_ignoreServerMessagesInPrompt = new WeakMap();
_makeConversations = new WeakSet();
makeConversations_fn = async function(userMessage, prompt) {
  let messages = [];
  let usedTokens = __privateGet(this, _tokenizer2).getTokenCnt(userMessage.text);
  if (prompt) {
    messages.push({
      role: "system" /* system */,
      content: prompt
    });
  } else {
    messages = await __privateGet(this, _store2).findMessages({
      id: userMessage.parentMessageId,
      tokenizer: __privateGet(this, _tokenizer2),
      limit: __privateGet(this, _limitTokensInAMessage),
      availableTokens: __privateGet(this, _maxTokens) - usedTokens,
      ignore: __privateGet(this, _ignoreServerMessagesInPrompt)
    });
  }
  messages.push({
    role: "user" /* user */,
    content: userMessage.text
  });
  return messages;
};
_genAuthorization = new WeakSet();
genAuthorization_fn = function() {
  return `Bearer ${__privateGet(this, _apiKey)}`;
};
export {
  ChatGPT
};
//# sourceMappingURL=index.mjs.map