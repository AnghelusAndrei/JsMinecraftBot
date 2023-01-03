var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear, GoalFollow, GoalNearXZ } } = require('mineflayer-pathfinder')
const { Utils } = require('./utils');

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
        this.received = false;
    }

    function onReceived(state){
        function eventListener(username, message){
            var args = message.split(' ') 
            if(username == 'requested_height'){
                state.data.position.y = parseInt(args[0]);
                state.received = true;
                state.bot.removeListener('chat', eventListener);
            }
        }

        state.bot.on('chat', eventListener)
    }

    GetPartialPositionState.prototype.onStateEntered = function () {

        this.received = false;

        var directionVector = new Vec3(
            this.data.position.x - this.bot.entity.position.x,
            this.data.position.y - this.bot.entity.position.y,
            this.data.position.z - this.bot.entity.position.z
        );

        directionVector = directionVector.normalize()
        directionVector = directionVector.scaled(this.data.distance);

        this.data.position.x = this.bot.entity.position.x + directionVector.x;
        this.data.position.z = this.bot.entity.position.z + directionVector.z;

        this.bot.chat('/request_height ' + this.data.position.x + ' ' + this.data.position.z)

        onReceived(this);
    };
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
        this.received = false;
    }

    function onReceived(state){
        function eventListener(username, message){
            var args = message.split(' ') 
            if(username == 'requested_position'){
                state.data.position = new Vec3(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]))
                state.received = true;
                state.bot.removeListener('chat', eventListener);
            }
        }

        state.bot.on('chat', eventListener)
    }

    GetPlayerPositionState.prototype.onStateEntered = function () {
        this.received = false;

        this.bot.chat('/request_position ' + this.data.username)

        onReceived(this);
    };
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
        this.data = data;
        this.reached = false;
    }

    function onReceived(state){
        function eventListener(){
            state.reached = true;
        }

        state.bot.once('goal_reached', eventListener)
    }

    ProgressToState.prototype.onStateEntered = function () {
        this.reached = false;

        this.bot.pathfinder.stop()
        
        this.bot.pathfinder.setMovements(this.data.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.data.position.x,
            this.data.position.y, 
            this.data.position.z,
            16
        ))

        onReceived(this);
    };
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
    }

    FollowPlayerState.prototype.onStateEntered = function () {
        this.bot.pathfinder.stop()
        
        this.bot.pathfinder.setMovements(this.data.defaultMove)
        const goal = new GoalFollow(this.bot.players[this.data.username].entity, 2)
        this.bot.pathfinder.setGoal(goal, true)
    };
    FollowPlayerState.prototype.onStateExited = function () {};

    return FollowPlayerState;
}());

function createApproachPlayerState(bot, targets, data)
{
    this.data = data;
    this.targets = targets;
    this.bot = bot;


    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

    const getPlayerPosition = new getPlayerPositionState(this.bot, this.targets, this.data);
    const progressTo = new progressToState(this.bot, this.targets, this.data);
    const getPartialPosition = new getPartialPositionState(this.bot, this.targets, this.data);

    const transitions = [

        new StateTransition({
            parent: enter,
            child: getPlayerPosition,
            shouldTransition: () => true,
            onTransition: () => {},
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: getPartialPosition,
            shouldTransition: () => {
                if(!getPlayerPosition.received)return false;
                return !getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username);
            },
            onTransition: () => {},
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: exit,
            shouldTransition: () => {
                if(!getPlayerPosition.received)return false;
                return getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username);
            },
            onTransition: () => {},
        }),

        new StateTransition({
            parent: getPartialPosition,
            child: progressTo,
            shouldTransition: () => getPartialPosition.received,
            onTransition: () => {},
        }),

        new StateTransition({
            parent: progressTo,
            child: getPlayerPosition,
            shouldTransition: () => getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username),
            onTransition: () => {},
        }),
    ];

    const ApproachPlayerState = new NestedStateMachine(transitions, enter, exit);

    return ApproachPlayerState;
}

function createTravelToPlayerState(bot, targets, data){
    this.data = data;
    this.targets = targets;
    this.bot = bot;

    const enter = new BehaviorIdle();

    const approachState = createApproachPlayerState(this.bot, this.targets, this.data);
    const followState = new followPlayerState(this.bot, this.targets, this.data);
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
            child: followState,
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
            parent: followState,
            child: getPlayerPosition,
            shouldTransition: () => !followState.data.utils.playerIsNear(followState.data.username),
            onTransition: () => {},
        }),
    ];

    const TravelToPlayerState = new NestedStateMachine(transitions, enter);
    TravelToPlayerState.stateName = 'TravelToPlayerState';

    return TravelToPlayerState;
}

module.exports = {
    getPartialPositionState : getPartialPositionState,
    followPlayerState : followPlayerState,
    getPlayerPositionState : getPlayerPositionState,
    progressToState : progressToState,
    createApproachPlayerState : createApproachPlayerState,
    createTravelToPlayerState : createTravelToPlayerState
}