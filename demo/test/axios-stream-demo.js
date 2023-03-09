const axios = require('axios')
const key = require('../.key.js')

async function run() {
  const response = await axios({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
    validateStatus(status) {
      return true
    },
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer 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`,
    },
    data: {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: '解释下早睡早起和晚睡晚起的区别，应该选择哪一个',
        },
      ],
      stream: true,
    },
    responseType: 'stream',
  })
  const stream = response.data
  const status = response.status
  if (status >= 200 && status < 300) {
    let resText = ''

    stream.on('data', (buf) => {
      try {
        const dataArr = buf.toString().split('\n')
        for (const dataStr of dataArr) {
          // split 之后的空行，或者结束通知
          if (dataStr.indexOf('data: ') !== 0 || dataStr === 'data: [DONE]')
            continue
          const parsedData = JSON.parse(dataStr.slice(6)) // [data: ]
          const pieceText = parsedData.choices[0].delta.content || ''
          if (pieceText === '') {
            console.log('[empty pieceText]', dataStr)
          }
          resText += pieceText
          console.log('[stream]', pieceText)
        }
      } catch (e) {
        console.log('[err]', e)
        console.log('[catch]', buf.toString())
      }
    })

    stream.on('end', (d) => {
      console.log('[end]')
    })
  } else {
    // console.log('[response]', Object.keys(response.data))
    // console.log('[response]', {
    //   data: {
    //     message: response.data.error.message,
    //     type: response.data.error.type,
    //     code: response.data.error.code,
    //   },
    //   status: response.status,
    // })

    stream.on('data', (buf) => {
      console.log('[data]')
      const data = JSON.parse(buf.toString())
      // that is stream
      // error: {
      //     message: 'Your access was terminated due to violation of our policies, please check your email for more information. If you believe this is in error and would like to appeal, please contact support@openai.com.',
      //     type: 'access_terminated',
      //     param: null,
      //     code: null
      //   }
      // }
      console.log('[response]', {
        data: {
          message: data.error.message,
          type: data.error.type,
        },
        status: response.status,
      })
    })
    stream.on('end', (d) => {
      console.log('[total]')
    })
  }
}

run()
