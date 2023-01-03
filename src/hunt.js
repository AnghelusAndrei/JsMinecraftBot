var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear, GoalFollow, GoalNearXZ } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
const { DEATH_ENTITY_TYPE_MOB, DEATH_ENTITY_TYPE_PLAYER } = require("mineflayer-death-event");
const { Utils } = require('./utils');


const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine,
    BehaviorIdle } = require("mineflayer-statemachine");

const { 
    createApproachPlayerState,
    getPlayerPositionState
} = require('./movement')

const attackPlayerState = (function(){
    function AttackPlayerState(bot, targets, data)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'attackPlayerState';
        this.targets = targets;
        this.data = data;
    }

    AttackPlayerState.prototype.onStateEntered = function () {
        this.bot.pathfinder.stop()
        bot.chat('nigga')

        this.bot.pvp.attack(this.bot.players[this.data.username].entity)
    };
    AttackPlayerState.prototype.onStateExited = function () {};

    return AttackPlayerState;
}());

function createHuntPlayerState(bot, targets, data){
    this.data = data;
    this.targets = targets;
    this.bot = bot;

    const enter = new BehaviorIdle();

    const approachState = createApproachPlayerState(this.bot, this.targets, this.data);
    const attackState = new attackPlayerState(this.bot, this.targets, this.data);
    const getPlayerPosition = new getPlayerPositionState(this.bot, this.targets, this.data);
    
    const transitions = [
        new StateTransition({
            parent: enter,
            child: getPlayerPosition,
            shouldTransition: () => true,
            onTransition: () => {},
        }),
    
        new StateTransition({
            parent: getPlayerPosition,
            child: attackState,
            shouldTransition: () => {
                if(!getPlayerPosition.received)return false;
                return getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username);
            },
            onTransition: () => {},
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: approachState,
            shouldTransition: () => {
                if(!getPlayerPosition.received)return false;
                return !getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username);
            },
            onTransition: () => {},
        }),

        new StateTransition({
            parent: approachState,
            child: getPlayerPosition,
            shouldTransition: () => approachState.isFinished(),
            onTransition: () => {},
        }),

        new StateTransition({
            parent: attackState,
            child: getPlayerPosition,
            shouldTransition: () => !attackState.data.utils.playerIsNear(attackState.data.username),
            onTransition: () => {},
        }),
    ];

    const HuntPlayerState = new NestedStateMachine(transitions, enter);
    HuntPlayerState.stateName = 'HuntPlayerState';

    return HuntPlayerState;
}

module.exports = {
    attackPlayerState : attackPlayerState,
    createHuntPlayerState : createHuntPlayerState,
}