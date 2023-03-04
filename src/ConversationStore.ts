import Keyv from 'keyv'
import LRUCache from 'lru-cache'

import {
  IChatGPTResponse,
  IChatGPTUserMessage,
  IChatGPTSystemMessage,
} from './types'

type TCommonMessage =
  | IChatGPTResponse
  | IChatGPTUserMessage
  | IChatGPTSystemMessage

/**
 * conversation manage
 */
class ConversationStore {
  #store: Keyv<TCommonMessage, any>
  constructor() {
    const lru = new LRUCache<string, TCommonMessage>({
      max: 10000,
    })
    this.#store = new Keyv<TCommonMessage, any>({
      store: lru,
    })
  }
  async get(id: string): Promise<TCommonMessage | undefined> {
    return await this.#store.get(id)
  }
  async set(msg: TCommonMessage): Promise<boolean> {
    return await this.#store.set(msg.id, msg)
  }
  async has(id: string): Promise<boolean> {
    return await this.#store.has(id)
  }
}

export default ConversationStore
