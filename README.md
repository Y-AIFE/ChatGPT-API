<div align="center">
<img width="197" src="./assets/icon2.png"/><img width="200" src="./assets/icon1.png" alt="generate by stable diffusion"/>
</a>
</div>
<h1 align="center">ChatGPT-api-yunyuv</h1>

This is a more universal open-source library for the ChatGPT API that supports the CommonJS module system. Your Node.js version only needs to be above **v12**(The lower versions have not been tested yet) to use it. In general, it's a fairly universal ChatGPT API library that invokes the official ChatGPT HTTP interface directly.

- Supports **CommonJS** 
- Supports **NodeJS V12+**
- The network requests are made using axios and support **proxy**

> The original intention of the project was to address the lack of support for CommonJS among existing open-source libraries, which made it challenging to integrate them into older projects. Additionally, OpenAI has recently banned certain IP addresses, so I need proxy support when making requests.

In addition, this library plans to support most of OpenAI's open HTTP interfaces to better utilize the services provided by OpenAI. For specific documentation, please refer to [API REFERENCE](https://platform.openai.com/docs/api-reference/models/list).

As you may often encounter poor ChatGPT website experience, using API interface to ask questions in the future may become more efficient.

## install

Just run

```bash
npm i @yunyuv/chatgpt

# or
yarn add @yunyuv/chatgpt

# or
pnpm i @yunyuv/chatgpt
```

## usage

The First Example:

![chatgpt](./assets//chatgpt1.gif)

```ts
// app.ts
import { ChatGPT } from '@yunyuv/chatgpt'

const api = new ChatGPT({
  apiKey: 'your api key', // get api key https://platform.openai.com/account/api-keys
})
async function run() {
  const res = await api.sendMessage({
    text: 'please introduce yourself',
  })
  console.log(res.text)
}
run()
```

You can get API key at [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).

## api

```typescript
interface IChatGPTParams {
  /**
   * apiKey, you can get it in https://platform.openai.com/account/api-keys,You can apply for up to 5 at most.
   */
  apiKey: string;
  /**
   * model，default is 'gpt-3.5-turbo'
   */
  model?: string;
  /**
   * print logs
   */
  debug?: boolean;
  /**
   * axios configs
   */
  requestConfig?: AxiosRequestConfig;
  /**
   * configs for store
   */
  storeConfig?: {
    /**
     * lru max keys, default 10000
     */
    maxKeys?: number;
    /**
     * Recursively search for historical messages, default 20 messages will be sent to the ChatGPT server
     */
    maxFindDepth?: number;
  };
  tokenizerConfig?: ITokensParams;
  /**
   * the maximum number of tokens when initiating a request, including prompts and completion. The default value is 4096.
   */
  maxTokens?: number;
  /**
   * The maximum number of tokens for a single message. It is used to prevent from sending too many tokens to the ChatGPT server.
   * If this number is exceeded, the message will be deleted and not passed on as a prompt to the chatGPT server. The default value is `1000`.
   * - notice: **Maybe the message returned by ChatGPT should not be sent to the ChatGPT server as a prompt for the next conversation**.
   */
  limitTokensInAMessage?: number;
  /**
   * same reason as `limitTokensInAMessage`, **Maybe the message returned by ChatGPT should not be sent to the ChatGPT server as a prompt for the next conversation**, default value is `true`
   * - `true`: will ignore ChatGPT server message in the next sendMessage, and will only refer to `limitTokensInAMessage` in history messages
   * - `false`: will only refer to `limitTokensInAMessage` in history messages
   */
  ignoreServerMessagesInPrompt?: boolean;
}
```

```typescript
/**
 * send message to ChatGPT server
 * @param opts.text new message
 * @param opts.systemPrompt prompt message
 * @param opts.parentMessageId
 */
sendMessage(opts: {
  text: string;
  systemPrompt?: string;
  parentMessageId?: string;
} | string): Promise<IChatGPTResponse>;
```

## demos

see [demos](./demo/)

## ref

- [chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api)