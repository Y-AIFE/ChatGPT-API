import { AxiosRequestConfig } from 'axios'
import { TiktokenEmbedding } from '@dqbd/tiktoken'
/**
 * ChatCompletion 回答
 */
export interface IChatCompletion {
  // {
  //   "id": "chatcmpl-6psB2OWQOgHwCWzTIsQMnhB3fst1J",
  //   "object": "chat.completion",
  //   "created": 1677821004,
  //   "model": "gpt-3.5-turbo-0301",
  //   "usage": {
  //     "prompt_tokens": 47,
  //     "completion_tokens": 391,
  //     "total_tokens": 438
  //   },
  //   "choices": [
  //     {
  //       "message": {
  //         "role": "assistant",
  //         "content": "回答"
  //       },
  //       "finish_reason": "stop",
  //       "index": 0
  //     }
  //   ]
  // }

  id: string
  object: string
  created: number
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  choices: {
    // content 即为答案
    message: { role: string; content: string }
    finish_reason: string
    index: number
  }[]
}

export interface IChatCompletionErrReponseData {
  message?: string
  type?: string
}

export interface IChatCompletionStreamOnEndData {
  success: boolean
  data: IChatGPTResponse | IChatCompletionErrReponseData
  status: number
}

export type TChatCompletionStreamOnEnd = (
  endData: IChatCompletionStreamOnEndData,
) => void

/**
 * response message
 */
export interface IChatGPTResponse {
  id: string
  text: string
  created: number
  role: ERole
  parentMessageId?: string
  tokens?: number
}
/**
 * user message
 */
export interface IChatGPTUserMessage {
  id: string
  text: string
  role: ERole
  parentMessageId?: string
  tokens?: number
}
/**
 * system situation message
 */
export interface IChatGPTSystemMessage {
  id: string
  text: string
  role: ERole
  parentMessageId?: string
  tokens?: number
}
export interface IChatGPTHTTPDataMessage {
  role: ERole
  content: string
}

export enum ERole {
  /**
   * conversation situation
   */
  system = 'system',
  /**
   * role is user
   */
  user = 'user',
  /**
   * role is chatgpt
   */
  assistant = 'assistant',
}

export interface IConversationStoreParams {
  maxKeys?: number
  maxFindDepth?: number
  debug: boolean
  log: TLog
}

export interface IChatGPTParams {
  /**
   * apiKey, you can get it in https://platform.openai.com/account/api-keys,You can apply for up to 5 at most.
   */
  apiKey: string
  /**
   * model，default is 'gpt-3.5-turbo'
   */
  model?: string
  /**
   * print logs
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
     * lru max keys, default `100000`
     */
    maxKeys?: number
    /**
     * Recursively search for historical messages, default `20` messages will be sent to the ChatGPT server
     */
    maxFindDepth?: number
  }
  tokenizerConfig?: ITokensParams
  /**
   * the maximum number of tokens when initiating a request, including prompts and completion. The default value is 4096.
   */
  maxTokens?: number
  /**
   * The maximum number of tokens for a single message. It is used to prevent from sending too many tokens to the ChatGPT server.
   * If this number is exceeded, the message will be deleted and not passed on as a prompt to the chatGPT server. The default value is `1000`.
   * - notice: **Maybe the message returned by ChatGPT should not be sent to the ChatGPT server as a prompt for the next conversation**.
   */
  limitTokensInAMessage?: number
  /**
   * same reason as `limitTokensInAMessage`, **Maybe the message returned by ChatGPT should not be sent to the ChatGPT server as a prompt for the next conversation**, default value is `false`
   * - `true`: will ignore ChatGPT server message in the next sendMessage, and will only refer to `limitTokensInAMessage` in history messages
   * - `false`: will only refer to `limitTokensInAMessage` in history messages
   */
  ignoreServerMessagesInPrompt?: boolean

  log?: TLog
}

/**
 * Tokenizer params
 */
export interface ITokensParams {
  /**
   * "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base", default 'cl100k_base'
   */
  encoding?: TiktokenEmbedding

  /**
   * replace regexp
   */
  replaceReg?: RegExp
  /**
   * replace function
   */
  replaceCallback?: (...args: any[]) => string
}

export type TCommonMessage =
  | IChatGPTResponse
  | IChatGPTUserMessage
  | IChatGPTSystemMessage

/**
 * Pass in your own logger
 */
export type TLog = (msg: string, ...args: any[]) => void

export interface ISendMessagesOpts {
  text?: string
  systemPrompt?: string
  parentMessageId?: string
  onProgress?: (t: string) => void
  onEnd?: (d: IChatCompletionStreamOnEndData) => void
  initialMessages?: TCommonMessage[]
  model?: string
}
