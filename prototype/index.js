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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})


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
} = require('./movement.js');




const config = JSON.parse(fs.readFileSync('./../config.json'))

const bot = mineflayer.createBot({
    ...config.bot,
    plugins: [pvp, pathfinder, deathEvent],
});

inventoryViewer(bot)

const utils = new Utils(bot);



bot.once('spawn', ()=>{
    mineflayerViewer(bot, { port: 3007, firstPerson: true })

    var targets = {
    }

    var data = {
        utils : utils,
        username : 'M09245',
        defaultMove : new Movements(bot),
        position : null,
        distance : 40
    }
    
    const idleState = new BehaviorIdle();
    const approachState = createApproachPlayerState(bot, targets, data);
    const followState = new followPlayerState(bot, targets, data);
    const getPlayerPosition = new getPlayerPositionState(bot, targets, data);
    
    const transitions = [
        new StateTransition({
            parent: idleState,
            child: getPlayerPosition,
            shouldTransition: () => true,
            onTransition: () => {console.log('layer: 0, transition: 0')},
        }),
    
        new StateTransition({
            parent: getPlayerPosition,
            child: followState,
            shouldTransition: () => {
                if(!getPlayerPosition.received)return false;
                return getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username);
            },
            onTransition: () => {console.log('layer: 0, transition: 1')},
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: approachState,
            shouldTransition: () => {
                if(!getPlayerPosition.received)return false;
                return !getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username);
            },
            onTransition: () => {console.log('layer: 0, transition: 2')},
        }),

        new StateTransition({
            parent: approachState,
            child: getPlayerPosition,
            shouldTransition: () => approachState.isFinished(),
            onTransition: () => {console.log('layer: 0, transition: 3')},
        }),

        new StateTransition({
            parent: followState,
            child: getPlayerPosition,
            shouldTransition: () => !followState.data.utils.playerIsNear(followState.data.username),
            onTransition: () => {console.log('layer: 0, transition: 4')},
        }),
    ];
    
    const rootLayer = new NestedStateMachine(transitions, idleState);
    const stateMachine = new BotStateMachine(bot, rootLayer);

    const port = 12345;
    const SMServer = new StateMachineWebserver(bot, stateMachine, port);
    SMServer.startServer();
})




rl.on('line', (message) => {
})

bot.on('chat', async (username, message) => {
    if (username == bot.username) return
})

bot.on('kicked', console.log)
bot.on('error', console.log)