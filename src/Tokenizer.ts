import { get_encoding, Tiktoken } from '@dqbd/tiktoken'
import { ITokensParams, TCommonMessage } from './types'

export default class Tokenizer {
  #tokenizer: Tiktoken
  #replaceReg: RegExp
  #replaceCallback: (...args: any[]) => string
  constructor(opts: ITokensParams) {
    const {
      encoding = 'cl100k_base',
      replaceReg = /<\|endoftext\|>/g,
      replaceCallback = (...args: any[]) => '',
    } = opts
    this.#tokenizer = get_encoding(encoding)
    this.#replaceReg = replaceReg
    this.#replaceCallback = replaceCallback
  }
  #encode(text: string): Uint32Array {
    return this.#tokenizer.encode(text)
  }
  /**
   * get the text tokens count
   * @param text
   * @returns
   */
  getTokenCnt(msg: TCommonMessage | string){
    if(typeof msg === 'object' && msg.tokens) return msg.tokens
    msg = typeof msg === 'object' ? msg.text : msg
    const text = msg.replace(this.#replaceReg, this.#replaceCallback)
    return this.#encode(text).length
  }
}

// const token = new Tokenizer({
//   replaceReg: /hello|world/g,
//   replaceCallback(c: string) {
//     return 'ok'
//   },
// })
// console.log(token.getTokenCnt('hello world'))
