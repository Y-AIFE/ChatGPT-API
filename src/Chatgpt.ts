import { AxiosRequestConfig } from 'axios'

import ConversationStore from './ConversationStore'
import {
  IChatCompletion,
  IChatGPTResponse,
  IChatGPTUserMessage,
  ERole,
  TChatGPTHTTPDataMessage,
  IConversationStoreParams,
} from './types'
import { post } from './utils/request'
import URLS from './utils/urls'
import { genId } from './utils/index'

// https://platform.openai.com/docs/api-reference/chat
// curl https://api.openai.com/v1/chat/completions \
//   -H 'Content-Type: application/json' \
//   -H 'Authorization: Bearer YOUR_API_KEY' \
//   -d '{
//   "model": "gpt-3.5-turbo",
//   "messages": [{"role": "user", "content": "Hello!"}]
// }'

interface IChatGPTParams {
  /**
   * apiKey, you can get it in https://platform.openai.com/account/api-keys,You can apply for up to 5 at most.
   */
  apiKey: string
  /**
   * model，default is 'gpt-3.5-turbo'
   */
  model?: string
  /**
   * print request config
   */
  debug?: boolean
  /**
   * axios configs
   */
  requestConfig?: AxiosRequestConfig

  /**
   * configs for store
   */
  storeConfig?: {
    /**
     * lru max keys
     */
    maxKeys?: number
    /**
     * recursion depth
     */
    maxFindDepth?: number
  }
}

// role https://platform.openai.com/docs/guides/chat/introduction
export class ChatGPT {
  #apiKey = ''
  #model = ''
  #urls = URLS
  #debug = false
  #requestConfig?: AxiosRequestConfig = {}
  #store: ConversationStore
  constructor(opts: IChatGPTParams) {
    this.#apiKey = opts.apiKey
    this.#model = opts.model || 'gpt-3.5-turbo'
    this.#debug = opts.debug || false
    this.#requestConfig = opts.requestConfig || {}
    opts.storeConfig = opts.storeConfig ?? {}
    this.#store = new ConversationStore({
      ...opts.storeConfig,
      debug: this.#debug,
    })
  }

  /**
   * send message to ChatGPT server
   * @param text string new message
   * @param opts configs
   * @returns
   */
  async sendMessage(
    opts:
      | { text: string; systemPrompt?: string; parentMessageId?: string }
      | string,
  ) {
    opts = typeof opts === 'string' ? { text: opts } : opts
    if (opts.systemPrompt) {
      if (opts.parentMessageId)
        await this.#store.clear1Conversation(opts.parentMessageId)
      opts.parentMessageId = undefined
    }
    const model = this.#model
    const userMessage: IChatGPTUserMessage = {
      id: genId(),
      text: opts.text,
      role: ERole.user,
      parentMessageId: opts.parentMessageId,
    }
    const messages = await this.#makeConversations(
      userMessage,
      opts.systemPrompt,
    )
    if (this.#debug) {
      console.log('messages', messages)
    }
    const res = (await post(
      {
        url: this.#urls.createChatCompletion,
        headers: {
          Authorization: this.#genAuthorization(),
          'Content-Type': 'application/json',
        },
        data: {
          model,
          messages,
        },
        ...this.#requestConfig,
      },
      {
        debug: this.#debug,
      },
    )) as IChatCompletion
    if (this.#debug) {
      // log response
      console.log(
        'response',
        JSON.stringify({
          ...res,
          choices: [],
        }),
      )
    }
    const response: IChatGPTResponse = {
      id: res.id,
      text: res?.choices[0]?.message?.content,
      created: res.created,
      role: ERole.assistant,
      parentMessageId: userMessage.id,
      tokens: res?.usage?.completion_tokens,
    }
    userMessage.tokens = res?.usage?.prompt_tokens
    await this.#store.set([userMessage, response])
    return response
  }

  /**
   * make conversations for http request data.messages
   */
  async #makeConversations(userMessage: IChatGPTUserMessage, prompt?: string) {
    let messages: TChatGPTHTTPDataMessage[] = []
    if (prompt) {
      messages.push({
        role: ERole.system,
        content: prompt,
      })
    } else {
      messages = await this.#store.findMessages(userMessage.parentMessageId)
    }
    messages.push({
      role: ERole.user,
      content: userMessage.text,
    })
    return messages
  }

  /**
   * generate HTTP Authorization
   * @returns
   */
  #genAuthorization() {
    return `Bearer ${this.#apiKey}`
  }
}
