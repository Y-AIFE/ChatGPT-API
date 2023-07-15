"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ChatGPT: () => ChatGPT,
  ERole: () => ERole
});
module.exports = __toCommonJS(src_exports);

// src/ConversationStore.ts
var import_keyv = __toESM(require("keyv"));
var import_lru_cache = __toESM(require("lru-cache"));

// src/types.ts
var ERole = /* @__PURE__ */ ((ERole2) => {
  ERole2["system"] = "system";
  ERole2["user"] = "user";
  ERole2["assistant"] = "assistant";
  return ERole2;
})(ERole || {});

// src/ConversationStore.ts
var _store, _lru, _maxFindDepth, _debug, _log;
var ConversationStore = class {
  constructor(params) {
    __privateAdd(this, _store, void 0);
    __privateAdd(this, _lru, void 0);
    /**
     * in case some bad things happen
     */
    __privateAdd(this, _maxFindDepth, void 0);
    __privateAdd(this, _debug, void 0);
    __privateAdd(this, _log, void 0);
    const { maxKeys = 3e5, maxFindDepth = 30, debug, log: log2 } = params;
    __privateSet(this, _lru, new import_lru_cache.default({
      max: maxKeys
    }));
    __privateSet(this, _store, new import_keyv.default({
      store: __privateGet(this, _lru)
    }));
    __privateSet(this, _maxFindDepth, maxFindDepth);
    __privateSet(this, _debug, debug);
    __privateSet(this, _log, log2);
    if (__privateGet(this, _debug))
      __privateGet(this, _log).call(this, "ConversationStore params", params);
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
      __privateGet(this, _log).call(this, "lru size", __privateGet(this, _lru).size);
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
    if (__privateGet(this, _debug)) {
      __privateGet(this, _log).call(this, "[ConversationStore findMessages start]", id);
    }
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
      __privateGet(this, _log).call(this, "availableTokens", availableTokens);
      __privateGet(this, _log).call(this, "[ConversationStore findMessages end]", messages);
    }
    return messages;
  }
  async getMessages(opts) {
    let { id = void 0, maxDepth = 30 } = opts;
    if (__privateGet(this, _debug)) {
      __privateGet(this, _log).call(this, "[ConversationStore getMessages start]", { id, maxDepth });
    }
    let parentMessageId = id;
    let cnt = 0;
    const messages = [];
    while (parentMessageId && cnt < maxDepth) {
      const msg = await __privateGet(this, _store).get(
        parentMessageId
      );
      if (msg) {
        messages.unshift(msg);
        cnt++;
      }
      parentMessageId = msg == null ? void 0 : msg.parentMessageId;
    }
    if (__privateGet(this, _debug)) {
      __privateGet(this, _log).call(this, "[ConversationStore getMessages end]", messages);
    }
    return messages;
  }
  /**
   * clear the store
   */
  async clearAll() {
    await __privateGet(this, _store).clear();
  }
  getStoreSize() {
    return __privateGet(this, _lru).size;
  }
};
_store = new WeakMap();
_lru = new WeakMap();
_maxFindDepth = new WeakMap();
_debug = new WeakMap();
_log = new WeakMap();

// src/Tokenizer.ts
var import_tiktoken = require("@dqbd/tiktoken");
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
    __privateSet(this, _tokenizer, (0, import_tiktoken.get_encoding)(encoding));
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
var import_axios = __toESM(require("axios"));
async function post(config, opts) {
  const { debug = false, log: log2 = console.log } = opts || {};
  const ins = import_axios.default.create({
    method: "POST",
    validateStatus(status) {
      return true;
    }
  });
  if (debug) {
    ins.interceptors.request.use((config2) => {
      log2("axios config", {
        headers: {
          ...config2.headers,
          Authorization: void 0
        },
        data: config2.data
      });
      return config2;
    });
  }
  ins.interceptors.response.use(
    (data) => {
      return data;
    },
    (err) => {
      log2("ins.interceptors.response reject", String(err));
      return err;
    }
  );
  const response = await ins({ timeout: 1e4, ...config });
  return response;
}

// src/utils/urls.ts
var urls = {
  listModels: "https://api.openai.com/v1/models",
  // get
  createCompletion: "https://api.openai.com/v1/completions",
  // post
  createChatCompletion: "https://api.openai.com/v1/chat/completions",
  // post
  createModeration: "https://api.openai.com/v1/moderations"
  // post
};
var urls_default = urls;

// src/utils/index.ts
var import_uuid = require("uuid");

// src/utils/log.ts
function log(...args) {
  console.log("----------------------------------");
  console.log(...args);
}

// src/utils/index.ts
function genId() {
  return (0, import_uuid.v4)();
}
function isString(target) {
  return Object.prototype.toString.call(target) === "[object String]";
}
function isArray(target) {
  return Object.prototype.toString.call(target) === "[object Array]";
}
function concatMessages(messages) {
  return messages.reduce((acc, cur) => {
    return acc + cur.content;
  }, "");
}

// src/Chatgpt.ts
function genDefaultSystemMessage() {
  const currentDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return {
    role: "system" /* system */,
    content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.
Current date: ${currentDate}`
  };
}
var _apiKey, _model, _urls, _debug2, _requestConfig, _store2, _tokenizer2, _maxTokens, _limitTokensInAMessage, _ignoreServerMessagesInPrompt, _log2, _vendor, _streamChat, streamChat_fn, _chat, chat_fn, _validateAxiosResponse, validateAxiosResponse_fn, _makeConversations, makeConversations_fn, _genAuthorization, genAuthorization_fn;
var ChatGPT = class {
  constructor(opts) {
    __privateAdd(this, _streamChat);
    __privateAdd(this, _chat);
    __privateAdd(this, _validateAxiosResponse);
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
    __privateAdd(this, _log2, void 0);
    __privateAdd(this, _vendor, "OPENAI");
    const {
      apiKey,
      model = "gpt-3.5-turbo",
      debug = false,
      requestConfig = {},
      storeConfig = {},
      tokenizerConfig = {},
      maxTokens = 4096,
      limitTokensInAMessage = 1e3,
      ignoreServerMessagesInPrompt = false,
      log: log2 = log,
      AZURE
    } = opts;
    __privateSet(this, _apiKey, apiKey);
    __privateSet(this, _model, model);
    __privateSet(this, _debug2, debug);
    __privateSet(this, _requestConfig, requestConfig);
    __privateSet(this, _tokenizer2, new Tokenizer(tokenizerConfig));
    __privateSet(this, _maxTokens, maxTokens);
    __privateSet(this, _limitTokensInAMessage, limitTokensInAMessage);
    __privateSet(this, _ignoreServerMessagesInPrompt, ignoreServerMessagesInPrompt);
    __privateSet(this, _log2, log2);
    if (AZURE) {
      __privateSet(this, _vendor, "AZURE");
      __privateSet(this, _urls, {
        ...__privateGet(this, _urls),
        ...AZURE
      });
    }
    __privateSet(this, _store2, new ConversationStore({
      ...storeConfig,
      debug: __privateGet(this, _debug2),
      log: __privateGet(this, _log2)
    }));
  }
  /**
   * get related messages
   * @param parentMessageId
   */
  async getMessages(opts) {
    const messages = await __privateGet(this, _store2).getMessages(opts);
    return messages;
  }
  /**
   * add messages to store
   * @param messages
   * @returns
   */
  async addMessages(messages) {
    return await __privateGet(this, _store2).set(messages);
  }
  /**
   * send message to ChatGPT server
   * @param opts.text new message
   * @param opts.systemPrompt prompt message
   * @param opts.parentMessageId
   */
  sendMessage(opts) {
    return new Promise(
      async (resolve, reject) => {
        var _a, _b, _c, _d, _e;
        if (isString(opts)) {
          opts = { text: opts };
        } else if (isArray(opts)) {
          opts = { initialMessages: opts };
        } else {
          if (!opts.text && !opts.initialMessages) {
            return reject(
              "You are passing in an object and it is required to set the text or initialMessages attribute."
            );
          }
        }
        let {
          text = "",
          systemPrompt = void 0,
          parentMessageId = void 0,
          onProgress = false,
          onEnd = () => {
          },
          initialMessages = void 0,
          model = __privateGet(this, _model)
        } = opts;
        const shouldAddToStore = !initialMessages;
        if (systemPrompt) {
          if (parentMessageId)
            await __privateGet(this, _store2).clear1Conversation(parentMessageId);
          parentMessageId = void 0;
        }
        const userMessage = {
          id: genId(),
          text,
          role: "user" /* user */,
          parentMessageId,
          tokens: __privateGet(this, _tokenizer2).getTokenCnt(text)
        };
        let messages = [];
        if (shouldAddToStore) {
          messages = await __privateMethod(this, _makeConversations, makeConversations_fn).call(this, userMessage, systemPrompt);
        } else {
          messages = initialMessages.map((msg) => ({
            role: msg.role,
            content: msg.text
          }));
        }
        if (__privateGet(this, _debug2)) {
          __privateGet(this, _log2).call(this, "history messages", messages);
        }
        if (onProgress) {
          const responseMessage = {
            id: genId(),
            text: "",
            created: Math.floor(Date.now() / 1e3),
            role: "assistant" /* assistant */,
            parentMessageId: shouldAddToStore ? userMessage.id : initialMessages[initialMessages.length - 1].id,
            tokens: 0,
            len: 0
          };
          const innerOnEnd = async (endData) => {
            if (shouldAddToStore) {
              const msgsToBeStored = [userMessage, responseMessage];
              if (systemPrompt) {
                const systemMessage = {
                  id: genId(),
                  text: systemPrompt,
                  role: "system" /* system */,
                  tokens: __privateGet(this, _tokenizer2).getTokenCnt(systemPrompt)
                };
                userMessage.parentMessageId = systemMessage.id;
                msgsToBeStored.unshift(systemMessage);
              }
              await __privateGet(this, _store2).set(msgsToBeStored);
            }
            await onEnd(endData);
            resolve(endData);
          };
          await __privateMethod(this, _streamChat, streamChat_fn).call(this, messages, onProgress, responseMessage, innerOnEnd, model);
        } else {
          const chatResponse = await __privateMethod(this, _chat, chat_fn).call(this, messages, model);
          if (!chatResponse.success) {
            return resolve({
              ...chatResponse,
              data: chatResponse.data,
              raw: chatResponse.data
            });
          }
          const res = chatResponse.data;
          const responseMessage = {
            id: genId(),
            text: (_b = (_a = res == null ? void 0 : res.choices[0]) == null ? void 0 : _a.message) == null ? void 0 : _b.content,
            created: res.created,
            role: "assistant" /* assistant */,
            parentMessageId: shouldAddToStore ? userMessage.id : initialMessages[initialMessages.length - 1].id,
            tokens: (_c = res == null ? void 0 : res.usage) == null ? void 0 : _c.total_tokens,
            len: (((_e = (_d = res == null ? void 0 : res.choices[0]) == null ? void 0 : _d.message) == null ? void 0 : _e.content.length) || 0) + concatMessages(messages).length
          };
          if (shouldAddToStore) {
            const msgsToBeStored = [userMessage, responseMessage];
            if (systemPrompt) {
              const systemMessage = {
                id: genId(),
                text: systemPrompt,
                role: "system" /* system */,
                tokens: __privateGet(this, _tokenizer2).getTokenCnt(systemPrompt)
              };
              userMessage.parentMessageId = systemMessage.id;
              msgsToBeStored.unshift(systemMessage);
            }
            await __privateGet(this, _store2).set(msgsToBeStored);
          }
          resolve({
            success: true,
            data: responseMessage,
            raw: res,
            status: chatResponse.status
          });
        }
      }
    );
  }
  async clear1Conversation(parentMessageId) {
    return await __privateGet(this, _store2).clear1Conversation(parentMessageId);
  }
  getStoreSize() {
    return __privateGet(this, _store2).getStoreSize();
  }
  async createModeration(input) {
    const moderationRes = await post(
      {
        url: urls_default.createModeration,
        headers: {
          Authorization: __privateMethod(this, _genAuthorization, genAuthorization_fn).call(this),
          "Content-Type": "application/json"
        },
        data: {
          input
        }
      },
      {
        debug: __privateGet(this, _debug2),
        log: __privateGet(this, _log2)
      }
    );
    const { data } = moderationRes;
    return data.results[0].flagged;
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
_log2 = new WeakMap();
_vendor = new WeakMap();
_streamChat = new WeakSet();
streamChat_fn = async function(messages, onProgress, responseMessagge, innerOnEnd, model) {
  const axiosResponse = await post(
    {
      url: __privateGet(this, _urls).createChatCompletion,
      ...__privateGet(this, _requestConfig),
      headers: {
        ...__privateGet(this, _vendor) === "OPENAI" ? { Authorization: __privateMethod(this, _genAuthorization, genAuthorization_fn).call(this) } : { "api-key": __privateGet(this, _apiKey) },
        "Content-Type": "application/json",
        ...__privateGet(this, _requestConfig).headers || {}
      },
      data: {
        stream: true,
        ...__privateGet(this, _vendor) === "OPENAI" ? { model } : {},
        messages,
        ...__privateGet(this, _requestConfig).data || {}
      },
      responseType: "stream"
    },
    {
      debug: __privateGet(this, _debug2),
      log: __privateGet(this, _log2)
    }
  );
  const stream = axiosResponse.data;
  const status = axiosResponse.status;
  if (__privateMethod(this, _validateAxiosResponse, validateAxiosResponse_fn).call(this, status)) {
    stream.on("data", (buf) => {
      const dataArr = buf.toString().split("\n");
      let onDataPieceText = "";
      for (const dataStr of dataArr) {
        try {
          if (dataStr.indexOf("data: ") !== 0 || dataStr === "data: [DONE]")
            continue;
          const parsedData = JSON.parse(dataStr.slice(6));
          const pieceText = parsedData.choices[0].delta.content || "";
          onDataPieceText += pieceText;
        } catch (e) {
        }
      }
      if (typeof onProgress === "function") {
        onProgress(onDataPieceText, buf.toString());
      }
      responseMessagge.text += onDataPieceText;
    });
    stream.on("end", async () => {
      responseMessagge.tokens = __privateGet(this, _tokenizer2).getTokenCnt(
        responseMessagge.text + concatMessages(messages)
      );
      responseMessagge.len = responseMessagge.text.length + concatMessages(messages).length;
      await innerOnEnd({
        success: true,
        data: responseMessagge,
        status
      });
    });
  } else {
    if (stream) {
      let data = void 0;
      stream.on("data", (buf) => {
        data = JSON.parse(buf.toString());
      });
      stream.on("end", async () => {
        var _a, _b;
        await innerOnEnd({
          success: false,
          data: {
            message: (_a = data == null ? void 0 : data.error) == null ? void 0 : _a.message,
            type: (_b = data == null ? void 0 : data.error) == null ? void 0 : _b.type
          },
          status
        });
      });
    } else {
      const isTimeoutErr = String(axiosResponse).includes(
        "AxiosError: timeout of"
      );
      await innerOnEnd({
        success: false,
        data: {
          message: isTimeoutErr ? "request timeout" : "unknow err",
          type: isTimeoutErr ? "error" : "unknow err"
        },
        status: 500
      });
    }
  }
};
_chat = new WeakSet();
chat_fn = async function(messages, model) {
  var _a, _b;
  const axiosResponse = await post(
    {
      url: __privateGet(this, _urls).createChatCompletion,
      ...__privateGet(this, _requestConfig),
      headers: {
        ...__privateGet(this, _vendor) === "OPENAI" ? { Authorization: __privateMethod(this, _genAuthorization, genAuthorization_fn).call(this) } : { "api-key": __privateGet(this, _apiKey) },
        "Content-Type": "application/json",
        ...__privateGet(this, _requestConfig).headers || {}
      },
      data: {
        ...__privateGet(this, _vendor) === "OPENAI" ? { model } : {},
        messages,
        ...__privateGet(this, _requestConfig).data || {}
      }
    },
    {
      debug: __privateGet(this, _debug2),
      log: __privateGet(this, _log2)
    }
  );
  const data = axiosResponse.data;
  const status = axiosResponse.status;
  if (__privateMethod(this, _validateAxiosResponse, validateAxiosResponse_fn).call(this, status)) {
    return {
      success: true,
      data,
      status
    };
  } else {
    const isTimeoutErr = String(axiosResponse).includes(
      "AxiosError: timeout of"
    );
    if (isTimeoutErr) {
      return {
        success: false,
        data: {
          message: "request timeout",
          type: "error"
        },
        status: 500
      };
    }
    return {
      success: false,
      data: {
        message: (_a = data == null ? void 0 : data.error) == null ? void 0 : _a.message,
        type: (_b = data == null ? void 0 : data.error) == null ? void 0 : _b.type,
        ...data == null ? void 0 : data.error
      },
      status
    };
  }
};
_validateAxiosResponse = new WeakSet();
validateAxiosResponse_fn = function(status) {
  return status >= 200 && status < 300;
};
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
  if (!messages.length || messages[0].role !== "system" /* system */) {
    messages.unshift(genDefaultSystemMessage());
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChatGPT,
  ERole
});
//# sourceMappingURL=index.js.map