'use strict';

import { createRequire } from 'module';
import { resolve } from 'path';
const require = createRequire(import.meta.url);
var childProcess = require('child_process');
const Discord = require('discord.js-v11');
const readline = require('readline');
var terminate = require('terminate');
var fs = require("fs");
var startPhase = 0;
var channel;
var process;
var author;
var playing = false;

const intents = new Discord.Intents([
    Discord.Intents.NON_PRIVILEGED, 
    "GUILD_MEMBERS", 
]);

const client = new Discord.Client({
    autorun: true,
    ws:{intents}
});


client.on('ready', () => {
    client.user.setStatus("online");
    client.user.setActivity("Owner fix my code", { type: "WATCHING"})
    const servers = client.guilds.cache.size;
    console.log(`Discord Client is now online and operating in ${servers} servers`);
})

client.on('message', async message => {
    if(message.author.bot){return}
    if(message.author.id == client.user.id){return}
    console.log(message.author.username + ': ' + message.content);
    channel = message.channel;
    var string = message.content.split(" ");
    var strArr = [];
    for(var i = 0; i < string.length; i++){
        strArr.push(string[i]);
    }

    if(!fs.readFileSync("./users.txt").toString().includes(message.author.username)){
        return
    }
    
    
    if(strArr[0] == '!join'){
        if(startPhase == 0 || startPhase == 2 || startPhase == 4){
            startPhase = 1;
            if(process){
                terminate(process.pid, function(err, done){
                    if(err) {
                        console.log(err);
                    }
                });
            }
            message.channel.send(new Discord.MessageEmbed() 
                        .addField("Bot245", `Please specify the IP , Port, Version, Login Status(boolean) in this order`))
    
            author = message.author;
        }
    }else if(strArr[0] == '!invade'){
        if(startPhase == 0 || startPhase == 2 || startPhase == 4){
            startPhase = 3;
            if(process){
                terminate(process.pid, function(err, done){
                    if(err) {
                        console.log(err);
                    }
                });
            }
            message.channel.send(new Discord.MessageEmbed() 
                        .addField("Bot245", `Please specify the IP , Port, Version, Login Status(boolean) in this order`))
    
            author = message.author;
        }
    }else if(strArr[0] == '!leave'){
        if(startPhase == 2 || startPhase == 4){
            startPhase = 0;
            if(process){
                terminate(process.pid, function(err, done){
                    if(err) {
                        console.log(err);
                    }
                });
            }
            message.channel.send(new Discord.MessageEmbed() 
                        .addField("Bot245", `Bot245 has left the server`))
        }else{
            message.channel.send(new Discord.MessageEmbed() 
                        .addField("Bot245", `Not in a server`))
        }
    }else if(strArr[0] == '!battle'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'battle'`))
    }else if(strArr[0] == '!message'){
        var sendString = ''
        for(var i = 0; i<strArr.length-1; i++){
            sendString = sendString+strArr[i+1]+' ';
        }

        const user = client.users.fetch("687964704370720798").catch(() => null);

    }else if(strArr[0] == '!play'){

        playing = true;

        
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `playing ${"..."}`))


    }else if(strArr[0] == '!help'){
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Commands:", `!battle !help !join !leave !invade !follow !jp !fight !mobhunt !manhunt !run !lag`))
    }else if(strArr[0] == '!follow'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'follow'`))
    }else if(strArr[0] == '!fight'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'fight'`))
    }else if(strArr[0] == '!collect'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'collect'`))
    }else if(strArr[0] == '!mobhunt'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'mobhunt'`))
    }else if(strArr[0] == '!jp'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'join party'`))
    }else if(strArr[0] == '!manhunt'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `initializing 'manhunt'`))
    }else if(strArr[0] == '!stop'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `stopping`))
    }else if(strArr[0] == '!run'){
        fs.writeFile('./data.txt', message.content, () => {});
        message.channel.send(new Discord.MessageEmbed() 
                    .addField("Bot245", `running`))
    }else{
        if(startPhase == 1 && message.author == author){
            startPhase = 2;
            message.channel.send(new Discord.MessageEmbed() 
                        .addField("Bot245", `Joining ${strArr[0]}`))
            
    
            fs.writeFile('./data.txt', message.content, (err) => {

            });
    
    
            runScript('./bot.js', function (err) {
                console.log('Running ./bot.js');
            });
        }else if(startPhase == 3 && message.author == author){
            startPhase = 4;
            message.channel.send(new Discord.MessageEmbed() 
                        .addField("Invade", `Joining ${strArr[0]}`))
            
    
            fs.writeFile('./data.txt', message.content, (err) => {

            });
    
    
            runScript('./invade.js', function (err) {
                console.log('Running ./invade.js');
            });
        }
    }
})


fs.watch('./data.txt', (eventType, filename) => {

})


function runScript(scriptPath, callback) {

    var invoked = false;

    process = childProcess.fork(scriptPath);

    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
    });
}

client.login('NzcwMTk3NTk3MTcyMTM4MDA0.X5aEaA.PT1XVBVegKNAAxzoIgBuBJgSjWA');