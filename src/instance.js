var Vec3 = require('vec3').Vec3;
const { goals: { GoalNear, GoalFollow } } = require('mineflayer-pathfinder')
const { DEATH_ENTITY_TYPE_MOB, DEATH_ENTITY_TYPE_PLAYER } = require("mineflayer-death-event");




class Instance {

    constructor(bot, requester)
    {
        this.bot = bot;
        this.requester = requester;

        this.target = {
            position : null,
            acquired : true,
            username : null
        }

        this.perturbation = false
    }
    view(mineflayerViewer){
        mineflayerViewer(this.bot, { port: 3007, firstPerson: true })
    }
    setMovements(Movements){
        this.defaultMove = Movements
    }
    playerIsNear(username)
    {
        return this.bot.players[username].entity != null && this.bot.players[username].entity != undefined;
    }
    progressTo(position, distance)
    {
        var directionVector = new Vec3(
            position.x - this.bot.entity.position.x,
            position.y - this.bot.entity.position.y,
            position.z - this.bot.entity.position.z
        );
        directionVector = directionVector.normalize()
        directionVector = directionVector.scaled(distance)
        
        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.bot.entity.position.x + directionVector.x,
            this.bot.entity.position.y + directionVector.y,
            this.bot.entity.position.z + directionVector.z, 
        1))
    }
    async travelNear(parameter, distance, mode)
    {
        switch(mode){
            case 'position':
                var position = parameter

                while(this.bot.entity.position.distanceTo(position) > distance){
                    this.progressTo(position, distance)
        
                    await new Promise((resolve) => {this.bot.once('goal_reached', resolve);});
                }
                break;
            case 'target':

                this.target.position = await this.requester.requestPosition(this.target.username)

                while(this.bot.entity.position.distanceTo(this.target.position) > distance || !this.playerIsNear(this.target.username)){
                    this.progressTo(this.target.position, distance)
    
                    await new Promise((resolve) => {this.bot.once('goal_reached', resolve);});

                    this.target.position = await this.requester.requestPosition(this.target.username)
                }
                break;
            default:
                break;
        }
    }
    async travelToPosition(position)
    {
        await this.travelNear(position, this.bot.pathfinder.viewDistance, 'position')

        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.setControlState('sprint', true);
        this.bot.pathfinder.setGoal(new GoalNear(
            position.x,
            position.y,
            position.z, 
        1))
    }
    async travelToPlayer(username)
    {
        this.target = {
            position : null,
            acquired : false,
            username : username
        }

        await this.travelNear(username, this.bot.pathfinder.viewDistance, 'target')

        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.setControlState('sprint', true);
        const goal = new GoalFollow(this.bot.players[username].entity, 2)
        this.bot.pathfinder.setGoal(goal, true)
    }



    async hunt(username){
        this.target = {
            position : null,
            acquired : false,
            username : username,
        }

        await this.travelNear(username, this.bot.pvp.viewDistance, 'target')

        this.bot.setControlState('sprint', true);
        this.bot.pvp.attack(this.bot.players[username].entity)


        await new Promise((resolve) => {
            this.bot.once('stoppedAttacking', ()=>{
                if(this.target.acquired == true){
                    this.bot.chat('heheheha')
                }else{
                    this.hunt(username)
                }
            });
        });
    }

    async listen(args)
    {
        const command = args[0];
        args.splice(0,1)
        switch(command)
        {
            case "travel":
                this.travelToPlayer(args[0])
                break;
            case "hunt":
                this.hunt(args[0])
                break;
            default:
                break;
        }
    }
    async run(){
        this.bot.on('playerDeath', (data)=>{
            console.log(data)


        })

        this.bot.on('physicsTick', ()=>{

        })
    }
}

module.exports = {
    Instance : Instance
};
