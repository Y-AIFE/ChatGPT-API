/**
 * docs https://platform.openai.com/docs/api-reference/chat
 * azure docs https://learn.microsoft.com/zh-cn/azure/cognitive-services/openai/reference
 */
const urls = {
  listModels: 'https://api.openai.com/v1/models', // get
  createCompletion: 'https://api.openai.com/v1/completions', // post
  createChatCompletion: 'https://api.openai.com/v1/chat/completions', // post
  createModeration: 'https://api.openai.com/v1/moderations' // post
}

export default urls
