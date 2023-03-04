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
var _store;
var ConversationStore = class {
  constructor() {
    __privateAdd(this, _store, void 0);
    const lru = new LRUCache({
      max: 1e4
    });
    __privateSet(this, _store, new Keyv({
      store: lru
    }));
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
  async set(msg) {
    return await __privateGet(this, _store).set(msg.id, msg);
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
    while (parentMessageId && this.has(parentMessageId)) {
      const msg = await this.get(parentMessageId);
      if (msg) {
        await this.delete(msg.id);
      }
      parentMessageId = msg == null ? void 0 : msg.parentMessageId;
    }
    console.log("conversation cleared");
  }
  /**
   * clear the store
   */
  async clearAll() {
    await __privateGet(this, _store).clear();
  }
};
_store = new WeakMap();

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
var _apiKey, _model, _urls, _debug, _requestConfig, _store2, _makeConversations, makeConversations_fn, _genAuthorization, genAuthorization_fn;
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
    __privateAdd(this, _debug, false);
    __privateAdd(this, _requestConfig, {});
    __privateAdd(this, _store2, new ConversationStore());
    __privateSet(this, _apiKey, opts.apiKey);
    __privateSet(this, _model, opts.model || "gpt-3.5-turbo");
    __privateSet(this, _debug, opts.debug || false);
    __privateSet(this, _requestConfig, opts.requestConfig || {});
  }
  /**
   * send message to ChatGPT server
   * @param text string new message
   * @param opts configs
   * @returns
   */
  async sendMessage(opts) {
    var _a, _b;
    opts = typeof opts === "string" ? { text: opts } : opts;
    if (opts.systemPrompt) {
      opts.parentMessageId = void 0;
      if (opts.parentMessageId)
        await __privateGet(this, _store2).clear1Conversation(opts.parentMessageId);
    }
    const model = __privateGet(this, _model);
    const userMessage = {
      id: genId(),
      text: opts.text,
      role: "user" /* user */,
      parentMessageId: opts.parentMessageId
    };
    const messages = await __privateMethod(this, _makeConversations, makeConversations_fn).call(this, userMessage, opts.systemPrompt);
    if (__privateGet(this, _debug)) {
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
        debug: __privateGet(this, _debug)
      }
    );
    if (__privateGet(this, _debug)) {
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
      model: res.model,
      role: "assistant" /* assistant */,
      parentMessageId: userMessage.id
    };
    await __privateGet(this, _store2).set(userMessage);
    await __privateGet(this, _store2).set(response);
    return response;
  }
};
_apiKey = new WeakMap();
_model = new WeakMap();
_urls = new WeakMap();
_debug = new WeakMap();
_requestConfig = new WeakMap();
_store2 = new WeakMap();
_makeConversations = new WeakSet();
makeConversations_fn = async function(userMessage, prompt) {
  let parentMessageId = userMessage.parentMessageId;
  const messages = [];
  if (prompt) {
    messages.push({
      role: "system" /* system */,
      content: prompt
    });
  } else {
    while (parentMessageId && __privateGet(this, _store2).has(parentMessageId)) {
      const msg = await __privateGet(this, _store2).get(parentMessageId);
      if (msg) {
        messages.unshift({
          role: msg.role,
          content: msg.text
        });
      }
      parentMessageId = msg == null ? void 0 : msg.parentMessageId;
    }
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