import { AxiosRequestConfig } from 'axios'

import ConversationStore from './ConversationStore'
import Tokenizer from './Tokenizer'
import {
  IChatCompletion,
  IChatGPTResponse,
  IChatGPTUserMessage,
  IChatGPTSystemMessage,
  ERole,
  IChatGPTHTTPDataMessage,
  IChatGPTParams,
  IChatCompletionStreamOnEndData,
  IChatCompletionErrReponseData,
} from './types'
import { post } from './utils/request'
import URLS from './utils/urls'
import { genId, log } from './utils'

// https://platform.openai.com/docs/api-reference/chat
// curl https://api.openai.com/v1/chat/completions \
//   -H 'Content-Type: application/json' \
//   -H 'Authorization: Bearer YOUR_API_KEY' \
//   -d '{
//   "model": "gpt-3.5-turbo",
//   "messages": [{"role": "user", "content": "Hello!"}]
// }'

function genDefaultSystemMessage(): IChatGPTHTTPDataMessage {
  const currentDate = new Date().toISOString().split('T')[0]
  return {
    role: ERole.system,
    content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nKnowledge cutoff: 2021-09-01\nCurrent date: ${currentDate}`,
  }
}

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
      ignoreServerMessagesInPrompt = false,
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
  sendMessage(
    opts:
      | {
          text: string
          systemPrompt?: string
          parentMessageId?: string
          onProgress?: (t: string) => void
          onEnd?: (d: IChatCompletionStreamOnEndData) => void
        }
      | string,
  ) {
    return new Promise<IChatCompletionStreamOnEndData | null>(
      async (resolve, reject) => {
        opts = typeof opts === 'string' ? { text: opts } : opts
        let {
          text,
          systemPrompt = undefined,
          parentMessageId = undefined,
          onProgress = false,
          onEnd = () => {},
        } = opts
        if (systemPrompt) {
          if (parentMessageId)
            await this.#store.clear1Conversation(parentMessageId)
          parentMessageId = undefined
        }
        const userMessage: IChatGPTUserMessage = {
          id: genId(),
          text,
          role: ERole.user,
          parentMessageId,
          tokens: this.#tokenizer.getTokenCnt(text),
        }
        const messages = await this.#makeConversations(
          userMessage,
          systemPrompt,
        )
        if (this.#debug) {
          log('messages', messages)
        }
        if (onProgress) {
          const responseMessage: IChatGPTResponse = {
            id: genId(),
            text: '',
            created: Math.floor(Date.now() / 1000),
            role: ERole.assistant,
            parentMessageId: userMessage.id,
            tokens: 0,
          }
          const innerOnEnd = async () => {
            const msgsToBeStored = [userMessage, responseMessage]
            if (systemPrompt) {
              const systemMessage: IChatGPTSystemMessage = {
                id: genId(),
                text: systemPrompt,
                role: ERole.system,
                tokens: this.#tokenizer.getTokenCnt(systemPrompt),
              }
              userMessage.parentMessageId = systemMessage.id
              msgsToBeStored.unshift(systemMessage)
            }
            await this.#store.set(msgsToBeStored)
            resolve(null)
          }
          await this.#streamChat(
            messages,
            onProgress,
            responseMessage,
            innerOnEnd,
            onEnd,
          )
        } else {
          const chatResponse = await this.#chat(messages)
          if (!chatResponse.success) {
            return resolve({
              ...chatResponse,
              data: chatResponse.data as IChatCompletionErrReponseData,
            })
          }
          const res = chatResponse.data as IChatCompletion
          const responseMessage: IChatGPTResponse = {
            id: genId(),
            text: res?.choices[0]?.message?.content,
            created: res.created,
            role: ERole.assistant,
            parentMessageId: userMessage.id,
            tokens: res?.usage?.completion_tokens,
          }
          const msgsToBeStored = [userMessage, responseMessage]
          if (systemPrompt) {
            const systemMessage: IChatGPTSystemMessage = {
              id: genId(),
              text: systemPrompt,
              role: ERole.system,
              tokens: this.#tokenizer.getTokenCnt(systemPrompt),
            }
            userMessage.parentMessageId = systemMessage.id
            msgsToBeStored.unshift(systemMessage)
          }
          await this.#store.set(msgsToBeStored)
          resolve({
            success: true,
            data: responseMessage,
            status: chatResponse.status,
          })
        }
      },
    )
  }

  async #streamChat(
    messages: { content: string; role: ERole }[],
    onProgress: boolean | ((t: string) => void),
    responseMessagge: IChatGPTResponse,
    innerOnEnd: () => void,
    onEnd?: (d: IChatCompletionStreamOnEndData) => void,
  ) {
    const axiosResponse = await post(
      {
        url: this.#urls.createChatCompletion,
        ...this.#requestConfig,
        headers: {
          Authorization: this.#genAuthorization(),
          'Content-Type': 'application/json',
          ...{ ...(this.#requestConfig.headers || {}) },
        },
        data: {
          stream: true,
          model: this.#model,
          messages,
          ...{ ...(this.#requestConfig.data || {}) },
        },
        responseType: 'stream',
      },
      {
        debug: this.#debug,
      },
    )
    const stream = axiosResponse.data
    const status = axiosResponse.status
    if (this.#validateAxiosResponse(status)) {
      stream.on('data', (buf: any) => {
        const dataArr = buf.toString().split('\n')
        let onDataPieceText = ''
        for (const dataStr of dataArr) {
          // split 之后的空行，或者结束通知
          if (dataStr.indexOf('data: ') !== 0 || dataStr === 'data: [DONE]')
            continue
          const parsedData = JSON.parse(dataStr.slice(6)) // [data: ]
          const pieceText = parsedData.choices[0].delta.content || ''
          onDataPieceText += pieceText
        }
        if (typeof onProgress === 'function') {
          onProgress(onDataPieceText)
        }
        responseMessagge.text += onDataPieceText
      })
      stream.on('end', async () => {
        responseMessagge.tokens = this.#tokenizer.getTokenCnt(
          responseMessagge.text,
        )
        await innerOnEnd()
        onEnd &&
          onEnd({
            success: true,
            data: responseMessagge,
            status: axiosResponse.status,
          })
      })
    } else {
      let data: any = stream.on('data', (buf: any) => {
        data = JSON.parse(buf.toString())
        // that is stream
        // error: {
        //     message: 'Your access was terminated due to violation of our policies, please check your email for more information. If you believe this is in error and would like to appeal, please contact support@openai.com.',
        //     type: 'access_terminated',
        //     param: null,
        //     code: null
        //   }
        // }
      })
      stream.on('end', () => {
        onEnd &&
          onEnd({
            success: false,
            data: {
              message: data?.error?.message,
              type: data?.error?.type,
            },
            status,
          })
      })
    }
  }

  async #chat(messages: { content: string; role: ERole }[]) {
    const axiosResponse = await post(
      {
        url: this.#urls.createChatCompletion,
        ...this.#requestConfig,
        headers: {
          Authorization: this.#genAuthorization(),
          'Content-Type': 'application/json',
          ...{ ...(this.#requestConfig.headers || {}) },
        },
        data: {
          model: this.#model,
          messages,
          ...{ ...(this.#requestConfig.data || {}) },
        },
      },
      {
        debug: this.#debug,
      },
    )
    // log('[#chat]', axiosResponse.status)
    const data = axiosResponse.data
    const status = axiosResponse.status
    if (this.#validateAxiosResponse(status)) {
      return {
        success: true,
        data: data as IChatCompletion,
        status,
      }
    } else {
      return {
        success: false,
        data: {
          message: data?.error?.message,
          type: data?.error?.type,
        },
        status,
      }
    }
  }

  #validateAxiosResponse(status: number) {
    return status >= 200 && status < 300
  }

  /**
   * make conversations for http request data.messages
   */
  async #makeConversations(userMessage: IChatGPTUserMessage, prompt?: string) {
    let messages: IChatGPTHTTPDataMessage[] = []
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
        ignore: this.#ignoreServerMessagesInPrompt,
      })
    }
    /**
     * if there are no default system massage, add one
     */
    if(!messages.length || messages[0].role !== ERole.system) {
      messages.unshift(genDefaultSystemMessage())
    }
    messages.push({
      role: ERole.user,
      content: userMessage.text,
    })
    return messages
  }

  async clear1Conversation(parentMessageId?: string) {
    return await this.#store.clear1Conversation(parentMessageId)
  }

  /**
   * generate HTTP Authorization
   * @returns
   */
  #genAuthorization() {
    return `Bearer ${this.#apiKey}`
  }
}
