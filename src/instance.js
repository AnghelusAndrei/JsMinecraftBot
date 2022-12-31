var Vec3 = require('vec3').Vec3;
const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')
const { pathfinder, Movements, goals: { GoalNear, GoalFollow } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin


//decision tree:

//inputs:
/*
1.distance to target
2.hunger
3.armor
4.how much dirt
5.how much food
6.target dimension
7.current dimension
8.iron
9.cobblestone
10.wood
11.tools type
*/

//decisions:
/*
1.approach
2.get dirt
3.get food
4.get wood
5.get stone
6.get iron
7.get diamonds
8.attack nearby monsters
9.make tools
*/


class Instance {

    constructor(bot)
    {
        this.bot = bot;
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
        var position
        switch(mode){
            case 'position':
                position = parameter

                while(this.bot.entity.position.distanceTo(position) > distance){
                    this.progressTo(position, distance)
        
                    await new Promise((resolve) => {this.bot.once('goal_reached', resolve);});
                }
                break;
            case 'player':
                var username = parameter
                position = await this.requestPosition(username)


                while(this.bot.entity.position.distanceTo(position) > distance || !this.playerIsNear(username)){
                    this.progressTo(position, distance)
    
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
        this.bot.setControlState('sprint', true);
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
        this.bot.setControlState('sprint', true);
        const goal = new GoalFollow(this.bot.players[username].entity, 2)
        this.bot.pathfinder.setGoal(goal, true)
    }
    async hunt(username){
        await this.travelNear(username, this.bot.pvp.viewDistance, 'player')

        this.bot.setControlState('sprint', true);
        this.bot.pvp.attack(this.bot.players[username].entity)

        await new Promise((resolve) => {this.bot.once('stoppedAttacking', resolve);});

        this.bot.chat('heheheha')
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
}

module.exports = {
    Instance : Instance
};
