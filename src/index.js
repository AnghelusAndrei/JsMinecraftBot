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

const { Instance } = require('./instance.js');


const config = JSON.parse(fs.readFileSync('./../config.json'))

const bot = mineflayer.createBot({
    ...config.bot,
    plugins: [pvp, pathfinder, deathEvent],
});

const instance = new Instance(bot);


bot.once('spawn', ()=>{
    inventoryViewer(bot)
    mineflayerViewer(bot, { port: 3007, firstPerson: true })
    instance.run();
})




rl.on('line', (message) => {
    args = message.split(' ');
    instance.listen(args);
})

bot.on('chat', async (username, message) => {
    if (username == bot.username) return;
    args = message.split(' ');
    instance.listen(args);
})

bot.on('kicked', console.log)
bot.on('error', console.log)