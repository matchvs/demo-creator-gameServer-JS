/*
负责的功能:
1.matchvs初始化
2.输出进入房间等信息
3.初始化的时候,发送房间信息
4.注册用户,登录
5.进入房间,跳转到Game场景

注: matchvs接口,查看对应的api文档(http://...)

*/

var mvs = require('Mvs')
var GLB = require('GLBConfig')

cc.Class({
    extends: cc.Component,

    properties: {
        labelInfo: {
            default: null,
            type: cc.Label
        }
    },

    onLoad: function () {
        mvs.response.initResponse = this.initResponse.bind(this);
        this.labelLog('开始初始化')
        // mvs.response.getHostListResponse = function(){};
        var result = mvs.engine.init(mvs.response, GLB.channel, GLB.platform, GLB.gameId)
        // mvs.engine.getHostList && mvs.engine.getHostList();

        if (result !== 0) this.labelLog('初始化失败,错误码:' + result);
    },

    labelLog: function (info) {
        this.labelInfo.string += '\n' + info;
    },

    startGame: function () {
        this.labelLog('游戏即将开始')
        cc.director.loadScene('game')
    },

    recordPlayerUserIds: function (userIds) {
        GLB.playerUserIds = [GLB.userInfo.id]

        for (var i = 0, l = userIds.length; i < l; i++) {
            var userId = userIds[i]
            if (userId !== GLB.userInfo.id) {
                GLB.playerUserIds.push(userId)
            }
        }
    },

    initResponse: function(status) {
        this.labelLog('初始化成功，开始注册用户');
        mvs.response.registerUserResponse = this.registerUserResponse.bind(this); // 用户注册之后的回调
        var result = mvs.engine.registerUser();
        if (result !== 0)
            return this.labelLog('注册用户失败，错误码:' + result);
        else
            this.labelLog('注册用户成功');
    },

    registerUserResponse: function (userInfo) {
        var deviceId = 'abcdef';
        var gatewayId = 0;

        GLB.userInfo = userInfo;

        this.labelLog('开始登录,用户Id:' + userInfo.id)

        mvs.response.loginResponse = this.loginResponse.bind(this); // 用户登录之后的回调
        var result = mvs.engine.login(userInfo.id, userInfo.token,
            GLB.gameId, GLB.gameVersion,
            GLB.appKey, GLB.secret,
            deviceId, gatewayId);

        if (result !== 0)
            return this.labelLog('登录失败,错误码:' + status);
    },

    loginResponse: function (info) {
        if (info.status !== 200)
            return this.labelLog('登录失败,异步回调错误码:' + info.status)
        else
            this.labelLog('登录成功')

        this.labelLog('开始进入房间');
        mvs.response.joinRoomResponse = this.joinRoomResponse.bind(this);
        var result = mvs.engine.joinRandomRoom(GLB.MAX_PLAYER_COUNT, '')
        if (result !== 0)
            return this.labelLog('进入房间失败,错误码:' + result)
    },

    joinRoomResponse: function (status, userInfoList, roomInfo) {
        if (status !== 200) {
            return this.labelLog('进入房间失败,异步回调错误码: ' + status);
        } else {
            this.labelLog('进入房间成功');
            this.labelLog('房间号: ' + roomInfo.roomId);
       }


        var userIds = [GLB.userInfo.id]
        userInfoList.forEach(function(item) {if (GLB.userInfo.id !== item.userId) userIds.push(item.userId)});
        this.labelLog('房间用户: ' + userIds);
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this); // 设置事件接收的回调
        GLB.playerUserIds = userIds;
        //发送准备信息给gameServer
        this.gameReady();
         if (userIds.length >= GLB.MAX_PLAYER_COUNT) {
            GLB.isRoomOwner = true; //设置最后一个加入的为房主
        //     mvs.response.joinOverResponse = this.joinOverResponse.bind(this); // 关闭房间之后的回调
        //     var result = mvs.engine.joinOver("");
        //     this.labelLog("发出关闭房间的通知");
        //     if (result !== 0) {
        //         this.labelLog("关闭房间失败，错误码：", result);
        //     }

        //     GLB.playerUserIds = userIds;
        }
    },

    // joinOverResponse: function(joinOverRsp) {
    //     if (joinOverRsp.status === 200) {
    //         this.labelLog("关闭房间成功");
    //         this.notifyGameStart();
    //     } else {
    //         this.labelLog("关闭房间失败，回调通知错误码：", joinOverRsp.status);
    //     }
    // },

    // notifyGameStart: function () {
    //     GLB.isRoomOwner = true;

    //     var event = {
    //         action: GLB.GAME_START_EVENT,
    //         userIds: GLB.playerUserIds
    //     };

    //     mvs.response.sendEventResponse = this.sendEventResponse.bind(this); // 设置事件发射之后的回调
    //     var result = mvs.engine.sendEvent(JSON.stringify(event));
    //     if (result.result !== 0)
    //         return this.labelLog('发送游戏开始通知失败，错误码' + result.result)

    //     // 发送的事件要缓存起来，收到异步回调时用于判断是哪个事件发送成功
    //     GLB.events[result.sequence] = event;
    //     this.labelLog("发起游戏开始的通知，等待回复");
    // },

    sendEventResponse: function (info) {
        if (!info
            || !info.status
            || info.status !== 200) {
            return this.labelLog('事件发送失败')
        }

        // var event = GLB.events[info.sequence]

        // if (event && event.action === GLB.GAME_START_EVENT) {
        //     delete GLB.events[info.sequence]
        //     //this.startGame()
        // }
    },

    gameReady: function(){
        var event = {
            action : GLB.GAME_READY
        };
        mvs.response.sendEventResponse = this.sendEventResponse.bind(this);// 设置事件发射之后的回调
        /**
         * param 1 : msType 0-客户端+not CPS    1-not 客户端+CPS   2-客户端+CPS
         * param 2 : 用户数据
         * param 3 : destType 可默认为0
         * param 4 : 发送的userID集合
         */
        var result = mvs.engine.sendEventEx(1,JSON.stringify(event), 0, GLB.playerUserIds);
        if (result.result !== 0)
            return this.labelLog('发送游戏准备通知失败，错误码' + result.result);
        GLB.events[result.sequence] = event;
        this.labelLog("发起游戏开始的通知，等待回复");
    },

    sendEventNotify: function (info) {
        if (info
            && info.cpProto
            && info.cpProto.indexOf(GLB.GAME_START_EVENT) >= 0) {

            GLB.playerUserIds = [GLB.userInfo.id]
            // 通过游戏开始的玩家会把userIds传过来，这里找出所有除本玩家之外的用户ID，
            // 添加到全局变量playerUserIds中
            JSON.parse(info.cpProto).userIds.forEach(function(userId) {
                if (userId !== GLB.userInfo.id) GLB.playerUserIds.push(userId)
            });
            this.startGame()
        }
    },
})