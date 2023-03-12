import { getReadLine } from '../src/utils'
import {
  ChatGPT,
  IChatCompletionStreamOnEndData,
  IChatGPTResponse,
} from '../src'
import apiKey from './.key'

const api = new ChatGPT({
  apiKey,
  debug: true,
})

void (async function () {
  let prevRes = (await basicRunner('你好')) as IChatCompletionStreamOnEndData
  console.log('---------------------ChatGPT says------------------------')
  console.log(prevRes.data)
  let line = ''
  const readline = getReadLine()
  console.log('---------------------your question------------------')
  while ((line = await readline())) {
    prevRes = (await basicRunner(
      line,
      prevRes ? (prevRes.data as IChatGPTResponse).id : undefined,
    )) as IChatCompletionStreamOnEndData
    console.log('---------------------ChatGPT says------------------------')
    console.log(prevRes.data)
    console.log('---------------------your question------------------')
  }
})()

async function basicRunner(
  text: string,
  parentMessageId?: string,
  sys?: string,
) {
  return await api.sendMessage({
    text,
    parentMessageId,
    systemPrompt: sys,
  })
}
