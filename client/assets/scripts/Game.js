var mvs = require("Mvs");
var GLB = require("GLBConfig");

cc.Class({
    extends: cc.Component,

    properties: {
        maxStarDuration: 0,
        minStarDuration: 0,

        ground: {
            default: null,
            type: cc.Node
        },

        players: [cc.Node],
        // 注意此时不能写成以下形式
        // players: {
        //     default: null,
        //     type: [cc.Node]
        // },

        scoreDisplays: [cc.Label],

        // 引用星星预支资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 音频资源
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        },

        delay: cc.Label,
        maxDelay: cc.Label,
        minDelay: cc.Label,
        receiveCount: cc.Label,
        receiveCountValue: 0,
    },


    onLoad: function () {
        this.timer = 0;
        this.starDuration = this.maxStarDuration - this.minStarDuration;
        this.gameTime = 9999;
        this.scores = [0, 0, 0];
        this.pickRadius = this.starPrefab.data.getComponent("Star").pickRadius;
        // 场景ground的高度
        this.groundY = this.ground.y + this.ground.height / 2;
        this.compensation = 50;
        this.starMaxX = this.node.width / 2;
        // 玩家可以跳到的高度
        this.playerJumpHeight = this.players[0].getComponent('Player').jumpHeight;

        //设置回调
        mvs.response.sendEventNotify = this.sendEventNotify.bind(this);
        mvs.response.gameServerNotify = this.gameServerNotify.bind(this);//接收gameServer的消息

        //发送游戏场景信息给gameServer
        this.spawnNewStarFromServer();

        for(var i = 0; i < GLB.MAX_PLAYER_COUNT; i++) {
            var userId = GLB.playerUserIds[i];
            this.scoreDisplays[i].string = userId + ': 0';
            this.players[i].getChildByName("playerLabel").getComponent(cc.Label).string = userId;
        }
    },

    update: function (dt) {
        if (this.timer > this.gameTime)
            return this.gameOver();

        this.timer += dt
    },

    sendEventNotify: function (info) {
        if (info && info.cpProto) {
            if (info.cpProto.indexOf(GLB.PLAYER_MOVE_EVENT) >= 0) {
                // 收到其他玩家移动的消息，根据消息信息修改加速度
                this.updatePlayerMoveDirection(info.srcUserId, JSON.parse(info.cpProto))

            } else if (info.cpProto.indexOf(GLB.PLAYER_POSITION_EVENT) >= 0) {
                // 收到其他玩家的位置速度加速度信息，根据消息中的值更新状态
                this.receiveCountValue++;
                this.receiveCount.string = "receive msg count: " + this.receiveCountValue;
                var cpProto = JSON.parse(info.cpProto);
                var player = this.getPlayerByUserId(info.srcUserId);
                if (player) {
                    player.node.x = cpProto.x;
                    player.xSpeed = cpProto.xSpeed;
                    player.accLeft = cpProto.accLeft;
                    player.accRight = cpProto.accRight;
                }
                
                var delayValue = new Date().getTime() - cpProto.ts;
                this.delay.string = "delay: " + delayValue;
                if (this.minDelayValue === undefined || delayValue < this.minDelayValue) {
                    this.minDelayValue = delayValue;
                    this.minDelay.string = "minDelay: " + delayValue;
                }
                if (this.maxDelayValue === undefined || delayValue > this.maxDelayValue) {
                    this.maxDelayValue = delayValue;
                    this.maxDelay.string = "maxDelay: " + delayValue;
                }
            }
        }
    },

    gameServerNotify: function (info){
        console.log("gameServerNotify");
        if (info && info.cpProto) {
            if (info.cpProto.indexOf(GLB.NEW_START_EVENT) >= 0) {
                // 收到创建星星的消息通知，根据消息给的坐标创建星星
                var piz = JSON.parse(info.cpProto);
                this.createStarNode(cc.p(piz.x, piz.y))

            } else if (info.cpProto.indexOf(GLB.GAIN_SCORE_EVENT) >= 0) {
                // 收到其他玩家的得分信息，更新页面上的得分数据
                var cpproto = JSON.parse(info.cpProto);
                if(cpproto.userId === GLB.userId ){
                    this.gainScore();
                }else{
                    //更新其他玩家的分数
                    var playerIndex = this.getPlayerIndexByUserId(cpproto.userId);
                    var label = GLB.playerUserIds[playerIndex - 1] + ': ' + cpproto.score;
                    this.scoreDisplays[playerIndex - 1].string = label;
                }
            }
        }
    },

    // 更新每个玩家的移动方向
    updatePlayerMoveDirection: function (userId, event) {
        var player = this.getPlayerByUserId(userId);
        if (player) {
            if (event.accLeft !== undefined) player.accLeft = event.accLeft;
            if (event.accRight !== undefined) player.accRight = event.accRight;
        }
    },

    getPlayerByUserId: function(userId) {
        var index = this.getPlayerIndexByUserId(userId);
        if (index) {
            return this.players[index-1].getComponent("Player" + index);
        }
    },

    // 返回玩家编写，一个1~3的数字
    getPlayerIndexByUserId: function(userId) {
        for (var i = 0; i < GLB.playerUserIds.length; i++) {
            if (GLB.playerUserIds[i] === userId) {
                return i + 1;
            }
        }
    },

    // 根据坐标位置创建星星节点
    createStarNode: function (position) {
        for (var i = 0; i<this.node.children.length; i++) {
            var child = this.node.children[i];
            if (child.name === 'star') child.destroy();
        }
        var newStar = cc.instantiate(this.starPrefab)
        this.node.addChild(newStar)

        newStar.setPosition(cc.p(position.x, position.y))
        newStar.getComponent('Star').game = this;

        this.timer = 0
    },

    /**
     * 发送场景信息给服务器，把创建星星的逻辑给服务器处理
     */
    spawnNewStarFromServer: function () {
        if (!GLB.isRoomOwner) return;    // 只有房主可发送场景信息

        var event = {
            action: GLB.SCENE_INFO,
            starMaxX: this.starMaxX,
            groundY: this.groundY,
            playerJumpHeight: this.playerJumpHeight,
            compensation: this.compensation,
            pickRadius: this.pickRadius //用来判断获取星星时最近距离
        };

        /**
         * param 1 : msType 0-客户端+not CPS    1-not 客户端+CPS   2-客户端+CPS
         * param 2 : 用户数据
         * param 3 : destType 可默认为0
         * param 4 : 发送的userID集合
         */
        var result = mvs.engine.sendEventEx(1,JSON.stringify(event), 0, GLB.playerUserIds);
        if (!result || result.result !== 0)
            return console.error('创建星星事件发送失败');
    },



    /**
     * 处理玩家自己的得分
     */
    gainScore: function () {
        this.scores[0] += 1;
        var label = GLB.playerUserIds[0] + ': ' + this.scores[0];

        this.scoreDisplays[0].string = label;
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);

    },

    // 游戏结束
    gameOver: function () {
        for (var i = 0, l = this.players.length; i < l; i++) {
            this.players[i].stopAllActions()
        }
        // 跳转到场景Game
        cc.director.loadScene('game')
    },
})