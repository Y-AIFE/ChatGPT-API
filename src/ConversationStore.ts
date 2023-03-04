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
export default class ConversationStore {
  #store: Keyv<TCommonMessage, any>
  constructor() {
    const lru = new LRUCache<string, TCommonMessage>({
      max: 10000,
    })
    this.#store = new Keyv<TCommonMessage, any>({
      store: lru,
    })
  }
  /**
   * get message by id
   * @param id
   * @returns
   */
  async get(id: string): Promise<TCommonMessage | undefined> {
    return await this.#store.get(id)
  }
  /**
   * set new message
   * @param msg
   * @returns
   */
  async set(msg: TCommonMessage): Promise<boolean> {
    return await this.#store.set(msg.id, msg)
  }
  /**
   * check if the id exists in the store
   * @param id
   * @returns
   */
  async has(id: string): Promise<boolean> {
    return await this.#store.has(id)
  }
  /**
   * delete one message
   * @param id
   * @returns
   */
  async delete(id: string): Promise<boolean> {
    return await this.#store.delete(id)
  }
  /**
   * clear one conversation，it will be used when you set a new system prompt，which means that you will be in a new context，so early messages will be deleted
   * @param id last conversation id
   */
  async clear1Conversation(id: string) {
    let parentMessageId: string | undefined = id
    while (parentMessageId && this.has(parentMessageId)) {
      const msg: TCommonMessage | undefined = await this.get(parentMessageId)
      if (msg) {
        await this.delete(msg.id)
      }
      parentMessageId = msg?.parentMessageId
    }
    console.log('conversation cleared')
  }

  /**
   * clear the store
   */
  async clearAll() {
    await this.#store.clear()
  }
}
