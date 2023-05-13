import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: process.env.AZURE_OPENAI_API_KEY as string, // get api key
  AZURE: {
    createChatCompletion:
      'https://gptdemo1.openai.azure.com/openai/deployments/deploy1/chat/completions?api-version=2023-03-15-preview',
  },
})

async function run() {
  const res = await api.sendMessage({
    text: '你好呀',
  })
  console.log('res', res)
}

run()
// res {
//   success: true,
//   data: {
//     id: 'bbf8e666-b804-46c4-b8e8-101bdb26d21d',
//     text: '你好！有什么我能帮助你的吗？',
//     created: 1683980830,
//     role: 'assistant',
//     parentMessageId: '82eb6719-2a69-4bfb-9a10-61b255e29ce3',
//     tokens: 68,
//     len: 133
//   },
//   status: 200
// }