import { stdin, stdout } from 'process'
import { createInterface } from 'readline'
import ChatGPT from '../src/Chatgpt'
import apiKey from './.key'

function getReadLine() {
  const rl = createInterface({ input: stdin, output: stdout })
  const iter = rl[Symbol.asyncIterator]()
  return async () => (await iter.next()).value
}

void (async function () {
  let prevRes: any
  let line = ''
  const readline = getReadLine()
  console.log('---------------------提出你的问题------------------')
  while ((line = await readline())) {
    prevRes = await basicRunner(line, prevRes?.id)
    console.log('---------------------答案------------------------')
    console.log(prevRes.text)
    console.log('---------------------提出你的问题------------------')
  }
})()

const api = new ChatGPT({
  apiKey,
  debug: true,
  requestConfig: {
    timeout: 1000 * 60,
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 33210,
    },
  },
})

async function basicRunner(text: string, parentMessageId?: string) {
  const res = await api.createChatCompletion({
    text,
    parentMessageId,
  })
  return res
}
