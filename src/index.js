const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
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
bot.loadPlugin(deathEvent)


instance = new Instance(bot)
instance.run()


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
    if (username == bot.username) return
    var args = message.split(' ')   
    instance.listen(args)
})

bot.on('kicked', console.log)
bot.on('error', console.log)