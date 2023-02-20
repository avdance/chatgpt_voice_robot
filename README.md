## 项目介绍
这是一个很奇妙的小项目，做这个项目的初衷是想验证一下，是否可以将音视频技术与ChatGPT结合起来，做一个很酷炫的产品。

该项目可以作为音视频聊天机器人的基础，从而实现像类似**智能客户**、**在线问答** 之类的产品。你甚至可以把它当成一个**在线助教**，任何时间任何地址回答同学们的问题。

总之，这个小项目还是挺酷的。

## 效果展示
<img width="989" alt="voice_chat" src="https://user-images.githubusercontent.com/49577129/220062542-cbbb7daf-b8e1-41f1-8b1a-e800d986b1a2.png">

视频地址如下：[【作品】WebRTC+ChatGPT实现语音聊天机器人](https://www.bilibili.com/video/BV1ty4y1Z7V1/?share_source=copy_web&vd_source=b393e4210396ee161923c1d02340e78d)

## 先决条件

### 已有ChatGPT帐号

>注册ChatGPT的过程我就不讲了，一是要能上外网（香港不算），另一个就是要能接收短信。

- 当ChatGPT帐号注册好后,打开下面网址[https://platform.openai.com/](https://console.xfyun.cn/)
- 登录后，点击右上角**Personal**
- 选择**View API keys**
- 之后，点击下面的**Create new secret key**，创建一个新的Key。将新创建好的key保存下来。

### 已有科大讯飞帐号

- 打开下面网址[https://console.xfyun.cn/](https://console.xfyun.cn/), 到科大讯飞注册一个账户
- 创建一个新的应用
- 之后，选择**左侧**->**语音识别**->**实时语音转写**
- 购买服务后，可以看到**服务接口认证信息**里边包括了**APPID**和**APIKey**

通过上面的步骤先决条件就准备好了。接下来我们来看看如何配置这几个参数。

## 配置
- 下载源码
- 打开src目录下的App.vue文件
- 将上面获取到的ChatGPT APIKey 和科大讯飞的 APPID、APIKey分别填入对应的变量中

接下来安装启动Web服务。

## 安装启动服务

**特别注意：本项目只能在 本机使用 或部署在 有域名证书 的服务器上。**

本地安装运行步骤如下：
```
npm install
npm run serve
```

如果想部署到服务器上，可以先使用下面命令编译项目:
```
npm run build
```

之后再部署到服务器上即可。

**现在打开浏览器实验一下吧，祝好运！**

## 参考项目

- [飞书接入ChatGPT](https://github.com/bestony/ChatGPT-Feishu)
- [微信接入ChatGPT](https://github.com/wangrongding/wechat-bot)（小心微信被封)


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
