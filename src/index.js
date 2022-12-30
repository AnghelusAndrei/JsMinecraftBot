const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const readline = require('readline')
const fs = require('fs')
const { Instance } = require('./instance.js')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const config = JSON.parse(fs.readFileSync('./../config.json'))

const bot = mineflayer.createBot(config.bot)

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)


instance = new Instance(bot)


bot.once('spawn', () => { 
    var defaultMove = defaultMove = new Movements(bot)
    instance.view(mineflayerViewer)
    instance.setMovements(defaultMove)
})

rl.on('line', (message) => {
    var args = message.split(' ')  
    instance.listen(args)
})

bot.on('chat', async (username, message) => {
    //console.log(username + ': ' + message);
    if (username == bot.username) return
    var args = message.split(' ')   
    instance.listen(args)
})

bot.on('kicked', console.log)
bot.on('error', console.log)