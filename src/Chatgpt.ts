import { AxiosRequestConfig } from 'axios'

import ConversationStore from './ConversationStore'
import Tokenizer from './Tokenizer'
import {
  IChatCompletion,
  IChatGPTResponse,
  IChatGPTUserMessage,
  IChatGPTSystemMessage,
  ERole,
  TChatGPTHTTPDataMessage,
  IChatGPTParams,
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

// role https://platform.openai.com/docs/guides/chat/introduction
export class ChatGPT {
  #apiKey = ''
  #model = ''
  #urls = URLS
  #debug = false
  #requestConfig: AxiosRequestConfig
  #store: ConversationStore
  #tokenizer: Tokenizer
  #maxTokens: number
  #limitTokensInAMessage: number
  #ignoreServerMessagesInPrompt: boolean
  constructor(opts: IChatGPTParams) {
    const {
      apiKey,
      model = 'gpt-3.5-turbo',
      debug = false,
      requestConfig = {},
      storeConfig = {},
      tokenizerConfig = {},
      maxTokens = 4096,
      limitTokensInAMessage = 1000,
      ignoreServerMessagesInPrompt = true,
    } = opts

    this.#apiKey = apiKey
    this.#model = model
    this.#debug = debug
    this.#requestConfig = requestConfig
    this.#store = new ConversationStore({
      ...storeConfig,
      debug: this.#debug,
    })
    this.#tokenizer = new Tokenizer(tokenizerConfig)
    this.#maxTokens = maxTokens
    this.#limitTokensInAMessage = limitTokensInAMessage
    this.#ignoreServerMessagesInPrompt = ignoreServerMessagesInPrompt
  }

  /**
   * send message to ChatGPT server
   * @param opts.text new message
   * @param opts.systemPrompt prompt message
   * @param opts.parentMessageId
   */
  async sendMessage(
    opts:
      | { text: string; systemPrompt?: string; parentMessageId?: string }
      | string,
  ) {
    opts = typeof opts === 'string' ? { text: opts } : opts
    let { text, systemPrompt = undefined, parentMessageId = undefined } = opts

    if (systemPrompt) {
      if (parentMessageId) await this.#store.clear1Conversation(parentMessageId)
      parentMessageId = undefined
    }
    const model = this.#model
    const userMessage: IChatGPTUserMessage = {
      id: genId(),
      text,
      role: ERole.user,
      parentMessageId,
      tokens: this.#tokenizer.getTokenCnt(text),
    }
    const messages = await this.#makeConversations(userMessage, systemPrompt)
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
    const msgsToBeStored = [userMessage, response]
    if (systemPrompt) {
      const systemMessage: IChatGPTSystemMessage = {
        id: genId(),
        text: systemPrompt,
        role: ERole.system,
        tokens: this.#tokenizer.getTokenCnt(systemPrompt),
      }
      msgsToBeStored.unshift(systemMessage)
    }
    await this.#store.set(msgsToBeStored)
    return response
  }

  /**
   * make conversations for http request data.messages
   */
  async #makeConversations(userMessage: IChatGPTUserMessage, prompt?: string) {
    let messages: TChatGPTHTTPDataMessage[] = []
    let usedTokens = this.#tokenizer.getTokenCnt(userMessage.text)
    if (prompt) {
      messages.push({
        role: ERole.system,
        content: prompt,
      })
    } else {
      messages = await this.#store.findMessages({
        id: userMessage.parentMessageId,
        tokenizer: this.#tokenizer,
        limit: this.#limitTokensInAMessage,
        availableTokens: this.#maxTokens - usedTokens,
        ignore: this.#ignoreServerMessagesInPrompt
      })
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
