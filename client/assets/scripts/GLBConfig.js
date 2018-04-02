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
    gameId: 201005,
    gameVersion: 1,
    appKey: '361bbbbfbc26465c80dd0d4073277521',
    secret: '99ffc407bf33491c827a51065fac5a34',

    userInfo: null,
    playerUserIds: [],
    isRoomOwner: false,
    events: {},
};
module.exports = _GLBConfig;