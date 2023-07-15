import { AxiosRequestConfig } from 'axios';
import { TiktokenEmbedding } from '@dqbd/tiktoken';

/**
 * ChatCompletion 回答
 */
interface IChatCompletion {
    id: string;
    object: string;
    created: number;
    model: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    choices: {
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
        index: number;
    }[];
}
interface IChatCompletionErrReponseData {
    message?: string;
    type?: string;
    param?: any;
    code?: string;
}
interface IChatCompletionStreamOnEndData {
    success: boolean;
    data: IChatGPTResponse | IChatCompletionErrReponseData;
    raw?: IChatCompletion | IChatCompletionErrReponseData;
    status: number;
}
type TChatCompletionStreamOnEnd = (endData: IChatCompletionStreamOnEndData) => void;
/**
 * response message
 */
interface IChatGPTResponse {
    id: string;
    /**
     * response text
     */
    text: string;
    created: number;
    role: ERole;
    parentMessageId?: string;
    /**
     * questions and response text, tatal tokens
     */
    tokens: number;
    /**
     * questions and response text, tatal length
     */
    len: number;
}
/**
 * user message
 */
interface IChatGPTUserMessage {
    id: string;
    text: string;
    role: ERole;
    parentMessageId?: string;
    tokens?: number;
}
/**
 * system situation message
 */
interface IChatGPTSystemMessage {
    id: string;
    text: string;
    role: ERole;
    parentMessageId?: string;
    tokens?: number;
}
interface IChatGPTHTTPDataMessage {
    role: ERole;
    content: string;
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
interface IConversationStoreParams {
    maxKeys?: number;
    maxFindDepth?: number;
    debug: boolean;
    log: TLog;
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
         * lru max keys, default `300000`
         */
        maxKeys?: number;
        /**
         * Recursively search for historical messages, default `30` messages will be sent to the ChatGPT server
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
     * same reason as `limitTokensInAMessage`, **Maybe the message returned by ChatGPT should not be sent to the ChatGPT server as a prompt for the next conversation**, default value is `false`
     * - `true`: will ignore ChatGPT server message in the next sendMessage, and will only refer to `limitTokensInAMessage` in history messages
     * - `false`: will only refer to `limitTokensInAMessage` in history messages
     */
    ignoreServerMessagesInPrompt?: boolean;
    log?: TLog;
    AZURE?: {
        /**
         * createChatCompletion url
         */
        createChatCompletion: string;
    };
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
type TCommonMessage = IChatGPTResponse | IChatGPTUserMessage | IChatGPTSystemMessage;
/**
 * Pass in your own logger
 */
type TLog = (msg: string, ...args: any[]) => void;
interface ISendMessagesOpts {
    text?: string;
    systemPrompt?: string;
    parentMessageId?: string;
    onProgress?: (t: string, raw: string) => void;
    onEnd?: (d: IChatCompletionStreamOnEndData) => void;
    initialMessages?: TCommonMessage[];
    model?: string;
}

declare class ChatGPT {
    #private;
    constructor(opts: IChatGPTParams);
    /**
     * get related messages
     * @param parentMessageId
     */
    getMessages(opts: {
        id: string;
        maxDepth?: number;
    }): Promise<TCommonMessage[]>;
    /**
     * add messages to store
     * @param messages
     * @returns
     */
    addMessages(messages: TCommonMessage[]): Promise<void>;
    /**
     * send message to ChatGPT server
     * @param opts.text new message
     * @param opts.systemPrompt prompt message
     * @param opts.parentMessageId
     */
    sendMessage(opts: ISendMessagesOpts | string | TCommonMessage[]): Promise<IChatCompletionStreamOnEndData>;
    clear1Conversation(parentMessageId?: string): Promise<void>;
    getStoreSize(): number;
    createModeration(input: string): Promise<boolean>;
}

export { ChatGPT, ERole, IChatCompletion, IChatCompletionErrReponseData, IChatCompletionStreamOnEndData, IChatGPTHTTPDataMessage, IChatGPTParams, IChatGPTResponse, IChatGPTSystemMessage, IChatGPTUserMessage, IConversationStoreParams, ISendMessagesOpts, ITokensParams, TChatCompletionStreamOnEnd, TCommonMessage, TLog };
