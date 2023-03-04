import { AxiosRequestConfig } from 'axios';
import { TiktokenEmbedding } from '@dqbd/tiktoken';

/**
 * response message
 */
interface IChatGPTResponse {
    id: string;
    text: string;
    created: number;
    role: ERole;
    parentMessageId?: string;
    tokens?: number;
}
declare enum ERole {
    /**
     * conversation situation
     */
    system = "system",
    /**
     * role is user
     */
    user = "user",
    /**
     * role is chatgpt
     */
    assistant = "assistant"
}
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
/**
 * Tokenizer params
 */
interface ITokensParams {
    /**
     * "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base", default 'cl100k_base'
     */
    encoding?: TiktokenEmbedding;
    /**
     * replace regexp
     */
    replaceReg?: RegExp;
    /**
     * replace function
     */
    replaceCallback?: (...args: any[]) => string;
}

declare class ChatGPT {
    #private;
    constructor(opts: IChatGPTParams);
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
}

export { ChatGPT };
