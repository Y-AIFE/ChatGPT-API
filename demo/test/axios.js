const axios = require('axios')
const key = require('../.key.js')

async function run() {
  const response = await axios({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer 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`,
    },
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
    validateStatus(status) {
      return true
    },
    data: {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: '解释下早睡早起和晚睡晚起的区别，应该选择哪一个',
        },
      ],
      stream: true
    },
    responseType: 'stream'
  })
  if (response.status >= 200 && response.status < 300) {
    console.log('[response]', response.data)
  } else {
    console.log('[response]', {
      data: {
        message: response.data.error.message,
        type: response.data.error.type,
        code: response.data.error.code,
      },
      status: response.status,
    })
  }
}

run()
