
const Discord = require('discord.js');
const client = new Discord.Client();
// Extract the required classes from the discord.js module
const { MessageEmbed } = require('discord.js');
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', msg => {
    if (msg.author.username != 'Davinci') {
        let cmd = msg.content

        if (cmd == 'ping') {
            msg.reply('pong');
            const embed = new MessageEmbed()
                // Set the title of the field
                .setTitle('A slick little embed')
                // Set the color of the embed
                .setColor(0xff0000)
                // Set the main content of the embed
                .setDescription('Hello, this is a slick embed!');
            // Send the embed to the same channel as the message
            msg.channel.send(embed);
        }

        else if (cmd == 'hello') {
            msg.reply('Hiya!');
        }
        else if (cmd !== 'Huh?') {
            console.log(`${msg.username} says: ${msg.content}`)
            //  console.log('msg', msg)
            msg.reply('Huh?');
        }
        else {
            console.log('msg', msg)
        }
    }



})
// Log our bot in using the token from https://discord.com/developers/applications
client.login('NzU2MzI4MTEyNjA5ODIwNzk1.X2QPcQ.a-WZCpN1GzlIhUk0Gx1yhSlkW3s');