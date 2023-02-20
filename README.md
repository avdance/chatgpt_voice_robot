## 项目介绍
这是一个很奇妙的小项目，做这个项目的初终是想验证一下是否可以将音视频技术与ChatGPT结合起来，来做一个很酷炫的产品。

这个项目可以作为音视频聊天机器人的基础，从而实现像类似**智能客户**、**在线问答** 之类的产品，甚至你可以把它当成一个在线助教，任何时间任何地址回答同学们的问题。

总之，想想这个事儿还是挺酷的。


## 先决条件

### 已有ChatGPT帐号

>注册ChatGPT的过程我就不讲了，一是要能上外网，另一个就是要能接收短信。

- 当ChatGPT帐号注册好后,打开下面网址[https://platform.openai.com/](https://console.xfyun.cn/)
- 登录网址后，点击右上角**Personal**
- 选择**View API keys**
- 之后点击下面的**Create new secret key**创建一个新的Key,将该key记录下来。

### 已有科大讯飞帐号

- 打开下面网址[https://console.xfyun.cn/](https://console.xfyun.cn/), 到科大讯飞注册一个账户
- 创建一个新的应用
- 选择**左侧**->**语音识别**->**实时语音转写**
- 购买服务后，可以看到**服务接口认证信息**，里边包括了**APPID**和**APIKey**


## 配置
- 打开src目录下的App.vue文件
- 将上面获取到的ChatGPT APIKey 和科大讯飞的 APPID、APIKey分别填入对应的变量中

## 安装启动服务

**特别注意：本项目只能不输在本机使用，或部署在有域名证书的服务器上。**

安装运行步骤如下：
```
npm install
npm run serve
```

如果想部署到服务器上，可以使用下面命令先编译项目:
```
npm run build
```

之后再部署到服务器上。


## 参考项目

[飞书接入ChatGPT](https://github.com/bestony/ChatGPT-Feishu)
[微信接入ChatGPT](https://github.com/wangrongding/wechat-bot)（小心微信被封)


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
