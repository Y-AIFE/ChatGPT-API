import { getReadLine } from '../src/utils'
import { ChatGPT } from '../src'
import apiKey from './.key'

const api = new ChatGPT({
  apiKey,
  debug: true,
  requestConfig: {
    timeout: 1000 * 600,
  },
})

void (async function () {
  console.log('---------------------your question------------------')
  console.log({ text: '说说你的看法', systemPrompt: '你是一个前端技术专家' })
  let prevRes = await api.sendMessage({
    text: '说说你的看法',
    systemPrompt: '你是一个前端技术专家',
  })
  console.log(prevRes.text)
  let line = ''
  const readline = getReadLine()
  console.log('---------------------your question------------------')
  while ((line = await readline())) {
    prevRes = await basicRunner(line, prevRes?.id)
    console.log('---------------------ChatGPT says------------------------')
    console.log(prevRes.text)
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
