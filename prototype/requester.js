var Vec3 = require('vec3').Vec3;

class DataRequester{
    constructor(bot){
        this.bot = bot
    }

    async requestPosition(username){
        var targetPosition = null;
        this.bot.chat('/request_position ' + username)

        var bot = this.bot;
        var r; 

        function resolveReadPosition(receivedUsername, receivedMessage){
            var args = receivedMessage.split(' ') 
            if(args.length == 3 && receivedUsername == 'requested_position'){
                targetPosition = new Vec3(parseInt(args[0]), parseInt(args[1]), parseInt(args[2]))

                r();
                bot.removeListener('chat', resolveReadPosition);
            }
        }

        await new Promise((resolve) => {
            r = resolve;
            this.bot.on('chat', resolveReadPosition);
        });

        return targetPosition;
    }

    async requestNameFromUuid(uuid){
        var targetName = null;
        this.bot.chat('/request_name ' + uuid)

        var bot = this.bot;
        var r; 

        function resolveReadName(receivedUsername, receivedMessage){
            var args = receivedMessage.split(' ') 
            if(args.length == 1 && receivedUsername == 'requested_name'){
                targetName = args[0]

                r();
                bot.removeListener('chat', resolveReadName);
            }
        }

        await new Promise((resolve) => {
            r = resolve;
            this.bot.on('chat', resolveReadName);
        });

        return targetName;
    }

    async requestHeight(x,z){
        var targetHeight = null;
        this.bot.chat('/request_height ' + x + ' ' + z)

        var bot = this.bot;
        var r; 

        function resolveReadHeight(receivedUsername, receivedMessage){
            var args = receivedMessage.split(' ') 
            if(args.length == 1 && receivedUsername == 'requested_height'){
                targetHeight = args[0]

                r();
                bot.removeListener('chat', resolveReadHeight);
            }
        }

        await new Promise((resolve) => {
            r = resolve;
            this.bot.on('chat', resolveReadHeight);
        });

        return targetHeight;
    }

}

module.exports = {
    DataRequester : DataRequester
}