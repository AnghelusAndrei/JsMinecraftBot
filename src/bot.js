


class Bot {

    constructor(bot)
    {
        this.bot = bot;
        this.busy=false;
        this.targetPosition=null;
    }
    playerIsNear(username)
    {
        return this.bot.players[user].entity != null && this.bot.players[user].entity != undefined;
    }
    requestPosition(user){
        return this.targetPosition;
    }
    progressTo(user)
    {
        return new Promise((resolve, reject)=>{

            const follow = async ()=>{
                if(this.bot.players[user].entity == null || this.bot.players[user].entity == undefined || typeof this.bot.players[user].entity === 'undefined')
                {
                    // We are not near the player (more than 128 blocks away)
                    while(requestPosition(user) == null) 
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

        });
    }
    async travelNear(username)
    {
        while(!playerIsNear(username))
        {
            await progressTo(this.targetPositon)
        }
    }
    async travel(args)
    {
        console.log("Getting target position")
        do {
            await new Promise(r => setTimeout(r,500));
        }while(this.targetPosition==null);

        await travelNear(args[0])


    }

    async listen(args)
    {
        busy=true;
        const command = args[0];
        args.splice(0,1)
        switch(command)
        {
            case "travel":
                await travel(args)
                break;
            case "Teleported":
                if(args.length <= 4 || args[0] === instance.bot.username){break}

                args[2].slice(0, -1);
                args[3].slice(0, -1);
                args[4].slice(0, -1);
                console.log(parseInt(args[2]) + ' ' + parseInt(args[3]) + ' ' + parseInt(args[4]))
                var pos = new Vec3(parseInt(args[2]), parseInt(args[3]), parseInt(args[4]))
                instance.sendTargetPos(pos)
            default:
                busy=false;
        }
    }


}

module.exports = {
    Bot : Bot
};