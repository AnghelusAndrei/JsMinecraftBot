var Vec3 = require('vec3').Vec3;

class Listener{
    async listen(instance, args){


        if(args.length < 2){
            console.log("less than 2 args given")
            return
        }
        var command = args[0]
        args.splice(0,1)

        switch(command){                                                  
            case "hunt":
                instance.huntMultiple(args)
                break
            case "travel":
                console.log(instance.followTarget(args[0]))
                break
            case "Teleported":
                if(args.length <= 4 || args[0] === instance.bot.username){break}

                args[2].slice(0, -1);
                args[3].slice(0, -1);
                args[4].slice(0, -1);
                console.log(parseInt(args[2]) + ' ' + parseInt(args[3]) + ' ' + parseInt(args[4]))
                var pos = new Vec3(parseInt(args[2]), parseInt(args[3]), parseInt(args[4]))
                instance.sendTargetPos(pos)
                break
            default:
                return;
        }
    }
}

module.exports = {
    Listener : Listener
}