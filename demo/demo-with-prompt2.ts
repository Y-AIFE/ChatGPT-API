import apiKey from './.key'
import { ChatGPT } from '../src'
import { getReadLine } from '../src/utils'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
  debug: true,
  requestConfig: {
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
  },
})

void (async function () {
  console.log('---------------------your question------------------')
  console.log({ text: '说说你的看法', systemPrompt: '你是一个前端技术专家' })
  let prevRes: any
  await api.sendMessage({
    text: '说说你对未来几年前端发展的方向会有哪些',
    systemPrompt: '你是一个前端技术专家',
    onProgress(e) {
      console.log('[onProgress1]', e)
    }, onEnd(e) {
      console.log('[onEnd1]', e)
      prevRes = e.data
    }
  })
  console.log(prevRes && prevRes.data)
  let line = ''
  const readline = getReadLine()
  console.log('---------------------your question------------------')
  while ((line = await readline())) {
    prevRes = await basicRunner(
      line,
      prevRes.id,
    )
    console.log('---------------------ChatGPT says------------------------')
    console.log(prevRes)
    console.log('---------------------your question------------------')
  }
})()

function basicRunner(text: string, parentMessageId?: string) {
  return new Promise((resolve, reject) => {
    api.sendMessage({
      text,
      parentMessageId,
      onProgress(e) {
        console.log('[onProgress2]', e)
      },
      onEnd(e) {
        console.log('[onEnd]2', e)
        resolve(e.data)
      },
    })
  })
}
