import axios from 'axios'
import type {
  IErnieBotAccessToken,
  IErnieBotAccessTokenErr,
  IErnieBotSendMessageOpts,
  IErnieBotUserMessage,
  IErnieBotAssistantMessage,
  TErnieBotCommonMessage,
  IErnieBotResponseErr,
} from './ErnieBotTypes'

interface IErnieBotParams {
  apiKey: string
  secretKey: string
  debug?: boolean
}

export class ErnieBot {
  #apiKey = ''
  #model = ''
  #secretKey = ''
  #debug = false
  constructor(opts: IErnieBotParams) {
    const { apiKey, secretKey, debug = false } = opts
    this.#apiKey = apiKey
    this.#secretKey = secretKey
    this.#debug = debug
  }
  private async getAccessToken(): Promise<string> {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${
      this.#apiKey
    }&client_secret=${this.#secretKey}`

    const response = await axios(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      validateStatus: (status) => true,
    })

    const data = response.data as IErnieBotAccessToken
    if (!data.access_token)
      throw { msg: 'access_token 获取失败', status: response.status }
    return data.access_token
  }
  async sendStreamMessage(opts: IErnieBotSendMessageOpts) {
    try {
      const accessToken = await this.getAccessToken()
      const apiUrl = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`

      const requestData = {
        messages: opts.initialMessages,
        stream: true,
      }

      const headers = {
        'Content-Type': 'application/json',
      }

      const axiosResponse = await axios.post(apiUrl, requestData, {
        headers,
        responseType: 'stream',
      })
      let responseText = ''
      const stream = axiosResponse.data // 请求被取消之后变成 undefined
      const status = axiosResponse.status
      if (status === 200) {
        let hasErr = false
        let err: IErnieBotResponseErr
        stream.on('data', (buf: Buffer) => {
          try {
            const dataArr = buf.toString().split('\n')
            let onDataPieceText = ''
            for (const dataStr of dataArr) {
              // split 之后的空行，或者结束通知
              if (dataStr[0] === '{') throw dataStr
              if (dataStr.indexOf('data: ') !== 0) continue
              const parsedData = JSON.parse(dataStr.slice(6)) // [data: ]
              const pieceText = parsedData.result || ''
              onDataPieceText += pieceText
            }
            opts.onProgress(onDataPieceText, buf.toString())
            responseText += onDataPieceText
          } catch (e) {
            const dataStr = buf.toString()
            const parsedData = JSON.parse(dataStr) // [data: ]
            hasErr = true
            err = parsedData
          }
        })
        stream.on('end', async () => {
          opts.onEnd({
            success: !hasErr,
            err,
            text: responseText,
          })
        })
      } else {
        opts.onEnd({
          success: false,
          err: String(axiosResponse.data),
          text: '',
        })
      }
    } catch (error: any) {
      opts.onEnd({
        success: false,
        err: String(error.message),
        text: '',
      })
    }
  }
}