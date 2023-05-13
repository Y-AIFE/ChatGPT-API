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
    text: '介绍下你自己',
    onProgress(t) {
      process.stdout.write(t)
    },
    onEnd(t) {
      console.log('[onEnd]', t)
    },
  })
  console.log('res', res)
}

run()

// 我是ChatGPT，一个大型的自然语言处理模型，由OpenAI公司训练。我被设计成可以自动回答各种各样的问题，帮助人们解决问题，提供信息和娱乐。我有广泛的知识，可以回答许多主题问题，从科学和技术到历史和文化，甚至包括日常生活中的问题。
// [onEnd] {
//   success: true,
//   data: {
//     id: 'f6c068db-5d44-4a66-ba38-dbdb50e0c12d',
//     text: '我是ChatGPT，一个大型的自然语言处理模型，由OpenAI公司训练。我被设计成可以自动回答各种各样的问题，帮助人们解决问题，提供信息和娱乐。我有广泛的知识，可以回答许多主题问题，从科学和技术到历史和文化，甚至包括日常生
// 活中的问题。',
//     created: 1683980782,
//     role: 'assistant',
//     parentMessageId: '2057cfbb-87c2-4a21-b9f8-7441fc54e520',
//     tokens: 159,
//     len: 239
//   },
//   status: 200
// }
// res {
//   success: true,
//   data: {
//     id: 'f6c068db-5d44-4a66-ba38-dbdb50e0c12d',
//     text: '我是ChatGPT，一个大型的自然语言处理模型，由OpenAI公司训练。我被设计成可以自动回答各种各样的问题，帮助人们解决问题，提供信息和娱乐。我有广泛的知识，可以回答许多主题问题，从科学和技术到历史和文化，甚至包括日常生
// 活中的问题。',
//     created: 1683980782,
//     role: 'assistant',
//     parentMessageId: '2057cfbb-87c2-4a21-b9f8-7441fc54e520',
//     tokens: 159,
//     len: 239
//   },
//   status: 200
// }
