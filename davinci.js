require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
const revision = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim()
// Extract the required classes from the discord.js module
const { MessageEmbed } = require('discord.js');

const davinciVersion = '0.01b'

client.on('ready', () => {
    console.log(`Bot Logged in as ${client.user.tag}!`);
});

// bot commands
const pingReply = msg => {
    msg.reply('Pong!');
}

const helloReply = msg => {
    msg.reply('Hiya!');
}
const createGithubIssue = msg => {
    msg.reply(`Sorry, I cant do that yet....`);
}
const createRedmineIssue = msg => {
    msg.reply(`Sorry, I cant do that yet....`);
}

const subscribeToPublicRepo = msg => {
    // bb:intellifire/intellifire_front
}
const subscribeToPublicRSS = msg => {
    // bb:intellifire/intellifire_front
}

const subscribeToFrancoRepo = msg => {
    // bb:intellifire/intellifire_front
}
const helpUsage = msg => {

    let txt = `
    USAGE: !# <verb> <noun> <paramater string>
    EG: !# rerun psaas job_12345678

    To get this Help Screen use:
    !# help

    to get help with a command type:
    !# help <command>
    verbs and nouns are NOT case sensitive but the parmater string is.
    paramater string can contain many params separated by tilde (~)
    
    EG: !# pull hair left~right~out
    
    Currently available bot commands are:
`

    botCommands.forEach(cm => {
        let nounString = Object.keys(cm.nouns).filter(n => n !== 'default').join("||")
        txt += cm.name + "\n" + `!# ${cm.verb} ` + nounString + "\n"
    })


    var embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(`Davinci ${davinciVersion} (rev. ${revision}) Help!`)
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription(txt);
    // Send the embed to the same channel as the message
    msg.channel.send(embed);


}


const botCommands = [
    {
        name: 'Davinci Help',
        verb: 'help',
        nouns:
        {
            "default": helpUsage,
            "ping": helpUsage,
            // "hello": 'xxx'
        }


    },
    {
        name: 'Davinci Ping',
        verb: 'ping',
        nouns:
            { "default": pingReply }


    },
    {
        name: 'Davinci Hello',
        verb: 'hello',
        nouns:
            { "default": helloReply }


    },

    //Something like !# Issue [Granularity of Error Reporting] {"details": "Values must be >=0 and < 100"}

    {
        name: 'Create New Issue',
        verb: 'create_issue',
        nouns:
        {
            "github": createGithubIssue,
            "redmine": createRedmineIssue
        }


    },


    {
        name: 'Monitor something in channel',
        verb: 'monitor',
        nouns:
        {
            "public_repo": subscribeToPublicRepo,
            "public_rss": subscribeToPublicRSS,
            "franco_repo": subscribeToFrancoRepo,


        }


    },



]

const foo = msg => {
    // bb:intellifire/intellifire_front
}




const getBotCommandByVerb = verb => {
    let cmdObj = botCommands.filter(c => c.verb == verb)
    return cmdObj[0]
}
client.on('message', msg => {
    if (msg.author.username != 'Davinci') {
        let cmd = msg.content

        // if (cmd == 'ping') {
        //     msg.reply('pong');
        //     const embed = new MessageEmbed()
        //         // Set the title of the field
        //         .setTitle('A slick little embed')
        //         // Set the color of the embed
        //         .setColor(0xff0000)
        //         // Set the main content of the embed
        //         .setDescription('Hello, this is a slick embed!');
        //     // Send the embed to the same channel as the message
        //     msg.channel.send(embed);
        // }

        // else if (cmd == 'hello') {
        //     msg.reply('Hiya!');
        // }
        // else 
        if (cmd.startsWith('!#')) {

            // here we extract verb noun and param
            let parsedCommandArr = cmd.replace("!# ", '').split(" ")
            console.log('parsedCommandArr', parsedCommandArr)
            let verb = parsedCommandArr[0].toLowerCase()
            let noun = parsedCommandArr[1] ? parsedCommandArr[1].toLowerCase() : 'default'
            let param = parsedCommandArr[2]
            console.log('verb', verb)

            let commandObj = getBotCommandByVerb(verb)

            if (commandObj) {

                // {
                //     name: 'Create New Issue',
                //     verb: 'create_issue',
                //     nouns: [
                //          { default: createGithubIssue },
                //{ github: createGithubIssue },
                //         { redmine: createRedmineIssue }
                //     ]

                // },
                let func = commandObj.nouns[noun]
                if (typeof func == 'undefined') {
                    console.log(msg)
                    msg.reply(`Sorry, command "${verb}" does not have a subcommand called "${noun}"`);
                }
                else {

                    func(msg)
                }


                // console.log('func', typeof func)

            }
            else {

            }

            // switch (verb) {
            //     case 'help': {
            //         msg.reply(`Hi I am Davinci, Franco's New Discord Bot.
            //         USAGE: !# <verb> <noun> <paramater string>
            //         EG: !# rerun psaas job_12345678

            //         verbs and nouns are NOT case sensitive but the parmater string is.

            //         Currently avoa

            //         `);
            //     }
            //         break;
            //     case 'ghissue': {
            //         msg.reply('make issue on github');
            //     }
            //         break;
            //     default: {
            //         msg.reply('Ok, a real command? I dont have that logic yet...');
            //     }
            // }


        }
        else if (cmd !== 'Huh?') {
            console.log(`${msg.author.username} says: ${msg.content}`)
            // console.log('msg', msg)
            // msg.reply('FYI davinci is listenting to this conversation.');
        }
        else {
            console.log('msg', msg)
        }
    }



})

client.login(process.env.BOT_TOKEN);
