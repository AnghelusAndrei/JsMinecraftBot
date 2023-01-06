var Vec3 = require('vec3').Vec3;
const { pathfinder, Movements, goals: { GoalNear, GoalFollow } } = require('mineflayer-pathfinder')

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

    function onReceived(state, method){
        function eventListener(username, message){
            method(username, message, eventListener);
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

        onReceived(this, (username, message, eventListener)=>{
            if(this.eventListener != eventListener)this.eventListener = eventListener;

            var args = message.split(' ') 
            if(username == 'requested_height'){
                this.data.position.y = parseInt(args[0]);
                this.received = true;
            }
        });
    };
    GetPartialPositionState.prototype.onStateExited = function () {
        this.bot.removeListener('chat', this.eventListener);
    };

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

    function onReceived(state, method){
        function eventListener(username, message){
            method(username, message, eventListener);
        }

        state.bot.on('chat', eventListener)
    }

    GetPlayerPositionState.prototype.onStateEntered = function () {
        this.received = false;

        this.bot.chat('/request_position ' + this.data.username)

        onReceived(this, (username, message, eventListener)=>{
            if(this.eventListener != eventListener)this.eventListener = eventListener;

            var args = message.split(' ') 
            if(username == 'requested_position'){
                this.data.position = new Vec3(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]))
                this.received = true;
            }
        });
    };
    GetPlayerPositionState.prototype.onStateExited = function () {
        this.bot.removeListener('chat', this.eventListener);
    };

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

    function onReceived(state, method){
        function eventListener(){
            method(eventListener);
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

        onReceived(this, (eventListener)=>{
            if(this.eventListener != eventListener)this.eventListener = eventListener;

            this.reached = true;
        });
    };
    ProgressToState.prototype.onStateExited = function () {
        this.bot.pathfinder.setGoal(null)
        this.bot.pathfinder.stop();
        this.bot.removeListener('goal_reached', this.eventListener);
    };

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

const stuckState = (function(){
    function StuckState(bot, targets, data){
        this.bot = bot;
        this.active = false;
        this.stateName = 'stuckState';
        this.targets = targets;
        this.data = data;
    }

    function onReceived(state, method){
        function eventListener(){
            method(eventListener);
        }

        state.bot.on('goal_reached', eventListener)
    }

    function nextBlock(i){

    }

    StuckState.prototype.onStateEntered = function () {
        this.blocksDug = 0;
        

        this.bot.pathfinder.stop()

        let blocktarget = this.bot.blockAt(this.bot.entity.position.offset(1, 0, 0));
        if (this.bot.canDigBlock(blocktarget))bot.dig(blocktarget);
        

        onReceived(this, (eventListener)=>{
            if(this.eventListener != eventListener)this.eventListener = eventListener;

            blocktarget = nextBlock(this.blocksChecked);
            while(!this.bot.canDigBlock(blocktarget))
                blocktarget = nextBlock(this.blocksChecked);
                this.blocksChecked++;
            };
            this.blocksDug++;  
            digBlock(blocktarget);
        });
    }
    StuckState.prototype.onStateExited = function () {
    }
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
            shouldTransition: () => progressTo.data.utils.playerIsNear(progressTo.data.username) || progressTo.reached,
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

    var TravelToPlayerState = new NestedStateMachine(transitions, enter);

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