const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

class BotInstance{
    static bot

    constructor(bot){
        this.bot = bot
    }
    view(){
        bot.once('spawn', () => {
          mineflayerViewer(bot, { port: 3007, firstPerson: true })
        })
    }
    travelDistance(user){
        while(bot.players[user].entity.position.distanceTo(bot.entity.position) > bot.pvp.viewDistance){
            var targetPosition = new Vec3()
        }
    }
    huntSingle(instance, user){
        if(bot.players[user] === undefined || user === bot.username){return false}

        instance.travelDistance(user)

        const target = bot.players[user]
        bot.pvp.attack(target.entity)
        bot.on('stoppedAttacking', () => {
            bot.chat("heheheha") //heheheha
            return true
        })
    }
    huntMultiple(instance, users){
        var i = 0

        users.sort((a, b) => {
            if(bot.players[a] === undefined || bot.players[b] === undefined)return 1;
            return bot.players[a].entity.position.distanceSquared(bot.entity.position) - bot.players[b].entity.position.distanceSquared(bot.entity.position)
        })

        instance.huntSingle(users[0])

        bot.on('stoppedAttacking', () => {
            i++
            while(!instance.huntSingle(users[i])){i++}
        })
    }
}
const bot = mineflayer.createBot({
    host: 'localhost',
    username: 'yeetlol',
    port: 49258,
    version: "1.18"
})

const bot2 = mineflayer.createBot({
    host: 'localhost',
    username: 'bot246',
    port: 49258,
    version: "1.18"
})

const bot3 = mineflayer.createBot({
    host: 'localhost',
    username: 'bot247',
    port: 49258,
    version: "1.18"
})

bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)

const instance = new BotInstance(bot)
instance.view()


bot.on('chat', (username, message) => {
  if (username === bot.username) return
  var args = message.split(' ')                                  
  switch(args[0]){                                                  
    case "hunt":
        if(args.length > 1){
            args.splice(0,1)
            instance.huntMultiple(instance, args)
            break
        }
        instance.huntSingle(username)
        break
    default:
        return;
  }
})

bot.on('kicked', console.log)
bot.on('error', console.log)
