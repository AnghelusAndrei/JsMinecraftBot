var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin

class Instance{
    static bot
    static defaultMove
    static targetPos

    constructor(bot){
        this.bot = bot
    }
    view(mineflayerViewer){
        mineflayerViewer(this.bot, { port: 3007, firstPerson: true })
    }

    //solutie pt moment(se va schimba)
    sendTargetPos(pos){
        this.targetPos = pos
    }

    setMovements(Movements){
        this.defaultMove = Movements
    }

    requestTargetPosition(){
        //solutie pt moment(se va schimba)
        return this.targetPos
    }


    async travelToPosition(user)
    {
        return new Promise((resolve, reject)=>{

            const follow = async ()=>{
                if(this.bot.players[user].entity == null || this.bot.players[user].entity == undefined || typeof this.bot.players[user].entity === 'undefined')
                {
                    // We are not near the player (more than 128 blocks away)
                    while(typeof this.targetPos === 'undefined') 
                    {
                        await new Promise(r => setTimeout(r, 500));
                    }
                    var position = this.targetPos;
                    directionVector = directionVector.normalize()
                    directionVector = directionVector.scaled(this.bot.pvp.viewDistance/4)
                    
                    this.bot.pathfinder.setMovements(this.defaultMove)
                    this.bot.pathfinder.setGoal(new GoalNear(
                        this.bot.entity.position.x + directionVector.x,
                        this.bot.entity.position.y + directionVector.y,
                        this.bot.entity.position.z + directionVector.z, 
                    1))


                    
                }
            };
            while(!(this.bot.players[user].entity == null || this.bot.players[user].entity == undefined || typeof this.bot.players[user].entity === 'undefined')) {
                if(typeof this.targetPos === 'undefined')return false
                var position = this.requestTargetPosition()
        
                var directionVector = this.bot.entity.position
                directionVector = directionVector.normalize()
                directionVector = directionVector.scaled(this.bot.pvp.viewDistance/4)
            
                this.bot.pathfinder.setMovements(this.defaultMove)
                this.bot.pathfinder.setGoal(new GoalNear(
                    this.bot.entity.position.x + directionVector.x,
                    this.bot.entity.position.y + directionVector.y,
                    this.bot.entity.position.z + directionVector.z, 
                1))
                
                this.bot.on("goal_reached", () => {
                    console.log('traveled')
                    this.travelToPosition(user)
                })
            }
        })
    }
    followTarget(user){
        return new Promise((resolve, reject)=>{
            if(user === this.bot.username || this.bot.players[user] === undefined){return false}

            console.log('started following ' + user)

            await this.travelToPosition(user)

            console.log(user + ' in reach')

            this.bot.pathfinder.setMovements(this.defaultMove)
            this.bot.pathfinder.setGoal(new GoalNear(
                this.bot.players[user].entity.position.x,
                this.bot.players[user].entity.position.y,
                this.bot.players[user].entity.position.z, 
            1))
        });
    }
    async huntSingle(user){
        if(user === this.bot.username || this.bot.players[user] === undefined){return false}

        console.log('started following ' + user)

        await this.travelToPosition(user)

        console.log(user + ' in reach')

        const target = this.bot.players[user]
        this.bot.pvp.attack(target.entity)
        this.bot.on('stoppedAttacking', () => {
            this.bot.chat("heheheha") //heheheha
            return true
        })
    }
    huntMultiple(users){
        var i = 0

        users.sort((a, b) => {
            if(this.bot.players[a] === undefined || this.bot.players[b] === undefined)return 1;
            return this.bot.players[a].entity.position.distanceSquared(this.bot.entity.position) - this.bot.players[b].entity.position.distanceSquared(this.bot.entity.position)
        })

        console.log(this.huntSingle(users[0]))

        this.bot.on('stoppedAttacking', () => {
            i++
            while(!this.huntSingle(users[i])){i++}
        })
    }
}


module.exports = {
    Instance : Instance
}