var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear, GoalFollow, GoalNearXZ } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
const { DEATH_ENTITY_TYPE_MOB, DEATH_ENTITY_TYPE_PLAYER } = require("mineflayer-death-event");
const { Utils } = require('../src/utils');

const {
    StateTransition,
    BotStateMachine,
    EntityFilters,
    BehaviorFollowEntity,
    BehaviorGetClosestEntity,
    NestedStateMachine,
    BehaviorIdle } = require("mineflayer-statemachine");

const getPartialPositionState = (function(){
    function GetPartialPositionState(bot, targets, data)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'getPartialPositionState';
        this.targets = targets;
        this.data = data;

        let directionVector = new Vec3(
            this.data.position.x - this.bot.entity.position.x,
            this.data.position.y - this.bot.entity.position.y,
            this.data.position.z - this.bot.entity.position.z
        );
        directionVector = directionVector.normalize()
        directionVector = directionVector.scaled((this.bot.entity.position.distanceTo(this.data.position) > this.data.distance) ? (this.data.distance / 2) : (this.bot.entity.position.distanceTo(this.data.position) / 2));

        this.data.position.x = this.bot.entity.position.x + directionVector.x;
        this.data.position.z = this.bot.entity.position.z + directionVector.z;


        this.data.position.y = null;
        this.data.position.y = this.data.requester.requestHeight(this.data.position.x,this.data.position.z);
    }

    GetPartialPositionState.prototype.onStateEntered = function () {};
    GetPartialPositionState.prototype.onStateExited = function () {};

    return GetPartialPositionState;
}());

const getPlayerPositionState = (function(){
    function GetPlayerPositionState(bot, targets, data)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'getPlayerPositionState';
        this.targets = targets;
        this.data = data;

        this.data.position = null;
        this.data.position = this.data.requester.requestPosition(data.username);
    }

    GetPlayerPositionState.prototype.onStateEntered = function () {};
    GetPlayerPositionState.prototype.onStateExited = function () {};

    return GetPlayerPositionState;
}());


const progressToState = (function(){
    function ProgressToState(bot, targets, data)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'progressToState';
        this.targets = targets;
        this.reached = false;
        this.data = data;

        this.bot.on('goal_reached', ()=>{
            this.reached = true;
        })

        this.bot.pathfinder.stop()
        
        this.bot.pathfinder.setMovements(this.data.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.data.position.x,
            this.data.position.y, 
            this.data.position.z,
            16
        ))
    }

    ProgressToState.prototype.onStateEntered = function () {};
    ProgressToState.prototype.onStateExited = function () {};

    return ProgressToState;
}());

const followPlayerState = (function(){
    function FollowPlayerState(bot, targets, data)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'followPlayerState';
        this.targets = targets;
        this.data = data;

        this.bot.pathfinder.stop()
        
        this.bot.pathfinder.setMovements(this.data.defaultMove)
        const goal = new GoalFollow(this.bot.players[this.data.username].entity, 2)
        this.bot.pathfinder.setGoal(goal, true)
    }

    FollowPlayerState.prototype.onStateEntered = function () {};
    FollowPlayerState.prototype.onStateExited = function () {};

    return FollowPlayerState;
}());

function createApproachPlayerState(bot, targets, data)
{
    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    const getPlayerPosition = new getPlayerPositionState(bot, targets, data);
    const progressTo = new progressToState(bot, targets, data);
    const getPartialPosition = new getPartialPositionState(bot, targets, data);

    const transitions = [

        new StateTransition({
            parent: enter,
            child: getPlayerPosition,
            shouldTransition: () => true,
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: getPartialPosition,
            shouldTransition: () => 
            {
                if(getPlayerPosition.data.position == null || getPlayerPosition.data.position instanceof Promise)return false;
                return (getPlayerPosition.data.position.distanceTo(bot.entity.position) > getPlayerPosition.data.distance || !getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username))
            }
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: exit,
            shouldTransition: () => 
            {
                if(getPlayerPosition.data.position == null || getPlayerPosition.data.position instanceof Promise)return false;
                return (getPlayerPosition.data.position.distanceTo(bot.entity.position) < getPlayerPosition.data.distance || getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username))
            },
        }),

        new StateTransition({
            parent: getPartialPosition,
            child: progressTo,
            shouldTransition: () => getPlayerPosition.data.position.y != null,
        }),

        new StateTransition({
            parent: progressTo,
            child: getPlayerPosition,
            shouldTransition: () => progressTo.reached == true,
        }),
    ];

    return new NestedStateMachine(transitions, enter, exit);
}

module.exports = {
    getPartialPositionState : getPartialPositionState,
    followPlayerState : followPlayerState,
    getPlayerPositionState : getPlayerPositionState,
    progressToState : progressToState,
    createApproachPlayerState : createApproachPlayerState
}