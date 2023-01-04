

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

const guardPlayerState = (function(){
    function GuardPlayerState(bot, targets, data)
    {
        this.bot = bot;
        this.active = false;
        this.stateName = 'guardPlayerState';
        this.targets = targets;
        this.data = data;
    }

    function onTick(state, method){
        function eventListener(){
            method();
        }

        state.bot.on('physicsTick', eventListener);
    }

    GuardPlayerState.prototype.onStateEntered = function () {
        onTick(this, ()=>{
            const filter = e => e.type === 'mob' && e.position.distanceTo(this.bot.entity.position) < 16 && e.mobType !== 'Armor Stand';

            const entity = this.bot.nearestEntity(filter)
            if (entity) {
                this.bot.pvp.attack(entity)
            }
        });
    };
    GuardPlayerState.prototype.onStateExited = function () {
        this.bot.pvp.stop();
    };

    return GuardPlayerState;
}());

module.exports = {
    guardPlayerState : guardPlayerState
}