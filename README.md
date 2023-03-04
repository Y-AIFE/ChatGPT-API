<div align="center">
<img width="197" src="./assets/icon2.png"/><img width="200" src="./assets/icon1.png" alt="generate by stable diffusion"/>
</a>
</div>
<h1 align="center">ChatGPT-api-yunyuv</h1>

This is a more universal open-source library for the ChatGPT API that supports the CommonJS module system. Your Node.js version only needs to be above **v12**(The lower versions have not been tested yet) to use it. In general, it's a fairly universal ChatGPT API library that invokes the official ChatGPT HTTP interface directly.

- Support **CommonJS** 
- Support **NodeJS V12+**
- The network requests are made using axios and support proxy.

> The original intention of the project was to address the lack of support for CommonJS among existing open-source libraries, which made it challenging to integrate them into older projects. Additionally, OpenAI has recently banned certain IP addresses, so I needed proxy support when making requests.

In addition, this library plans to support most of OpenAI's open HTTP interfaces to better utilize the services provided by OpenAI. For specific documentation, please refer to [API REFERENCE](https://platform.openai.com/docs/api-reference/models/list).

As you may often encounter poor Chatgpt website experience, using API interface to ask questions in the future may become more efficient.

## usage



## ref

- [chatgpt-api](https://github.com/transitive-bullshit/chatgpt-api)