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
  TLog,
  TCommonMessage,
  ISendMessagesOpts,
} from './types'
import { post } from './utils/request'
import URLS from './utils/urls'
import {
  genId,
  log as defaultLog,
  isString,
  isArray,
  concatMessages,
} from './utils'

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
    content: `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\nCurrent date: ${currentDate}`,
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
  #log: TLog
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
      log = defaultLog,
    } = opts

    this.#apiKey = apiKey
    this.#model = model
    this.#debug = debug
    this.#requestConfig = requestConfig
    this.#tokenizer = new Tokenizer(tokenizerConfig)
    this.#maxTokens = maxTokens
    this.#limitTokensInAMessage = limitTokensInAMessage
    this.#ignoreServerMessagesInPrompt = ignoreServerMessagesInPrompt
    this.#log = log

    this.#store = new ConversationStore({
      ...storeConfig,
      debug: this.#debug,
      log: this.#log,
    })
  }

  /**
   * get related messages
   * @param parentMessageId
   */
  async getMessages(opts: {
    id: string
    maxDepth?: number
  }): Promise<TCommonMessage[]> {
    const messages = await this.#store.getMessages(opts)
    return messages
  }

  /**
   * add messages to store
   * @param messages
   * @returns
   */
  async addMessages(messages: TCommonMessage[]) {
    return await this.#store.set(messages)
  }

  /**
   * send message to ChatGPT server
   * @param opts.text new message
   * @param opts.systemPrompt prompt message
   * @param opts.parentMessageId
   */
  sendMessage(opts: ISendMessagesOpts | string | TCommonMessage[]) {
    return new Promise<IChatCompletionStreamOnEndData>(
      async (resolve, reject) => {
        if (isString(opts)) {
          opts = { text: opts as string }
        } else if (isArray(opts)) {
          opts = { initialMessages: opts as TCommonMessage[] }
        } else {
          // 使用对象传入，必须要设置 text
          if (
            !(opts as ISendMessagesOpts).text &&
            !(opts as ISendMessagesOpts).initialMessages
          ) {
            return reject(
              'You are passing in an object and it is required to set the text or initialMessages attribute.',
            )
          }
        }
        let {
          text = '',
          systemPrompt = undefined,
          parentMessageId = undefined,
          onProgress = false,
          onEnd = () => {},
          initialMessages = undefined,
          model = this.#model,
        } = opts as ISendMessagesOpts
        // 是否需要把数据存储到 store 中
        const shouldAddToStore = !initialMessages
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
        let messages: IChatGPTHTTPDataMessage[] = []
        if (shouldAddToStore) {
          messages = await this.#makeConversations(userMessage, systemPrompt)
        } else {
          messages = (initialMessages as TCommonMessage[]).map((msg) => ({
            role: msg.role,
            content: msg.text,
          }))
        }
        if (this.#debug) {
          this.#log('history messages', messages)
        }
        if (onProgress) {
          const responseMessage: IChatGPTResponse = {
            id: genId(),
            text: '',
            created: Math.floor(Date.now() / 1000),
            role: ERole.assistant,
            parentMessageId: shouldAddToStore
              ? userMessage.id
              : (initialMessages as TCommonMessage[])[
                  (initialMessages as TCommonMessage[]).length - 1
                ].id,
            tokens: 0,
            len: 0,
          }
          const innerOnEnd = async (
            endData: IChatCompletionStreamOnEndData,
          ) => {
            if (shouldAddToStore) {
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
            }
            await onEnd(endData)
            resolve(endData)
          }
          await this.#streamChat(
            messages,
            onProgress,
            responseMessage,
            innerOnEnd,
            model,
          )
        } else {
          const chatResponse = await this.#chat(messages, model)
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
            parentMessageId: shouldAddToStore
              ? userMessage.id
              : (initialMessages as TCommonMessage[])[
                  (initialMessages as TCommonMessage[]).length - 1
                ].id,
            tokens: res?.usage?.total_tokens,
            len:
              (res?.choices[0]?.message?.content.length || 0) +
              concatMessages(messages).length,
          }
          if (shouldAddToStore) {
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
          }
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
    innerOnEnd: (d: IChatCompletionStreamOnEndData) => void,
    model: string,
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
          model,
          messages,
          ...{ ...(this.#requestConfig.data || {}) },
        },
        responseType: 'stream',
      },
      {
        debug: this.#debug,
        log: this.#log,
      },
    )
    const stream = axiosResponse.data // 请求被取消之后变成 undefined
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
          responseMessagge.text + concatMessages(messages),
        )
        responseMessagge.len =
          responseMessagge.text.length + concatMessages(messages).length
        await innerOnEnd({
          success: true,
          data: responseMessagge,
          status,
        })
      })
    } else {
      if (stream) {
        let data: any = undefined
        stream.on('data', (buf: any) => {
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
        stream.on('end', async () => {
          await innerOnEnd({
            success: false,
            data: {
              message: data?.error?.message,
              type: data?.error?.type,
            },
            status,
          })
        })
      } else {
        const isTimeoutErr = String(axiosResponse).includes(
          'AxiosError: timeout of',
        )
        await innerOnEnd({
          success: false,
          data: {
            message: isTimeoutErr ? 'request timeout' : 'unknow err',
            type: isTimeoutErr ? 'error' : 'unknow err',
          },
          status: 500,
        })
      }
    }
  }

  async #chat(messages: { content: string; role: ERole }[], model: string) {
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
          model,
          messages,
          ...{ ...(this.#requestConfig.data || {}) },
        },
      },
      {
        debug: this.#debug,
        log: this.#log,
      },
    )
    const data = axiosResponse.data
    const status = axiosResponse.status
    if (this.#validateAxiosResponse(status)) {
      return {
        success: true,
        data: data as IChatCompletion,
        status,
      }
    } else {
      const isTimeoutErr = String(axiosResponse).includes(
        'AxiosError: timeout of',
      )
      if (isTimeoutErr) {
        return {
          success: false,
          data: {
            message: 'request timeout',
            type: 'error',
          },
          status: 500,
        }
      }
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
    if (!messages.length || messages[0].role !== ERole.system) {
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

  getStoreSize() {
    return this.#store.getStoreSize()
  }
}
