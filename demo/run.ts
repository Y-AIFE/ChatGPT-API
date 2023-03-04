import ChatGPT from './../src/Chatgpt'
import apiKey from './.key'

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

async function run() {
  try {
    const res = await api.createChatCompletion({
      text: '说说成都有哪些好玩的地方', 
      systemPrompt: '假定你是一个旅游博主'
    })
    console.log(res.text)
  } catch (e) {
    console.log('err', e)
  }
}

run()

// '用Vue3设计一个类似 ExcalDraw 的画布应用，写出比较详细的代码',
