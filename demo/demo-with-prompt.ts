import { getReadLine } from '../src/utils'
import { ChatGPT } from '../src'
import { IChatGPTResponse } from '../src/types'
import apiKey from './.key'

const api = new ChatGPT({
  apiKey,
})

void (async function () {
  console.log('---------------------your question------------------')
  console.log({ text: '1 + 1=', systemPrompt: '你是一个计算器，接下来我会给你运算过程，你只需要给我结果' })
  let prevRes = await api.sendMessage({
    text: '1 + 1=',
    systemPrompt: '你是一个计算器，接下来我会给你运算过程，你只需要给我结果',
  })
  console.log(prevRes && (prevRes.data as IChatGPTResponse).text)
  let line = ''
  const readline = getReadLine()
  console.log('---------------------your question------------------')
  while ((line = await readline())) {
    prevRes = await basicRunner(
      line,
      prevRes ? (prevRes.data as IChatGPTResponse).id : undefined,
    )
    console.log('---------------------ChatGPT says------------------------')
    console.log(prevRes && (prevRes.data as IChatGPTResponse).text)
    console.log('---------------------your question------------------')
  }
})()

async function basicRunner(text: string, parentMessageId?: string) {
  const res = await api.sendMessage({
    text,
    parentMessageId,
  })
  return res
}
