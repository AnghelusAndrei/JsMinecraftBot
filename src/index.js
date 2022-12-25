const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

class BotInstance{
    static bot;
    constructor(bot){
        this.bot = bot;
    }
    view(viewer){
        bot.once('spawn', () => {
          mineflayerViewer(bot, { port: 3007, firstPerson: true })
        })
    }
    hunt_single(user){
        if(bot.players[user] === undefined){return}
        const target = bot.players[user]
        bot.pvp.attack(target.entity)
    }
    hunt_multiple(instance, users){
        users.sort((a, b) => {
            return bot.players[a].entity.position.distanceSquared(bot.entity.position) > bot.players[b].entity.position.distanceSquared(bot.entity.position)
        })

        users.forEach(function (user, index) {
            instance.hunt_single(user)
        });
    }
}
const bot = mineflayer.createBot({
    host: 'localhost',
    username: 'bot245',
    port: 49347,
    version: "1.18"
})

const bot2 = mineflayer.createBot({
    host: 'localhost',
    username: 'bot246',
    port: 49347,
    version: "1.18"
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

const instance = new BotInstance(bot)
instance.view(mineflayerViewer)


bot.on('chat', (username, message) => {
  if (username === bot.username) return
  const args = message.split(' ');                                  
  switch(args[0]){                                                  
    case "hunt":
        if(args.length > 1){
            args.splice(0,1)
            instance.hunt_multiple(instance, args)
            break;
        }
        instance.hunt_single(username)
        break;
    default:
        return;
  }
})

bot.on('kicked', console.log)
bot.on('error', console.log)
