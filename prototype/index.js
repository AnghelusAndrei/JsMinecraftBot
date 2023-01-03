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
        username : 'M09245',
        defaultMove : new Movements(bot),
        position : null,
        distance : bot.pathfinder.viewDistance
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
        }),
    
        new StateTransition({
            parent: getPlayerPosition,
            child: followState,
            shouldTransition: () => 
            {
                if(getPlayerPosition.data.position == null || getPlayerPosition.data.position instanceof Promise)return false;
                return (getPlayerPosition.data.position.distanceTo(bot.entity.position) < getPlayerPosition.data.distance || getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username))
            },
        }),

        new StateTransition({
            parent: getPlayerPosition,
            child: approachState,
            shouldTransition: () => 
            {
                if(getPlayerPosition.data.position == null || getPlayerPosition.data.position instanceof Promise)return false;
                return (getPlayerPosition.data.position.distanceTo(bot.entity.position) > getPlayerPosition.data.distance || !getPlayerPosition.data.utils.playerIsNear(getPlayerPosition.data.username))
            }
        })
    ];

    bot.on('chat', (username, message)=>{
        switch(username){
            case 'requested_position':
                var args = message.split(' ') 
                if(args.length != 3){break;}
                getPlayerPosition.data.position = new Vec3(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]))
                followState.data.position = getPlayerPosition.data.position;
                approachState.data.position = getPlayerPosition.data.position;
                transitions[1].trigger();
                transitions[2].trigger();
                break;
            default:
                break;
        }
    })
    
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