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
export type TChatGPTHTTPDataMessage = {
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
  debug?: boolean
}
