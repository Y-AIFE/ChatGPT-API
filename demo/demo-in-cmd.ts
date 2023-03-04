import { getReadLine } from '../src/utils'
import { ChatGPT } from '../src'
import apiKey from './.key'

void (async function () {
  let prevRes: any
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

const api = new ChatGPT({
  apiKey,
  debug: true,
  storeConfig: {
    maxKeys: 5000,
    // maxFindDepth: 5,
  },
  ignoreServerMessagesInPrompt: true,
})

async function basicRunner(text: string, parentMessageId?: string) {
  try {
    const res = await api.sendMessage({
      text,
      parentMessageId,
    })
    return res
  } catch (e: any) {
    console.log('e', e.message)
    return {}
  }
}
