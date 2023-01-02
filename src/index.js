const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
const readline = require('readline')
const fs = require('fs')
const { Instance } = require('./instance.js')
const { DataRequester } = require('./requester.js')
const { Utils } = require('./utils');
const inventoryViewer = require('mineflayer-web-inventory')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const config = JSON.parse(fs.readFileSync('./../config.json'))

const bot = mineflayer.createBot({
    ...config.bot,
    plugins: [pvp, pathfinder, deathEvent],
});

inventoryViewer(bot)

requester = new DataRequester(bot)
instance = new Instance(bot, requester)
instance.run()


rl.on('line', (message) => {
    var args = message.split(' ')  
    instance.listen(args)
})

bot.on('chat', async (username, message) => {
    if (username == bot.username) return
    var args = message.split(' ')   
    instance.listen(args)
})

bot.on('kicked', console.log)
bot.on('error', console.log)