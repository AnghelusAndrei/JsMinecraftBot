'use strict';

import { createRequire } from 'module';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
const mineflayer = require('mineflayer');
const pvp = require('mineflayer-pvp').plugin;
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const readline = require('readline');
const armorManager = require('mineflayer-armor-manager')
const { GoalNear } = require('mineflayer-pathfinder').goals
const autoeat = require("mineflayer-auto-eat")
var fs = require("fs");
const GoalFollow = goals.GoalFollow
const Vec3 = require('vec3').Vec3;

var spawned = false;
var hunt = false;
var xBool = false;
var inProcces;
var collectIndex = 0;
var hunting = false;
var players = [];
var lastEntity;
var hBool = false;
var fBool = false;
var cBool = false;
var ready = false;
var xBool = false;
var stoneNum = 0;
var Running = false;
var ironNum = 0;
var inBattle = false;
var woodNum = 0;
var inPathfinding = false;
var progress = 0;

var s = 246;


var str = fs.readFileSync("./data.txt");
var stringS = str.toString().split(" ");
var strArrS = [];
for(var i = 0; i < stringS.length; i++){
    strArrS.push(stringS[i]);
}

var bot = [
mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot246',
    version: strArrS[2],
}),
    mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot247',
    version: strArrS[2],
}),
mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot248',
    version: strArrS[2],
}),
mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot249',
    version: strArrS[2],
}),
mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot250',
    version: strArrS[2],
}),
mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot251',
    version: strArrS[2],
})
]


var mcData=require("minecraft-data")(bot[0].version)
const defaultMove = new Movements(bot[0], mcData)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

BotFunc(0)
BotFunc(1)
BotFunc(2)
BotFunc(3)
BotFunc(4)
BotFunc(5)

function BotFunc(i){
    bot[i].loadPlugin(pathfinder);
    bot[i].loadPlugin(armorManager);
    bot[i].loadPlugin(pvp);
    bot[i].loadPlugin(autoeat)
    bot[i].loadPlugin(require('mineflayer-collectblock').plugin);

    bot[i].once('spawn', () => {
        console.log(bot.username+' joined '+strArrS[0]);
        inProcces = false;
        spawned = true;
        if(eval(strArrS[3]) == true){
            var n = 558+i
            Register('Bot'+n.toString(), i);
            //Login('Bot'+n.toString(), i);
        }
    })

    bot[i].on('physicTick', () => {
        if(inProcces == false){
            const playerFilter = (entity) => entity.type === 'player'
            const playerEntity = bot[i].nearestEntity(playerFilter);
            
            const filter = e => e.type === 'mob' && e.position.distanceTo(bot[i].entity.position) < 5 &&
            e.mobType !== 'Armor Stand'
    
            const entity = bot[i].nearestEntity(filter)
            if(entity != lastEntity) {hBool=false}
            if (entity && entity.kind.toString().toLowerCase().includes('hostile') && hBool == false) { hBool=true; bot[i].pvp.attack(entity)}else{
                if(playerEntity){
                    const pos = playerEntity.position.offset(0, playerEntity.height, 0);
                    bot[i].lookAt(pos);
                }
            }
        }
    });

    bot[i].on('chat', (username, message) => {
        var string = message.split(" ");
        var strArr = [];
        for(var i = 0; i < string.length; i++){
            strArr.push(string[i]);
        }
    
        if(username.includes('Bot')){return}
        if(!fs.readFileSync("./users.txt").toString().includes(username)){
            return
        }

        if(strArr[0] == 'exterminate'){
            const player = bot[i].players[strArr[1]]
    
            
            if(!player || !player.entity){
                bot[i].chat(`${player.username} is not within reach`);
                return
            }
            bot[i].pvp.attack(player.entity);
            bot[i].chat(`exterminating ${player.username}`);
        }
        
        if(inProcces == true){
            if(strArr[0] == 'stop'){
                bot[i].pathfinder.setGoal(null);
                bot[i].pvp.stop();
                inProcces = false;
                bot[i].stopDigging()
                bot[i].clearControlStates();
                //bot[i].chat('stopping the proccess...');
                hunting = false;
                fBool = false;
                Running = false;
                cBool = false;
                hBool = false;
                xBool = false;
                stoneNum = 0;
                hunt = false;
                ironNum = 0;
                inBattle = false;
                woodNum = 0;
                progress = 0;
                return
            }else{
                return
            }
        }

        if(message == 'battle'){
            inProcces = true;
            inBattle = true;
        }

    })

    bot[i].on('physicTick', () => {
        if(inBattle == true){
            const playerFilter = (entity) => entity.type === 'player'
            const playerEntity = bot[i].nearestEntity(playerFilter);
            
            if(!bot[i].entity.position || !playerEntity){return}
    
            if(playerEntity != lastEntity){fBool = false}
    
            if(fBool == false){
                fBool = true;
                lastEntity = playerEntity;
                bot[i].pvp.attack(playerEntity);
            }   
        }
    })

    fs.watch('./data.txt', (eventType, filename) => {
        var strNew = fs.readFileSync("./data.txt");
        var string = strNew.toString().split(" ");
        var strArr = [];
        for(var i = 0; i < string.length; i++){
            strArr.push(string[i]);
        }
    
    
        if(inProcces == true){
            if(strArr[0] == '!stop'){
                bot[i].pathfinder.setGoal(null);
                bot[i].pvp.stop();
                inProcces = false;
                bot[i].stopDigging()
                bot[i].clearControlStates();
                bot[i].chat('stopping the proccess...');
                hunting = false;
                fBool = false;
                cBool = false;
                hBool = false;
                xBool = false;
                stoneNum = 0;
                hunt = false;
                Running = false;
                ironNum = 0;
                inBattle = false;
                woodNum = 0;
                Running = false;
                progress = 0;
                return
            }else{
                bot[i].chat(`I'm already in a process, type 'stop'`);
                return
            }
        }



        if(strArr[0] == '!jp' && strArr[1] != bot[i].username){
            bot[i].chat('/p accept '+strArr[1]);
        }
    })
}


async function Login(password, i){
    await sleep(1*1000);
    bot[i].chat('/login '+password);
    bot[i].setControlState('forward', true);
    await sleep(1*1000);
    bot[i].clearControlStates();
    console.log('logged');
}

async function Register(password, i){
    await sleep(1*1000);
    bot[i].chat('/register '+password+' '+password);
    await sleep(1*1000);
    bot[i].chat('/login '+password);
    bot[i].setControlState('forward', true);
    await sleep(1*1000);
    bot[i].clearControlStates();
    console.log('logged');
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}