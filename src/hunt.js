

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

        this.bot.pvp.attack(this.bot.players[this.data.username].entity)
    };
    AttackPlayerState.prototype.onStateExited = function () {
        this.bot.pvp.stop();
    };

    return AttackPlayerState;
}());

function createHuntPlayerState(bot, targets, data){
    this.data = data;
    this.targets = targets;
    this.bot = bot;

    const enter = new BehaviorIdle();
    const exit = new BehaviorIdle();

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

        new StateTransition({
            parent: approachState,
            child: exit,
            shouldTransition: () => false,
            onTransition: () => {},
        }),

        new StateTransition({
            parent: attackState,
            child: exit,
            shouldTransition: () => false,
            onTransition: () => {},
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: exit,
            shouldTransition: () => false,
            onTransition: () => {},
        }),
    ];

    const HuntPlayerState = new NestedStateMachine(transitions, enter, exit);
    HuntPlayerState.stateName = 'HuntPlayerState';

    var state = this;

    function deathListener(data){
        if(!HuntPlayerState.active)return;

        let uuid = data.victim.id;
        var name = null;
        state.bot.chat('/request_name ' + uuid);

        function onReceived(){
            function eventListener(username, message){
                var args = message.split(' ') 
                if(username == 'requested_name'){
                    name = args[0]

                    if(name != state.data.username)return;

                    state.bot.removeListener('chat', eventListener);

                    for(let i = 0; i < transitions.length; i++){
                        if(transitions[i].childState == exit){
                            transitions[i].trigger();
                        }
                    }
                    state.bot.chat('heheheha');
                    state.bot.removeListener("chat", eventListener)
                    state.bot.removeListener("playerDeath", deathListener)
                }
            }
    
            state.bot.on('chat', eventListener)
        }

        onReceived(this);
    }
    
    this.bot.on("playerDeath", deathListener);

    return HuntPlayerState;
}

module.exports = {
    attackPlayerState : attackPlayerState,
    createHuntPlayerState : createHuntPlayerState,
}