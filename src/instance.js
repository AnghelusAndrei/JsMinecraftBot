var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin


class Instance {

    constructor(bot)
    {
        this.bot = bot;
        this.active=false;
    }
    playerIsNear(username)
    {
        return this.bot.players[username].entity != null && this.bot.players[username].entity != undefined;
    }
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async requestPosition(username){
        var targetPosition = null;
        //this.bot.chat('/execute as ' + username + ' at ' + username + ' run tp @s ~ ~ ~');
        console.log('waiting for position of ' + username)

        var bot = this.bot;
        var r;

        function resolveReadPosition(receivedUsername, receivedMessage){
            var args = receivedMessage.split(' ') 
            var command = args[0]
            args.splice(0,1)
            if (command == 'Teleported') {
                if(!(args.length <= 4 || args[0] === bot.username)){
                    args[2].slice(0, -1);
                    args[3].slice(0, -1);
                    args[4].slice(0, -1);
                    console.log(parseInt(args[2]) + ' ' + parseInt(args[3]) + ' ' + parseInt(args[4]))
                    targetPosition = new Vec3(parseInt(args[2]), parseInt(args[3]), parseInt(args[4]))

                    r();
                    bot.removeListener('chat', resolveReadPosition);
                }
            }
        }

        await new Promise((resolve) => {
            r = resolve;
            this.bot.on('chat', resolveReadPosition);
        });

        return targetPosition;
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
        directionVector = directionVector.scaled(this.bot.pvp.viewDistance/2)
        
        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.bot.entity.position.x + directionVector.x,
            this.bot.entity.position.y + directionVector.y,
            this.bot.entity.position.z + directionVector.z, 
        1))
    }
    async travelNear(parameter, distance, mode)
    {
        var position
        switch(mode){
            case 'position':
                position = parameter

                while(this.bot.entity.position.distanceTo(position) > distance){
                    this.progressTo(position)
        
                    await new Promise((resolve) => {this.bot.once('goal_reached', resolve);});
                }
                break;
            case 'player':
                position = await this.requestPosition(username)


                while(this.bot.entity.position.distanceTo(position) > distance || !this.playerIsNear(username)){
                    this.progressTo(position)
    
                    await new Promise((resolve) => {this.bot.once('goal_reached', resolve);});
                    position = await this.requestPosition(username)
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
        this.bot.pathfinder.setGoal(new GoalNear(
            position.x,
            position.y,
            position.z, 
        1))
    }
    async travelToPlayer(username)
    {
        await this.travelNear(username, this.bot.pathfinder.viewDistance, 'player')

        this.bot.pathfinder.setMovements(this.defaultMove)
        this.bot.pathfinder.setGoal(new GoalNear(
            this.bot.players[username].entity.position.x,
            this.bot.players[username].entity.position.y,
            this.bot.players[username].entity.position.z, 
        1))
    }
    async hunt(username){
        await this.travelNear(username, this.bot.pvp.viewDistance, 'player')

        this.bot.pvp.attack(this.bot.players[username].entity)

        await new Promise((resolve) => {this.bot.once('stoppedAttacking', resolve);});

        this.bot.chat('heheheha')
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
                this.travelToPlayer(args)
                break;
            case "hunt":
                this.huntMultiple(args)
                break;
            default:
                this.active = false;
                break;
        }
    }
}

module.exports = {
    Instance : Instance
};
