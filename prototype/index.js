const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
const readline = require('readline')
const fs = require('fs')
const { DataRequester } = require('./requester.js')
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

const requester = new DataRequester(bot);
const utils = new Utils(bot);



bot.once('spawn', ()=>{
    let targets = {
    }

    let data = {
        utils : utils,
        requester : requester,
        username : null,
        defaultMove : new Movements(bot),
        position : null,
        distance : bot.pathfinder.viewDistance
    }
    
    const idleState = new BehaviorIdle();
    const approachState = createApproachPlayerState(bot, targets, data)
    
    const transitions = [
        new StateTransition({
            parent: idleState,
            child: approachState,
            shouldTransition: () => true,
        }),
    
        new StateTransition({
            parent: approachState,
            child: idleState,
            shouldTransition: () => false,
        })
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