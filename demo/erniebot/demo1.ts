import { ErnieBot } from '../../src/ErnieBot'

const bot = new ErnieBot({
  apiKey: process.env.BAIDU_BCE_API_KEY as string,
  secretKey: process.env.BAIDU_BCE_SK as string,
})

;(async () => {
  await bot.sendStreamMessage({
    initialMessages: [
      {
        role: 'user',
        content: '介绍下你自己',
      },
      {
        role: 'assistant',
        content: '我是小胖AI，你的个人助手',
      },
      {
        role: 'user',
        content: '你叫什么？',
      },
    ],
    onProgress(t) {
      process.stdout.write(t)
    },
    onEnd(t) {
      console.log('end', t)
    },
  })
})()
