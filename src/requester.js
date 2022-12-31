var Vec3 = require('vec3').Vec3;

class DataRequester{
    constructor(bot){
        this.bot = bot
    }

    async requestPosition(username){
        var targetPosition = null;
        //this.bot.chat('/execute as ' + username + ' at ' + username + ' run tp @s ~ ~ ~');
        //console.log('waiting for position of ' + username)

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
                    //console.log(parseInt(args[2]) + ' ' + parseInt(args[3]) + ' ' + parseInt(args[4]))
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

    async requestNameFromUuid(uuid){

    }

}

module.exports = {
    DataRequester : DataRequester
}