const axios = require('axios')
const key = require('./.key.js')

async function run() {
  const response = await axios({
    method: 'POST',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
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
  let resText = ''

  stream.on('data', (buf) => {
    try {
      const dataArr = buf.toString().split('\n')
      for (const dataStr of dataArr) {
        // split 之后的空行，或者结束通知
        if(dataStr.indexOf('data: ') !== 0 || dataStr === 'data: [DONE]') continue
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
    console.log('[total]', resText)
  })
}

run()
