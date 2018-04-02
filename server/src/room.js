const log4js = require('log4js');
const textEncoding = require('text-encoding');
var glb = require("./global");

const log = log4js.getLogger();

class Room {
    /**
     * Creates an instance of Room.
     * @param {number} gameID 
     * @param {number} roomID 
     * @param {Object} pushHander 
     * @memberof Room
     */
    constructor(gameID, roomID, pushHander) {
        this.gameID = gameID;
        this.roomID = roomID;
        this.pushHander = pushHander;
        this.players = new Map();
        this.scene = {};
        this.star = {x: 0, y: 0};
        this.isStarted = false;
    }

    /**
     * 玩家进入房间
     * @param {number} userID 
     * @memberof Room
     */
    playerEnter(userID) {
        this.players.set(userID, {
            position: {x: 0, y: 0},
            score: 0,
            ready: false,
        });
    }

    /**
     * 玩家退出房间
     * @param {number} userID 
     * @memberof Room
     */
    playerExit(userID) {
        this.players.delete(userID);
    }

    /**
     * 房间事件
     * @param {number} userID 
     * @param {string} event 
     * @memberof Room
     */
    roomEvent(userID, event) {
        if (userID && event) {
            let action = event.action;
            let player;
            switch (action) {
                case glb.SCENE_INFO:
                    this.scene.starMaxX = event.starMaxX;
                    this.scene.groundY = event.groundY;
                    this.scene.playerJumpHeight = event.playerJumpHeight;
                    this.scene.compensation = event.compensation;
                    this.scene.pickRadius = event.pickRadius;
                    log.info('receive scene info:', event);
                    // 初始化星星
                    this.spawnNewStar();
                    break;
                case glb.PLAYER_POSITION_EVENT:
                    player = this.players.get(userID);
                    if (player) {
                        player.position.x = event.x;
                        player.position.y = event.y;
                        this.checkStar(userID, player);
                    }
                    break;
                case glb.GAME_READY:
                    player = this.players.get(userID);
                    if (player) {
                        player.ready = true;
                        this.checkGameStart();
                    }
                    log.info('receive game ready:', userID);
                    break;
                default:
                    log.warn('unknown action:', action);
                    break;
            }
        }
    }

    /**
     * 检查房间内是否所有人都已经准备
     * @memberof Room
     */
    checkGameStart() {
        if (!this.isStarted && this.players.size >= glb.MAX_PLAYER_COUNT) {
            let allReady = true;
            for (let [k, p] of this.players) {
                if (!p.ready) {
                    allReady = false;
                }
            }
            if (allReady) {
                // 房间停止加人
                this.pushHander.joinOver({
                    gameID: this.gameID, 
                    roomID: this.roomID,
                });
                // 通知房间内玩家开始游戏
                this.notifyGameStart();
                this.isStarted = true;
            }
        }
    }

    /**
     * 通知客户端开始游戏
     * @memberof Room
     */
    notifyGameStart() {
        let userIds = [];
        for (let id of this.players.keys()) {
            userIds.push(id);
        }
        let event = {
            action: glb.GAME_START_EVENT,
            userIds: userIds,
        }
        this.sendEvent(event);
        log.info('notifyGameStart event:', event);
    }

     /**
      * 随机返回“新星星”的位置
      * @memberof Room
      */
     getNewStarPosition() {
        this.star.x = randomMinus1To1() * this.scene.starMaxX;
        this.star.y = this.scene.groundY + random0To1() * this.scene.playerJumpHeight + this.scene.compensation;
    }

    /**
     * 生成“新星星”
     * @memberof Room
     */
    spawnNewStar() {
        this.getNewStarPosition();
        let event = {
            action: glb.NEW_START_EVENT,
            x: this.star.x,
            y: this.star.y,
        }
        this.sendEvent(event);
        log.info('spawnNewStar event:', event);
    }

    /**
     * 计算玩家和星星之间距离的平方
     * @param {Object} position 
     * @param {number} position.x
     * @param {number} position.y
     * @returns 
     * @memberof Room
     */
    getDistanceSQ(position) {
        let v1 = this.star;
        let v2 = position;
        let v = {
            x: v1.x - v2.x,
            y: v1.y - v2.y,
        }
        return v.x * v.x + v.y * v.y;
    }

    /**
     * 判断星星是否被收集
     * @param {number} userID 
     * @param {Object} player 
     * @param {number} player.score
     * @param {Object} player.position
     * @param {number} player.position.x
     * @param {number} player.position.y
     * @memberof Room
     */
    checkStar(userID, player) {
        if (this.getDistanceSQ(player.position) < this.scene.pickRadius * this.scene.pickRadius) {
            player.score += 1;
            let event = {
                action: glb.GAIN_SCORE_EVENT,
                userId: userID,
                score: player.score,
            }
            log.info('send gain score event:', event);
            this.sendEvent(event);
            
            // 产生新星星 
            this.spawnNewStar();
        }
    }

    /**
     *  推送房间消息
     * @param {Object} event
     * @memberof Room
     */
    sendEvent(event) {
        let content = new textEncoding.TextEncoder("utf-8").encode(JSON.stringify(event));
        this.pushHander.pushEvent({
            gameID: this.gameID, 
            roomID: this.roomID, 
            pushType: 3,
            content: content,
        });
    }
}

/**
 * returns a random float between -1 and 1
 * @return {Number}
 */
function randomMinus1To1() {
    return (Math.random() - 0.5) * 2;
};

/**
 * returns a random float between 0 and 1, use Math.random directly
 * @return {Number}
 */
function random0To1() {
    return Math.random();
}

module.exports = Room;
