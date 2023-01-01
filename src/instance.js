var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear, GoalFollow } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const deathEvent = require('mineflayer-death-event')
const { DEATH_ENTITY_TYPE_MOB, DEATH_ENTITY_TYPE_PLAYER } = require("mineflayer-death-event");




class Instance {

    constructor(bot, requester)
    {
        this.bot = bot;
        this.requester = requester;
        this.perturbation = '';

        this.target = {
            position : null,
            acquired : true,
            username : null
        }
    }
    view(mineflayerViewer){
        mineflayerViewer(this.bot, { port: 3007, firstPerson: true })
    }
    setMovements(Movements){
        this.defaultMove = Movements
        this.bot.setControlState('sprint', true);
    }
    playerIsNear(username)
    {
        return this.bot.players[username].entity != null && this.bot.players[username].entity != undefined;
    }
    perturbate(){
        this.bot.pvp.forceStop()
        this.bot.pathfinder.stop()
        this.bot.removeAllListeners('goal_reached')
        
        switch(this.perturbation){
            case 'stop':
                this.bot.chat('stopped');
                break;
            case 'achieved':
                this.target.acquired = true;
                this.bot.chat('heheheha');
            default:
                break;
        }
    }
    progressTo(position, distance)
    {
        var directionVector = new Vec3(
            position.x - this.bot.entity.position.x,
            position.y - this.bot.entity.position.y,
            position.z - this.bot.entity.position.z
        );
        directionVector = directionVector.normalize()
        directionVector = directionVector.scaled((this.bot.entity.position.distanceTo(position) > distance) ? (distance / 4) : (this.bot.entity.position.distanceTo(position) / 4));
        
        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.bot.entity.position.x + directionVector.x,
            this.bot.entity.position.y + directionVector.y,
            this.bot.entity.position.z + directionVector.z, 
        1))
    }
    async PerturbationStructure(method){
        const methodName = Object.keys({method})[0];
        await this.bot.removeAllListeners('perturbate');

        const promise = new Promise(async (resolve, reject) => {
            this.bot.once('perturbate', ()=>{
                reject('perturbated')
            })

            method();

        })

        return new Promise(async (resolve) => {
            await promise
                .then(result => {
                    console.log(methodName + " then result : " + result)
                })
                .catch(error => {
                    if(error == 'perturbated'){
                        console.log(methodName + " rejected catched : " + error)
                        this.perturbate();
                        resolve(false)
                        return;
                    }else{throw error;}
                });

            resolve(promise)
        })
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
        await this.travelNear(position, this.bot.pathfinder.viewDistance, 'position');

        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            position.x,
            position.y,
            position.z, 
        1))

        await new Promise((resolve) => {this.bot.once('goal_reached', resolve);});
    }
    async travelToPlayer(username)
    {
        this.target = {
            position : null,
            acquired : false,
            username : username
        }

        await this.travelNear(null, this.bot.pathfinder.viewDistance, 'target');

        this.bot.pathfinder.setMovements(this.defaultMove)
        const goal = new GoalFollow(this.bot.players[username].entity, 2)
        this.bot.pathfinder.setGoal(goal, true)
    }



    async hunt(username){
        this.target = {
            position : null,
            acquired : false,
            username : username,
        }

        await this.travelNear(null, this.bot.pvp.viewDistance, 'target');

        this.bot.pvp.attack(this.bot.players[username].entity)


        await new Promise((resolve) => {
            this.bot.on('stoppedAttacking', async ()=>{
                if(this.target.acquired == false){
                    await this.travelNear(null, this.bot.pvp.viewDistance, 'target');
                    this.bot.pvp.attack(this.bot.players[username].entity)
                }else{
                    resolve();
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
                this.PerturbationStructure(()=>{this.travelToPlayer(args[0])})
                break;
            case "hunt":
                this.PerturbationStructure(()=>{this.hunt(args[0])})
                break;
            case "stop":
                this.perturbation = 'stop';
                this.bot.emit('perturbate')
            default:
                break;
        }
    }
    async run(){
        this.bot.on('playerDeath', async (data)=>{
            let name = await this.requester.requestNameFromUuid(data.victim.id);
            if(name == this.target.username){
                this.perturbation = 'achieved';
                this.bot.emit('perturbate')
            }
        })

        this.bot.on('physicsTick', ()=>{

        })
    }
}

module.exports = {
    Instance : Instance
};
