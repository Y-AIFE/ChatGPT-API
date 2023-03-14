import { getReadLine, genId } from '../src/utils'
import {
  ChatGPT,
  IChatCompletionStreamOnEndData,
  IChatGPTResponse,
  TCommonMessage,
  IChatGPTUserMessage,
  ERole,
} from '../src'
import apiKey from './.key'

const api = new ChatGPT({
  apiKey,
  debug: true,
  requestConfig: {
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
  },
})

const messages: TCommonMessage[] = []
function genUserMsg(text: string, parentMessageId?: string) :IChatGPTUserMessage{
  return {
    id: genId(),
    text,
    role: ERole.user,
    parentMessageId,
  }
}
function pushMsg(msgs: TCommonMessage[], msg: TCommonMessage) {
  if(msgs.length) {
    msg.parentMessageId = msgs[msgs.length - 1].id
  }
  msgs.push(msg)
}
pushMsg(messages, genUserMsg('你好'))

void (async function () {
  let prevRes = (await basicRunner(messages)) as IChatCompletionStreamOnEndData
  console.log('---------------------ChatGPT says------------------------')
  console.log((prevRes.data as IChatGPTResponse).text)
  pushMsg(messages, prevRes.data as IChatGPTResponse)
  let line = ''
  const readline = getReadLine()
  console.log('---------------------your question------------------')
  while ((line = await readline())) {
    pushMsg(messages, genUserMsg(line))
    prevRes = await basicRunner(messages) as IChatCompletionStreamOnEndData
    console.log('---------------------ChatGPT says------------------------')
    console.log((prevRes.data as IChatGPTResponse).text)
    pushMsg(messages, prevRes.data as IChatGPTResponse)
    console.log('---------------------your question------------------')
  }
})()

async function basicRunner(msgs: TCommonMessage[]) {
  return await api.sendMessage(msgs)
}
// @todo stream chat initialMessages 测试