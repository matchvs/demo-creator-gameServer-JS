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
    platform: 'release',
    gameId: 201479,//201005,
    gameVersion: 1,
    appKey: 'a5c625ddd32f43628a6caf1d256b5b67',//'361bbbbfbc26465c80dd0d4073277521',
    secret: '87fb9db7b65a45479615d7f4a0f2ae79',//'99ffc407bf33491c827a51065fac5a34',

    userInfo: null,
    playerUserIds: [],
    isRoomOwner: false,
    events: {},
    
    errorMap:{
        521:"gameServer不存在，请检查是否已开启本地调试或在正式环境发布运行gameServer",
    }
};
module.exports = _GLBConfig;