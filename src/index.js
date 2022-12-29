const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const readline = require('readline')
const fs = require('fs')

Instance = require('./instance.js').Instance
Listener = require('./listener.js').Listener

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const config = JSON.parse(fs.readFileSync('./../config.json'))

const bot = mineflayer.createBot(config.bot)

var defaultMove

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

const instance = new Instance(bot)
const listener = new Listener()


bot.once('spawn', () => {
    defaultMove = new Movements(bot)
    instance.view(mineflayerViewer)
    instance.setMovements(defaultMove)
})

rl.on('line', (message) => {
    var args = message.split(' ')  
    listener.listen(instance, args)
})

bot.on('chat', async (username, message) => {
    if (username == bot.username) return
    var args = message.split(' ')   
    await listener.listen(instance, args)
})

bot.on('kicked', console.log)
bot.on('error', console.log)
