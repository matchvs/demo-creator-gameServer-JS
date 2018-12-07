# demo-creator-gameServer-JS

用Matchvs SDK 、gameServer（JS） 和 creator 开发的Demo，用于演示gameServer自定义服务端逻辑的功能。

本文介绍多人摘星星cocos creator案例的详细使用流程，跟随本教程开发者即可快速跑通案例、熟悉matchvs接入和Game Server开发流程。本文演示操作在macOS上，其他系统情况类似。

##  代码获取

[多人摘星星demo](https://github.com/matchvs/demo-creator-gameServer-JS)项目托管在github，首先将代码clone到本地

```shell
git clone https://github.com/matchvs/demo-creator-gameServer-JS.git
➜  demo-creator-gameServer-JS git:(master) ✗ tree -L 2
.
├── README.md
├── client
│   ├── CHANGELOG.md
│   ├── assets
│   ├── library
│   ├── local
│   ├── packages
│   ├── project.json
│   ├── settings
│   └── temp
└── server
    ├── Dockerfile
    ├── Makefile
    ├── conf
    ├── gsmeta
    ├── main.js
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    └── src

11 directories, 9 files
```

## Client目录结构说明

client 是游戏客户端代码，使用Creator开发，需要多名玩家匹配，就可进入游戏页面。由于浏览器有缓存，可以使用不同的浏览器打开，或者打开一个页面后清除浏览器缓存，在重新打开一个页面，即可进入游戏页面

- Lobby.js:首页的逻辑代码，主要包括初始化，注册，登录，进入房间的请求和回调

- mvs.js:MatchvsSDK的引用。

- Player.js:主要包括人物的移动逻辑。

- Star.js:星星的创建。

- GLBConfig.js:存放了主要的常量数据，game信息(ID、Key、Secret、platform等)在这此替换即可。

- Game.js:游戏页面的逻辑。


## Server目录结构说明

多人摘星星GameServer使用nodejs编写， server目录 是一个标准的node项目结构

```
cd server
➜  server git:(master) tree
.
├── Dockerfile
├── Makefile
├── conf
│   └── config.json
├── gsmeta
├── main.js
├── package.json
└── src
    ├── app.js
    ├── global.js
    └── room.js

2 directories, 9 files

```

package.json中可指定依赖的gameserver SDK版本，本文以3.6.1版本举例说明，更多GS SDK版本可查看[npm库](https://www.npmjs.com/package/gameserver-nodejs)。

conf是项目配置文件所在目录，配置文件为json格式；

src目录为业务逻辑实现，app.js里实现框架事件回调函数。

除了conf和src外其他文件具有特殊的作用一般也不需要修改，详情可参考[框架说明](https://github.com/matchvs/gameServer-JavaScript)。

- **Dokcerfile** 用于定制 Docker 镜像。Matchvs 使用 kubernetes 集群管理 gameServer，所以在 gameServer 发布上线时需要先打包成 Docker 镜像，然后才能顺利上线运行。框架提供了默认的 Dockerfile，开发者一般无需修改。
- **Makefile** 发布 gameServer 时，Matchvs 在服务器上执行`make image`生成 Docker 镜像。
- **README.md** 说明文档。
- **conf** gameServer 配置目录。
- **gsmeta** gameServer 元数据，记录当前 gameServer 框架的版本和语言等信息。
- **main.js** 启动脚本。用于 gameServer 初始化，例如读取 conf 目录下的配置文件，启动 gameServer 底层 gRPC 服务，以及开发者自定义模块的初始化。
- **package.json** 定义了 gameServer 所需要的各种模块，以及项目的配置信息（比如名称、版本、许可证等元数据）。
- **src** 源文件目录，开发者应将自己的代码放在该目录下统一管理。

为了启动gameserver，我们首先要通过npm安装项目依赖库

```
cd server
npm install

npm WARN deprecated circular-json@0.5.9: CircularJSON is in maintenance only, flatted is its successor.
npm WARN deprecated nodemailer@2.7.2: All versions below 4.0.1 of Nodemailer are 
.....

npm WARN deprecated boom@2.10.1: This version is no longer maintained. Please upgrade to the latest version.

> grpc@1.16.1 install /Users/yuanxuebing/project/js/demo-creator-gameServer-JS/server/node_modules/grpc
> node-pre-gyp install --fallback-to-build --library=static_library

node-pre-gyp WARN Using request for node-pre-gyp https download
[grpc] Success: "/Users/yuanxuebing/project/js/demo-creator-gameServer-JS/server/node_modules/grpc/src/node/extension_binary/node-v59-darwin-x64-unknown/grpc_node.node" is installed via remote
npm notice created a lockfile as package-lock.json. You should commit this file.
npm WARN demo-gs@0.1.0 No repository field.
npm WARN demo-gs@0.1.0 No license field.

added 365 packages in 212.616s


   ╭─────────────────────────────────────╮
   │                                     │
   │   Update available 5.6.0 → 6.4.1    │
   │       Run npm i npm to update       │
   │                                     │
   ╰─────────────────────────────────────╯

```

## 运行前准备

### 1 创建游戏

要启动案例，首先要在Matchvs创建一个游戏，此处我们省略游戏创建过程，以一个以创建好游戏(ID:201179)为例说明，Matchvs[接入和游戏创建](http://www.matchvs.com/service?page=MatchvsStart)可参看[官网](http://www.matchvs.com)相应文档。

![image-20181205153042318](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvzj3ugwwj30pf05bdgd.jpg)

### 2 创建GS

本案例是带有GameServer的游戏，因此需要给游戏[创建GS](http://www.matchvs.com/service?page=jsGsStart)，GS的创建过程本文略过，创建好的GS信息入下：

![image-20181205153447465](https://ws2.sinaimg.cn/large/006tNbRwgy1fxvzkpuntvj30nn04qaau.jpg)



### 3 [命令行工具](http://www.matchvs.com/service?page=GameServerCMD)安装

命令行工具可用于GS管理、本地调试、GS代码发布、GS启停等操作，[下载](http://www.matchvs.com/serviceDownload)matchvs命令行工具并解压即可完成安装

```
➜  js ./matchvs help

Usages: matchvs COMMAND

The commands are:
	login 		账号登录
	list 		查询gameServer列表
	info 		查询单个gameServer信息
	create 		创建gameServer
	modify 		修改gameServer
	delete 		删除gameServer
	publish 	发布gameServer到镜像仓库
	run 		控制gameServer启停
	debug 		开启本地调试，调试完成后在终端输入"quit"退出本地调试

Use "matchvs help [command]" for more information about a command.
```

首先我们需要通过命令行工具登录，目的是让命令行工具用于操作GS的权限

```
➜  js ./matchvs login
Email or Mobile phone: ***************
Password: **************
1 -- Matchvs
2 -- Cocos
3 -- Egret（白鹭）
4 -- 阿里云
channel（请在上面的渠道列表选择，输入序号）： 1
login as ************ success !
```

有一点需要注意，login 时 Password 要填官网 gameserver 页面下命令行工具/git仓库密码（如下图所示）

![image-20181205154322126](https://ws1.sinaimg.cn/large/006tNbRwgy1fxvzlxe9b5j30yd063jsc.jpg)



## 运行游戏

本案例需要Client和Server配合，我们先介绍如何在cocos Creator中加载和运行Client。

### client的运行

client是由Creator编写，在creator中打开并载入项目

![image-20181205142124269](https://ws3.sinaimg.cn/large/006tNbRwgy1fxvzlzl9wej30sg0ipt9u.jpg)

![image-20181205142209772](https://ws3.sinaimg.cn/large/006tNbRwgy1fxvzm2jqitj30p70codh9.jpg)

下载并安装matchvs插件(如果已安装可跳过本步骤)，后重启creator。

![image-20181205142301948](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvzm6qoqej30iu03pq3y.jpg)

![image-20181205142414155](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvzm93ax8j30ma0hctbt.jpg)

修改scripts/GLBConfig.js 中gameID、运行环境、appKey、和appSecret信息

```json
/* 存放全局变量 */
var _GLBConfig = {
    MAX_PLAYER_COUNT: 3,
    GAME_START_EVENT: "gameStart",
    NEW_START_EVENT: "newStar",
    PLAYER_MOVE_EVENT: "playerMove",
    GAIN_SCORE_EVENT: "gainScore",
    PLAYER_POSITION_EVENT: "playerPosition",
    SCENE_INFO: "sceneInfo",
    GAME_READY: "gameReady",

    channel: 'MatchVS',
    platform: 'release',   /*alpha表示在alpha环境运行，支持GS本地调试；release表示正式线网环境*/
    gameId: 201179,
    gameVersion: 1,
    appKey: '改为自己游戏的appKey,可从官网查看',
    secret: '改为自己游戏的appSercet,可从官网查看',

    userInfo: null,
    playerUserIds: [],
    isRoomOwner: false,
    events: {},
};
module.exports = _GLBConfig;
```

![image-20181205141228097](https://ws3.sinaimg.cn/large/006tNbRwgy1fxvzmcak5tj319a0pgdkt.jpg)

​	点击图示的预览即可在浏览器中运行游戏，也可扫描二维码在手机浏览器中运行游戏。

![image-20181205142630690](https://ws3.sinaimg.cn/large/006tNbRwgy1fxvzmf7ow5j31960eq77o.jpg)

****

**注意需要game Server正常启动后再运行client，下文我们将介绍两种GS的运行方式。***

GS可以以本地调试方式运行在本机也可以托管在Matchvs平台运行。

## 本地调试运行

### 1 修改gameServer监听端口

将gameServer监听端口改为Matchvs为其分配的服务端口，GS的服务端口可通过官网 gameServer->对应GS 获取

![image-20181205140947732](https://ws2.sinaimg.cn/large/006tNbRwgy1fxvzmiha5sj30y907aabf.jpg)

修改demo-creator-gameServer-JS/server/conf/config.json  addr中端口为30271

```shell
{
    "addr": "0.0.0.0:30271",
 	.......
}
```



### 2 通过命令行工具开启本地调试

​	命令行工具login成功后执行./matchvs debug GS_key![image-20181205141326218](https://ws1.sinaimg.cn/large/006tNbRwgy1fxvzmlnsq1j30ly090q5n.jpg)

### 3 在本机启动Game Server

```
cd server
node ./main.js
➜  server git:(master) ✗ node ./main.js
[2018-12-05T13:48:43.458] [INFO] default - Game server started, listen on: 0.0.0.0:30271

```

至此GameServer已在本地启动完成，下面我们需要启动游戏客户端来完成和GameServer的交互。

### 4 在alpha环境启动游戏客户端

前文介绍了client的启动，当GS以本地调试方式运行时，client的scripts/GLBConfig.js platform需改为alpha。在本机终端即可看到GS有相应的事件被触发。

```log
[2018-12-05T14:01:41.870] [DEBUG] default - onCreateRoom: { userID: 0,
  gameID: 201179,
  roomID: '1710244980678725729',
  createExtInfo:
   { userID: 84897,
     userProfile: Uint8Array [  ],
     roomID: '1710244980678725729',
     state: 1,
     maxPlayer: 3,
     mode: 0,
     canWatch: 2,
     roomProperty: Uint8Array [  ],
     createFlag: 1,
     createTime: '1543989701' } }
[2018-12-05T14:01:42.005] [DEBUG] default - onJoinRoom: { userID: 84897,
  gameID: 201179,
  roomID: '1710244980678725729',
  joinExtInfo:
   { userID: 84897,
     userProfile: Uint8Array [  ],
     roomID: '1710244980678725729',
     joinType: 3 } }
[2018-12-05T14:01:42.065] [INFO] default - receive game ready: 84897
[2018-12-05T14:03:17.362] [DEBUG] default - onJoinRoom: { userID: 1719062,
  gameID: 201179,
  roomID: '1710244980678725729',
  joinExtInfo:
   { userID: 1719062,
     userProfile: Uint8Array [  ],
     roomID: '1710244980678725729',
     joinType: 3 } }
......
```

## Matchvs托管运行

### 1 上传代码并发布

![image-20181205143230097](https://ws1.sinaimg.cn/large/006tNbRwgy1fxvzmpxr0aj30qe06kwfe.jpg)

将GS远程仓库代码clone都本地

```shell
➜  js git clone https://git.matchvs.com/10771/7fe0de3d7bf044ab2557671b4a7b4418.git
Cloning into '7fe0de3d7bf044ab2557671b4a7b4418'...
Username for 'https://git.matchvs.com': 10771
Password for 'https://10771@git.matchvs.com':
warning: You appear to have cloned an empty repository.
Checking connectivity... done.
```

拷贝Server目录到7fe0de3d7bf044ab2557671b4a7b4418目录

```shell
cp -r ../demo-creator-gameServer-JS/server/* ./
```

![image-20181205143713765](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvzmv3cu4j30m405z405.jpg)

提交代码并推送到远程仓库，（注node 依赖库不需要提交到仓库）

![image-20181205143825258](https://ws3.sinaimg.cn/large/006tNbRwgy1fxvzn14gwej30m20codh9.jpg)

```shell
➜  7fe0de3d7bf044ab2557671b4a7b4418 git:(master) ✗ git commit
[master (root-commit) 48289ef] GS代码提交
 9 files changed, 519 insertions(+)
 create mode 100644 Dockerfile
 create mode 100644 Makefile
 create mode 100644 conf/config.json
 create mode 100644 gsmeta
 create mode 100644 main.js
 create mode 100644 package.json
 create mode 100644 src/app.js
 create mode 100644 src/global.js
 create mode 100644 src/room.js
```

git push 将代码推到matchvs托管平台后可通过官网控制台或matchvs命令行工具发布代码

![image-20181205144155127](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvzn4c802j30pg052wf0.jpg)

或通过命令行工具

```shell
./matchvs publish 7fe0de3d7bf044ab2557671b4a7b4418
```

发布成功后，官网控制台中GS变为可启动状态，点击启动即可在Matchvs平台运行GS(也可通过命令行工具启动`./matchvs run start 7fe0de3d7bf044ab2557671b4a7b4418`)，启动成功后在控制台即可看到GS运行情况：

![image-20181205144815601](https://ws2.sinaimg.cn/large/006tNbRwgy1fxvznajrt5j30qy0k00u6.jpg)



### 2 在release环境启动游戏客户端

当GS以托管方式方式运行时，client的scripts/GLBConfig.js platform需改为release

![image-20181205145106891](https://ws2.sinaimg.cn/large/006tNbRwgy1fxvzndthisj31980kuq80.jpg)

随后启动三个客户端，在启动第一个客户端后有创建一个新的房间

![image-20181205145204137](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvzngn53gj30qz0hxq4c.jpg)

再次在官网控制台查看GS日志，已经可见房间创建事件日志， 说明GS已正常启动并接受和正确处理相应事件。

![image-20181205145314662](https://ws4.sinaimg.cn/large/006tNbRwgy1fxvznm9o2kj30ru0n80vz.jpg)

