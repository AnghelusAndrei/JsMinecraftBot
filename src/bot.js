'use strict';

import { createRequire } from 'module';
import { loadavg } from 'os';
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

var pack = {
    host: 'abcd.aternos.me',
    port: 25565,
    version: '1.16.4'
}

var str = fs.readFileSync("./data.txt");
var stringS = str.toString().split(" ");
var strArrS = [];
for(var i = 0; i < stringS.length; i++){
    strArrS.push(stringS[i]);
}

var bot = mineflayer.createBot({
    host: strArrS[0],
    port: parseInt(strArrS[1]),
    username: 'Bot245',
    version: strArrS[2],
})

var spawned = false;
var inProcces;
var collectIndex = 0;

bot.loadPlugin(pathfinder);
bot.loadPlugin(armorManager);
bot.loadPlugin(pvp);
bot.loadPlugin(autoeat)
bot.loadPlugin(require('mineflayer-collectblock').plugin);
var mcData=require("minecraft-data")(bot.version)
const defaultMove = new Movements(bot, mcData)

bot.once('spawn', () => {
    if(lag == true){
        bot.end();
    }
    inProcces = false;
    console.log('joined '+strArrS[0]);
    spawned = true;
    if(eval(strArrS[3]) == true){
        Login('Bot557');
    }
    bot.autoEat.options = {
        priority: "foodPoints",
        startAt: 14,
        bannedFood: [],
    }
})

async function Login(password){
    await sleep(1*1000);
    bot.chat('/login '+password);
    bot.setControlState('forward', true);
    await sleep(1*1000);
    bot.clearControlStates();
    console.log('logged');
}

bot.on("health", () => {
    if (bot.food === 20) bot.autoEat.disable()
    else bot.autoEat.enable()
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
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
            bot.pathfinder.setGoal(null);
            bot.pvp.stop();
            inProcces = false;
            bot.stopDigging()
            bot.clearControlStates();
            bot.chat('stopping the proccess...');
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
            //bot.chat(`I'm already in a process, type 'stop'`);
            return
        }
    }



    if(strArr[0] == '!battle'){
        inProcces = true;
        inBattle = true;
    }else if(strArr[0] == '!run'){
        inProcces = true;
        Running = true;
    }else if(strArr[0] == '!lag'){
        lag = true;
        bot.end();
    }else if(strArr[0] == '!follow'){
        bot.chat('following');
        inProcces = true
        followPlayer(strArr[1]);
    }else if(strArr[0] == '!fight'){
        bot.chat('fighting');
        inProcces = true
        const player = bot.players[strArr[1]]

        if(!player || !player.entity){
            bot.chat(`I can't see ${player}`);
            return
        }

        bot.pvp.attack(player.entity);
        
    }else if(strArr[0] == '!collect'){
        inProcces = true
        collect(strArr[1], parseInt(strArr[2]));
    }else if(strArr[0] == '!mobhunt'){
        bot.chat('mobhunt');
        inProcces = true;
        hunt = true;
        hBool = false;
    }else if(strArr[0] == '!manhunt'){
        inProcces = true;
        Prepare();
    }else if(strArr[0] == '!jp' && strArr[1] != bot.username){
        bot.chat('/p accept '+strArr[1]);
    }
});


var lagNum = 0;
var lag = false;

bot.on('end', () => {
    if(lag == true){
        lagNum += 1;
        bot = undefined;
        bot = mineflayer.createBot({
            host: strArrS[0],
            port: parseInt(strArrS[1]),
            username: 'Bot'+(245+lagNum).toString(),
            version: strArrS[2],
        })
    }
})


bot.on('playerCollect', (collector, itemDrop) => {
    if(collector != bot.entity) return

    setTimeout(() => {
        const sword = bot.inventory.items().find(item => item.name.includes('sword'))
        if(sword) bot.equip(sword, 'hand');
    }, 150)
})

bot.on('playerCollect', (collector, itemDrop) => {
    if(collector != bot.entity) return

    setTimeout(() => {
        const shield = bot.inventory.items().find(item => item.name.includes('shield'))
        if(shield) bot.equip(shield, 'off-hand');
    }, 250)
})


rl.on('line', (message) => {
    if(spawned == true){
        var string = message.split(" ");
        var strArr = [];
        var sendString = '';
        for(var i = 0; i < string.length; i++){
            strArr.push(string[i]);
        }

        if(strArr[0] == 'send'){
            for(var i = 0; i<strArr.length-1; i++){
                sendString = sendString+strArr[i+1]+' ';
            }
            bot.chat(sendString);

            return
        }else if(eval(strArr[0]) != undefined){
            console.log(eval(strArr[0]));
        }else{
            return
        }

        if(strArr[0] == 'pos'){
            bot.chat(bot.entity.position.toString());

            return
        }else if(eval(strArr[0]) != undefined){
            console.log(eval(strArr[0]));
        }else{
            return
        }
    }
})


bot.on('chat', (username, message) => {
    console.log(`${username}: ${message}`);
    var string = message.split(" ");
    var strArr = [];
    for(var i = 0; i < string.length; i++){
        strArr.push(string[i]);
    }

    if(username == bot.username){return}
    /*if(!fs.readFileSync("./users.txt").toString().includes(username)){
        return
    }*/
    
    if(inProcces == true){
        if(strArr[0] == 'stop'){
            bot.pathfinder.setGoal(null);
            bot.pvp.stop();
            inProcces = false;
            bot.stopDigging()
            bot.clearControlStates();
            //bot.chat('stopping the proccess...');
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
        }else if(strArr[0] == 'phase' && strArr[1] == undefined){
            bot.chat(progress.toString());
            return
        }else if(strArr[0] == 'phase' && strArr[1] != undefined){
            progress = parseInt(strArr[1]);
            return
        }else{
            //bot.chat(`I'm already in a process, type 'stop'`);
            return
        }
    }

        if(strArr[0] == 'jp' && strArr[1] != bot.username){
            bot.chat('/p accept '+username);
        }

        if(strArr[0] == 'follow' && strArr[1] != bot.username){
            bot.chat('following');
            inProcces = true
            if(strArr[1] == 'me'){
                followPlayer(username);
            }else{
                followPlayer(strArr[1]);
            }
        }

        if(strArr[0] == 'run'){
            inProcces = true;
            Running = true;
        }

        if(strArr[0] == 'collect' && strArr[1] != bot.username){
            inProcces = true
            collect(strArr[1], parseInt(strArr[2]));
        }

        if(strArr[0] == 'mobhunt'){
            bot.chat('mobhunt');
            inProcces = true;
            hunt = true;
            hBool = false;
        }

        if(message == 'pos'){
            bot.chat(bot.entity.position.toString());
        }

        if(strArr[0] == 'manhunt' && inProcces == false && bot.version == '1.8.9'){
            inProcces = true;
            
            Prepare();
        }

        if(message == 'battle'){
            inProcces = true;
            inBattle = true;
        }

    
        if(strArr[0] == 'fight' && strArr[1] != bot.username){
            if(strArr[1] == 'megaGaming245'){
                bot.chat(`no u`);

                const player = bot.players[username]
    
                if(!player || !player.entity){
                    return
                }
    
                bot.pvp.attack(player.entity);

                return
            }
            //bot.chat('fighting');
            inProcces = true
            if(strArr[1] == 'me'){
                const player = bot.players[username]
    
                if(!player || !player.entity){
                    bot.chat(`I can't see ${player}`);
                    return
                }
    
                bot.pvp.attack(player.entity);
            }else{
                const player = bot.players[strArr[1]]
    
                if(!player || !player.entity){
                    bot.chat(`I can't see ${player}`);
                    return
                }
    
                bot.pvp.attack(player.entity);
            }
        }
    
})

bot.on('error', (err)=>{
    fs.writeFile('./data.txt', "Error", function(error) {
        
    });
});

async function executeAction(action, time){
    bot.setControlState(action, true);
    await sleep(time*1000);
    bot.clearControlStates();
}

async function Prepare(){
    bot.chat('hunting in');
    await sleep(1*1000);
    bot.chat('3');
    await sleep(1*1000);
    bot.chat('2');
    await sleep(1*1000);
    bot.chat('1');
    await sleep(1*1000);
    bot.chat('hunting');
    hunting = true;
}

function followPlayer(player){
    const playerCI = bot.players[player];

    if(!playerCI || !playerCI.entity){
        bot.chat(`I can't see ${player}`);
        return
    }

    const mcData = require('minecraft-data')(bot.version);
    const movements = new Movements(bot, mcData);

    bot.pathfinder.setMovements(movements);

    const goal = new GoalFollow(playerCI.entity, 1);
    bot.pathfinder.setGoal(goal, true);

    if(playerCI.entity.position.distanceTo(bot.entity.position) < 5){
        bot.pathfinder.setGoal(null);
        inProcces = false;
    }

    if(inProcces == false){
        return
    }
}

var hBool = false;

bot.on('stoppedAttacking', () => {
    if(hBool=true){hBool=false};
})

bot.on('physicTick', nonProcces);

function nonProcces(){
    if(inProcces == false){
        const playerFilter = (entity) => entity.type === 'player'
        const playerEntity = bot.nearestEntity(playerFilter);
        
        const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 5 &&
        e.mobType !== 'Armor Stand'

        const entity = bot.nearestEntity(filter)
        if(entity != lastEntity) {hBool=false}
        if (entity && entity.kind.toString().toLowerCase().includes('hostile') && hBool == false) { hBool=true; bot.pvp.attack(entity)}else{
            if(playerEntity){
                const pos = playerEntity.position.offset(0, playerEntity.height, 0);
                bot.lookAt(pos);
            }
        }
    }
}

var hunt = false;
var xBool = false;

bot.on('physicTick', Hunt);

function Hunt(){
    if(hunt == true){
    const playerFilter = (entity) => entity.type === 'player'
    const playerEntity = bot.nearestEntity(playerFilter);
    
    const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 50 &&
    e.mobType !== 'Armor Stand'

    const entity = bot.nearestEntity(filter)
    if(entity != lastEntity) {hBool=false}
    if (entity && entity.kind.toString().toLowerCase().includes('hostile') && hBool == false) { hBool=true; bot.pvp.attack(entity)}else{
        if(playerEntity){
            const pos = playerEntity.position.offset(0, playerEntity.height, 0);
            bot.lookAt(pos);
        }
    }
    }
}

bot.on('kicked', (reason, loggedIn) => {
    console.log(reason, loggedIn)
    fs.writeFile('./data.txt', reason.toString(), () => {});
});


function collect(what, num){
    xBool = true;
    var blocks = [];

    for(var i = 0; i<num; i++){
        blocks.push(bot.findBlock({
            matching: mcData.blocksByName[what].id,
            maxDistance: 200
        }));
    }

    if(blocks[0]){
        bot.collectBlock.collect(blocks, err => {
            bot.stopDigging()
            if (err) {console.log(err)}
            else {console.log('succes'); xBool = false; if(collectIndex > 0){collectIndex-=1; collect(what);}}
        })
    }
}


//bot.on('physicTick', MHunt);
bot.on('physicTick', Battle);

function MHunt(){
    if(hunting != true){return}
    else{
        const playerFilter = (entity) => entity.type === 'player'
        const playerEntity = bot.nearestEntity(playerFilter);
        
        if(!bot.entity.position || !playerEntity){return}
        
        var nearestDist = playerEntity.position.distanceTo(bot.entity.position);
    

        if(nearestDist < 1 || nearestDist > 230){
            if(fBool == false) HuntPlayer(playerEntity);
        }else{
            if(ready == false){
                fBool = false;
                CollectResources();
            }else{
                if(fBool == false) HuntPlayer(playerEntity);
            }
        }
    }
}

function Battle(){
    if(inBattle == true){
        const playerFilter = (entity) => entity.type === 'player'
        const playerEntity = bot.nearestEntity(playerFilter);
        
        if(!bot.entity.position || !playerEntity){return}

        if(playerEntity != lastEntity){fBool = false}

        if(fBool == false){
            fBool = true;
            lastEntity = playerEntity;
            bot.pvp.attack(playerEntity);
        }   
    }
}


function Run(){
    if(Running == true){
        const playerFilter = (entity) => entity.type === 'player'
        const playerEntity = bot.nearestEntity(playerFilter);
        
        if(!bot.entity.position || !playerEntity){return}

        if(playerEntity != lastEntity){fBool = false; bot.pathfinder.setGoal(null);}

        if(fBool == false){
            fBool = true;
            lastEntity = playerEntity;
            var x = bot.entity.position.x - playerEntity.position.x;
            var z = bot.entity.position.z - playerEntity.position.z;

            bot.pathfinder.setMovements(defaultMove)
            bot.pathfinder.setGoal(new GoalNear(x*10,bot.entity.position.y,z*10,1));
        }   
    }
}

function Hostile(entity){
    hBool = true;
    bot.pvp.attack(entity);
}
bot.on('stoppedAttacking', () => {
    hBool = false;
    fBool = false;
})

function HuntPlayer(player){
    fBool = true;
    bot.pvp.attack(player);
}

function CollectResources(){
    const filter = e => e.type === 'mob' && e.position.distanceTo(bot.entity.position) < 7 &&
                        e.mobType !== 'Armor Stand'
                        

    var entity = bot.nearestEntity(filter)
    if(entity != lastEntity) {hBool=false;lastEntity = entity}
    if (entity && hBool == false) Hostile(entity);

    if(!entity){hBool = false}

    if(!entity && hBool == false){
        if(xBool == false){
            bot.pvp.stop();
            switch(progress){
                case 0:
                    if(woodNum <= 4){
                        Wood();
                    }else{
                        bot.stopDigging()
                        bot.chat('crafting wood');
                        Craft('planks', null, woodNum, 5);
                    }
                    break;
                case 1:
                    Craft('crafting_table', null, 1, 58);
                    break;
                case 2:
                    xBool = true;
                    inPathfinding = true
                    bot.pathfinder.setMovements(defaultMove)
                    bot.pathfinder.setGoal(new GoalNear(Math.floor(bot.entity.position.x)+0.5, bot.entity.position.y, Math.floor(bot.entity.position.z)+0.5, 1))
                    break;
                case 3:
                    var CraftingTable = bot.findBlock({
                        matching: 58,
                        maxDistance: 100
                    });
                    Craft('stick', CraftingTable, 2, 280);
                    break;
                case 4:
                    var CraftingTable = bot.findBlock({
                        matching: 58,
                        maxDistance: 100
                    });
                    Craft('wooden_pickaxe', CraftingTable, 1, 270);
                    break;
                case 5:
                    var CraftingTable = bot.findBlock({
                        matching: 58,
                        maxDistance: 100
                    });

                    if(stoneNum < 13){
                        Stone();
                    }else{
                        bot.stopDigging()
                        xBool = true;
                        bot.pathfinder.setMovements(defaultMove)
                        bot.pathfinder.setGoal(new GoalNear(CraftingTable.position.x, CraftingTable.position.y+1, CraftingTable.position.z, 1))
                    }
                    break;
                case 6:
                    var CraftingTable = bot.findBlock({
                        matching: 58,
                        maxDistance: 100
                    });
                    Craft('stone_sword', CraftingTable, 1, 272);
                    break;
                case 7:
                    ready = true;
                    break;
            }
        }
    }
}

bot.on('goal_reached', () => {
    if(stoneNum == 13 && progress == 5){
        bot.chat('reached crafting table');
        var CraftingTable = bot.findBlock({
            matching: 58,
            maxDistance: 100
        });
        Craft('stone_pickaxe', CraftingTable, 1, 274);
    }
    if(inPathfinding == true){
        PlaceCraft('crafting');
        inPathfinding = false;
    }
    if(progress == 8){
        var CraftingTable = bot.findBlock({
            matching: 58,
            maxDistance: 100
        });

        PlaceCraft('furnace');
    }
})

function Wood(){
    xBool = true;
    var wood = bot.findBlock({
        matching: mcData.blocksByName['log'].id,
        maxDistance: 100
    });
    
    if(wood){
        bot.collectBlock.collect(wood, err => {
            bot.stopDigging()
            if (err) {console.log(err)}
            else {xBool = false; woodNum += 1; console.log(woodNum)}
        })
    }
}

function Stone(){
    xBool = true;
    var stone = bot.findBlock({
        matching: mcData.blocksByName['stone'].id,
        maxDistance: 100
    });

    const item = bot.inventory.items().find(item => item.name.includes('pic'))
    if(item) bot.equip(item, 'hand');
    
    if(stone){
        bot.collectBlock.collect(stone, err => {
            bot.stopDigging()
            if (err) {console.log(err)}
            else {xBool = false; stoneNum += 1; console.log(stoneNum)}
        })
    }
}

function Iron(){
    xBool = true;
    var i = mcData.blocksByName['iron_ore'];
    if(i == undefined){i = 15}
    else{i = i.id}

    const item = bot.inventory.items().find(item => item.name.includes('pic'))
    if(item) bot.equip(item, 'hand');

    var iron = bot.findBlock({
        matching: i,
        maxDistance: 100
    });
    
    if(iron){
        bot.collectBlock.collect(iron, err => {
            bot.stopDigging()
            if (err) {console.log(err)}
            else {xBool = false; ironNum += 1; console.log(ironNum)}
        })
    }
}

bot.on("diggingCompleted", (block) => {

})

bot.on("death", () => {
    bot.pathfinder.setGoal(null);
    bot.pvp.stop();
    inProcces = false;
    bot.stopDigging()
    bot.clearControlStates();
    bot.chat('stopping the proccess...');
    hunting = false;
    fBool = false;
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
})

function Craft(name, craftingTable, num, id){
    xBool = true;

    var blockToCraft = mcData.blocksByName[name];
    if(blockToCraft == undefined && id != undefined){blockToCraft = id}
    else{blockToCraft = mcData.blocksByName[name].id}
    var recipe = bot.recipesFor(blockToCraft, null, 1, craftingTable)[0];
    if(recipe == undefined && require("prismarine-recipe")("1.8").Recipe.find(blockToCraft)[0] != undefined){recipe = require("prismarine-recipe")("1.8").Recipe.find(blockToCraft)[0]}


    bot.craft(recipe, num, craftingTable, (err) => {
        if(err){
        }else{
            bot.chat('crafted');
            nextProcces();
        }
    })
}

async function PlaceCraft(name){
    xBool = true;
    var canPlace = false;

    var x1 = bot.blockAt(bot.entity.position.offset(1, 1, 0), false);
    var x2 = bot.blockAt(bot.entity.position.offset(-1, 1, 0), false);
    var z1 = bot.blockAt(bot.entity.position.offset(0, 1, 1), false);
    var z2 = bot.blockAt(bot.entity.position.offset(0, 1, -1), false);

    const item = bot.inventory.items().find(item => item.name.includes(name))
    if(item){bot.equip(item, 'hand');canPlace = true}

    await sleep(0.5 * 1000);

    if(canPlace == true){
        if(x1.name == 'air') {
            bot.placeBlock(bot.blockAt(bot.entity.position.offset(1, 0, 0), false),
                new Vec3(0,1,0),
                (err) => {
                    nextProcces();
                    if(err) { 
                        console.log(err)
                    }
                }
            )}
        else if(x2.name == 'air') {
            bot.placeBlock(bot.blockAt(bot.entity.position.offset(-1, 0, 0), false),
                new Vec3(0,1,0),
                (err) => {
                    nextProcces();
                    if(err){
                        console.log(err)
                    }
                })
            }
        else if(z1.name == 'air'){
            bot.placeBlock(bot.blockAt(bot.entity.position.offset(0, 0, 1), false),
                new Vec3(0,1,0),
                (err) => {
                    nextProcces();
                    if(err) {
                        console.log(err)
                    }
                })
            }
        else if(z2.name == 'air'){
            bot.placeBlock(bot.blockAt(bot.entity.position.offset(0, 0, -1), false),
                new Vec3(0,1,0), (err) => {
                    nextProcces();
                    if(err){
                        console.log(err)
                    }
                })
            }
        else {bot.dig(x1, true, () => {
            bot.placeBlock(bot.blockAt(bot.entity.position.offset(1, 0, 0), false),
                new Vec3(0,1,0), (err) => {
                    nextProcces();
                    if(err){
                        console.log(err)
                    }
                })
            })
        }
    }
}

function nextProcces(){
    progress += 1;
    xBool = false;
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
