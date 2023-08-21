import axios from 'axios'

async function getAccessToken(): Promise<string> {
  const url =
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${process.env.BAIDU_BCE_API_KEY}&client_secret=${process.env.BAIDU_BCE_SK}`
  const response = await axios.post(url, '', {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  })
  return response.data.access_token
}

async function main() {
  const url =
    'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=' +
    (await getAccessToken())
  const payload = {
    messages: [
      {
        role: 'user',
        content: '你是一个作家',
      },
      {
        role: 'assistant',
        content: '你好呀',
      },
      {
        role: 'user',
        content: '介绍下你自己',
      },
      {
        role: 'assistant',
        content: '我是文心一言',
      },
    ],
  }
  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  })
  console.log(response.data)
}

main()

// {
//   id: 'as-cmmvbiyuf6',
//   object: 'chat.completion',
//   created: 1690189247,
//   result: '您好，我是文心一言，英文名是ERNIE Bot。我能够与人对话互动，回答问题，协助创作，高效便捷地帮助人们获取信息、知识和灵感。',
//   is_truncated: false,
//   need_clear_history: false,
//   usage: { prompt_tokens: 7, completion_tokens: 49, total_tokens: 56 }
// }