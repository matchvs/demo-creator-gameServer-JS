# demo-creator-gameServer-JS

用Matchvs SDK 、gameServer（JS） 和 creator 开发的Demo，用于演示gameServer自定义服务端逻辑的功能。

## client客户端

使用Creator开发，需要两名玩家匹配，就可进入游戏页面。由于浏览器有缓存，可以使用不同的浏览器打开，或者打开一个页面后清除浏览器缓存，在重新打开一个页面，即可进入游戏页面

- Lobby.js:首页的逻辑代码，主要包括初始化，注册，登录，进入房间的请求和回调

- mvs.js:MatchvsSDK的引用。

- Player.js:主要包括人物的移动逻辑。

- Star.js:星星的创建。

- GLBConfig.js:存放了主要的常量数据，gameID在这里面替换即可。

- Game.js:游戏页面的逻辑。






