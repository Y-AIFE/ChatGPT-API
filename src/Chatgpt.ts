import { AxiosRequestConfig } from 'axios'

import ConversationStore from './ConversationStore'
import {
  IChatCompletion,
  IChatGPTResponse,
  IChatGPTUserMessage,
  ERole,
  ChatGPTHTTPDataMessages,
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
}

// role https://platform.openai.com/docs/guides/chat/introduction
export class ChatGPT {
  #apiKey = ''
  #model = ''
  #urls = URLS
  #debug = false
  #requestConfig?: AxiosRequestConfig = {}
  #store = new ConversationStore()
  constructor(opts: IChatGPTParams) {
    this.#apiKey = opts.apiKey
    this.#model = opts.model || 'gpt-3.5-turbo'
    this.#debug = opts.debug || false
    this.#requestConfig = opts.requestConfig || {}
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
      opts.parentMessageId = undefined
      if(opts.parentMessageId) await this.#store.clear1Conversation(opts.parentMessageId)
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
      console.log('response', 
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
      model: res.model,
      role: ERole.assistant,
      parentMessageId: userMessage.id,
    }
    await this.#store.set(userMessage)
    await this.#store.set(response)
    return response
  }

  /**
   * make conversations for http request data.messages
   */
  async #makeConversations(userMessage: IChatGPTUserMessage, prompt?: string) {
    let parentMessageId: string | undefined = userMessage.parentMessageId
    const messages: ChatGPTHTTPDataMessages = []
    if (prompt) {
      messages.push({
        role: ERole.system,
        content: prompt,
      })
    } else {
      while (parentMessageId && this.#store.has(parentMessageId)) {
        const msg = await this.#store.get(parentMessageId)
        if (msg) {
          messages.unshift({
            role: msg.role,
            content: msg.text,
          })
        }
        parentMessageId = msg?.parentMessageId
      }
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
