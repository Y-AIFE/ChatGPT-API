export interface IErnieBotAccessTokenErr {
  error_description: string
  error: string
}
export interface IErnieBotAccessToken {
  refresh_token: string
  expires_in: number
  session_key: string
  access_token: string
  scope: string
  session_secret: string
}
export interface IErnieBotUserMessage {
  role: 'user'
  content: string
}
export interface IErnieBotAssistantMessage {
  role: 'assistant'
  content: string
}
export type TErnieBotCommonMessage =
  | IErnieBotUserMessage
  | IErnieBotAssistantMessage

export interface IErnieBotResponseErr {
  error_code: number
  error_msg: string
  id: string
}
export interface IErnieBotOnEndOpts {
  success: boolean
  err?: IErnieBotResponseErr | string
  text: string
}
export interface IErnieBotSendMessageOpts {
  initialMessages: TErnieBotCommonMessage[]
  onProgress: (t: string, raw: string) => void
  onEnd: (opts: IErnieBotOnEndOpts) => void
  model?: string
}
