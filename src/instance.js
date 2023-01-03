const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
const readline = require('readline')
const fs = require('fs')
const { Utils } = require('./utils');
const inventoryViewer = require('mineflayer-web-inventory')
var Vec3 = require('vec3').Vec3;

const {
    StateTransition,
    BotStateMachine,
    NestedStateMachine,
    BehaviorIdle,
    StateMachineWebserver } = require("mineflayer-statemachine");

const {
    getPartialPositionState,
    followPlayerState,
    getPlayerPositionState,
    progressToState,
    createApproachPlayerState,
    createTravelToPlayerState,
} = require('./movement.js');

const {
    attackPlayerState,
    createHuntPlayerState,
} = require('./hunt.js')


class Instance{
    constructor(bot){
        this.bot = bot;
        this.utils = new Utils(this.bot)
    }

    createRootLayer(){
        this.targets = {
        }
    
        this.data = {
            utils : this.utils,
            username : null,
            defaultMove : new Movements(this.bot),
            position : null,
            distance : null,
        }
        
        this.idleState = new BehaviorIdle();
        this.followState = new createTravelToPlayerState(this.bot, this.targets, this.data)
        this.attackState = new createHuntPlayerState(this.bot, this.targets, this.data)
        this.transitions = [
            new StateTransition({
                parent: this.idleState,
                child: this.followState,
                shouldTransition: () => false,
                onTransition: () => {},
            }),

            new StateTransition({
                parent: this.followState,
                child: this.idleState,
                shouldTransition: () => false,
                onTransition: () => {},
            }),
            
            new StateTransition({
                parent: this.idleState,
                child: this.attackState,
                shouldTransition: () => false,
                onTransition: () => {},
            }),

            new StateTransition({
                parent: this.attackState,
                child: this.idleState,
                shouldTransition: () => false,
                onTransition: () => {},
            }),
        ];
        
        this.rootLayer = new NestedStateMachine(this.transitions, this.idleState);
        this.rootLayer.stateName = 'main';
    }

    run(){
        this.createRootLayer();
        const stateMachine = new BotStateMachine(this.bot, this.rootLayer);
    
        const port = 12345;
        const SMServer = new StateMachineWebserver(this.bot, stateMachine, port);
        SMServer.startServer();
    }

    listen(args){
        let command = args[0];
        args.splice(0,1);
        switch(command){
            case 'hunt':
                this.data.username = args[0];
                this.data.distance = 40;

                this.attackState = this.data;
                this.transitions[2].trigger();
                break;
            case 'follow':
                this.data.username = args[0];
                this.data.distance = 40;

                this.followState = this.data;
                this.transitions[0].trigger();
                break;
            case 'stop':
                this.transitions[1].trigger();
                this.transitions[3].trigger();
                break;
            default:
                break;
        }
    }
}

module.exports = {
    Instance : Instance
}