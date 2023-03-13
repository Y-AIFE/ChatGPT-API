import Keyv from 'keyv'
import LRUCache from 'lru-cache'
import Tokenizer from './Tokenizer'

import {
  IChatGPTHTTPDataMessage,
  IConversationStoreParams,
  TCommonMessage,
  ERole,
  TLog,
} from './types'

/**
 * conversation manage
 */
export default class ConversationStore {
  #store: Keyv<TCommonMessage, any>
  #lru: LRUCache<string, TCommonMessage>
  /**
   * in case some bad things happen
   */
  #maxFindDepth: number
  #debug: boolean
  #log: TLog
  constructor(params: IConversationStoreParams) {
    const { maxKeys = 100000, maxFindDepth = 20, debug, log } = params
    this.#lru = new LRUCache<string, TCommonMessage>({
      max: maxKeys,
    })
    this.#store = new Keyv<TCommonMessage, any>({
      store: this.#lru,
    })
    this.#maxFindDepth = maxFindDepth
    this.#debug = debug
    this.#log = log

    if (this.#debug) this.#log('ConversationStore params', params)
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
  async set(msgs: TCommonMessage[]) {
    for (const msg of msgs) {
      await this.#store.set(msg.id, msg)
    }
    if (this.#debug) this.#log('lru size', this.#lru.size)
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
  async clear1Conversation(id?: string) {
    let parentMessageId: string | undefined = id
    let cnt = 0
    while (parentMessageId && cnt < this.#maxFindDepth) {
      cnt++
      const msg: TCommonMessage | undefined = await this.get(parentMessageId)
      if (msg) {
        await this.delete(msg.id)
      }
      parentMessageId = msg?.parentMessageId
    }
  }
  /**
   * find messages in a conversation by id
   * @param id parentMessageId
   */
  async findMessages(opts: {
    id: string | undefined
    tokenizer: Tokenizer
    limit: number
    availableTokens: number
    ignore: boolean
  }) {
    let {
      id = undefined,
      tokenizer,
      limit,
      availableTokens,
      ignore = false,
    } = opts
    if (this.#debug) {
      this.#log('[ConversationStore findMessages start]', id)
    }
    let parentMessageId: string | undefined = id
    let cnt = 0
    const messages: IChatGPTHTTPDataMessage[] = []
    while (parentMessageId && cnt < this.#maxFindDepth) {
      const msg: TCommonMessage | undefined = await this.#store.get(
        parentMessageId,
      )
      if (msg && !(ignore && msg.role === ERole.assistant)) {
        let tokensCnt = msg.tokens || tokenizer.getTokenCnt(msg.text)
        if (tokensCnt <= limit) {
          if (availableTokens < tokensCnt) break
          messages.unshift({
            role: msg.role,
            content: msg.text,
          })
          cnt++
          availableTokens -= tokensCnt
        }
      }
      parentMessageId = msg?.parentMessageId
    }
    if (this.#debug) {
      this.#log('availableTokens', availableTokens)
      this.#log('[ConversationStore findMessages end]', messages)
      if(id) {
        this.#log('[parentMessage]', await this.#store.get(id))
      }
    }
    return messages
  }
  /**
   * clear the store
   */
  async clearAll() {
    await this.#store.clear()
  }
}
