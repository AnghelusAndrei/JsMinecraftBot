

class Utils{

    constructor(bot){
        this.bot = bot;
        this.run();
    }

    run(){
        this.bot.on('move', (position) => {
            this.timeWhenMoved_ms = new Date();
        })
    }

    playerIsNear(username)
    {
        return this.bot.players[username].entity != null && this.bot.players[username].entity != undefined;
    }

    botIsStuck(){
        let currentTime_ms = new Date();

        if(currentTime_ms - this.timeWhenMoved_ms < 5000){
            return true;
        }

        if(currentTime_ms - this.timeWhenMoved_ms > 10000){
            return false;
        }

        if(this.bot.pathfinder.isMining()){
            return true;
        }
    }

}

module.exports = {
    Utils : Utils
}