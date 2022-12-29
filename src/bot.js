var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin


class Bot {

    constructor(bot)
    {
        this.bot = bot;
        this.active=false;
        this.targetPosition=null;
    }
    playerIsNear(username)
    {
        return this.bot.players[username].entity != null && this.bot.players[username].entity != undefined;
    }
    requestPosition(username){
        return this.targetPosition;
    }
    view(mineflayerViewer){
        mineflayerViewer(this.bot, { port: 3007, firstPerson: true })
    }
    setMovements(Movements){
        this.defaultMove = Movements
    }
    progressTo(position)
    {
        var directionVector = new Vec3(
            position.x - this.bot.entity.position.x,
            position.y - this.bot.entity.position.y,
            position.z - this.bot.entity.position.z
        );
        directionVector = directionVector.normalize()
        directionVector = directionVector.scaled(this.bot.pvp.viewDistance/4)
        
        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.bot.entity.position.x + directionVector.x,
            this.bot.entity.position.y + directionVector.y,
            this.bot.entity.position.z + directionVector.z, 
        1))
    }
    async waitForGoalReached(username){//chatGpt > albert;
        const reached = new Promise((resolve) => {
          this.bot.on("goal_reached", resolve);
        });
      
        if (!this.playerIsNear(username)) {
            await reached;
            console.log("progressing");
            this.progressTo(this.requestPosition(username));
            await this.waitForGoalReached(username);
        } else {
            console.log("in proximity");
        }
    }
    async travelNear(username)
    {
        do{
            await new Promise(r => setTimeout(r,500));
        }while(this.requestPosition(username)==null);

        if(!this.playerIsNear(username)){
            console.log('not in proximity (getting closer)')
            this.progressTo(this.requestPosition(username))
        }

        //await this.waitForGoalReached(username);
        this.bot.on("goal_reached",()=>{
            if(!this.playerIsNear(username)){
                console.log('case 1')
                this.progressTo(this.requestPosition(username))
            }
            else{
                //remove event listener
                console.log('case 2')
                this.bot.removeAllListeners("goal_reached");
                return;
            }
        });
    }
    async travel(username)
    {
        await this.travelNear(username)

        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.bot.players[username].entity.position.x,
            this.bot.players[username].entity.position.y,
            this.bot.players[username].entity.position.z, 
        1))
    }
    async hunt(username){
        await this.travelNear(username)

        const target = this.bot.players[username]
        this.bot.pvp.attack(target.entity)
        this.bot.on('stoppedAttacking', () => {
            this.bot.chat("heheheha") //heheheha
            //remove event listener
            this.bot.removeAllListeners("stoppedAttacking");
            return;
        })
    }
    async huntMultiple(users){
        users.sort((a, b) => {
            if(this.bot.players[a] === undefined || this.bot.players[b] === undefined)return 1;
            return this.bot.players[a].entity.position.distanceSquared(this.bot.entity.position) - this.bot.players[b].entity.position.distanceSquared(this.bot.entity.position)
        })

        for(var i = 0; i < users.length; i++){
            await this.hunt(users[i])
        }
    }

    async listen(args)
    {
        this.active = true;
        const command = args[0];
        args.splice(0,1)
        switch(command)
        {
            case "travel":
                this.travel(args)
                break;
            case "hunt":
                this.huntMultiple(args)
                break;
            case "Teleported":
                if(args.length <= 4 || args[0] === instance.bot.username){break}

                args[2].slice(0, -1);
                args[3].slice(0, -1);
                args[4].slice(0, -1);
                console.log(parseInt(args[2]) + ' ' + parseInt(args[3]) + ' ' + parseInt(args[4]))
                this.targetPosition = new Vec3(parseInt(args[2]), parseInt(args[3]), parseInt(args[4]))
            default:
                this.active = false;
                break;
        }
    }


}

module.exports = {
    Bot : Bot
};