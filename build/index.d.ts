import { AxiosRequestConfig } from 'axios';

/**
 * response message
 */
interface IChatGPTResponse {
    id: string;
    text: string;
    created: number;
    model: string;
    role: ERole;
    parentMessageId?: string;
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
     * print request config
     */
    debug?: boolean;
    /**
     * axios configs
     */
    requestConfig?: AxiosRequestConfig;
}
declare class ChatGPT {
    #private;
    constructor(opts: IChatGPTParams);
    /**
     * send message to ChatGPT server
     * @param text string new message
     * @param opts configs
     * @returns
     */
    createChatCompletion(opts: {
        text: string;
        systemPrompt?: string;
        parentMessageId?: string;
    } | string): Promise<IChatGPTResponse>;
}

export { ChatGPT };
