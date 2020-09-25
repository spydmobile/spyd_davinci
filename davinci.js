require('dotenv').config()
const Discord = require('discord.js');
const bot = new Discord.Client();
const jsonFile = require('jsonfile');
const {
    getRepoTracking,
    saveRepoTracking,

} = require('./storage')
const { Bitbucket } = require('bitbucket')
const { Octokit } = require("@octokit/rest");
const { createTokenAuth } = require("@octokit/auth-token");
const github = new Octokit();
const githubToken = process.env.GH_TOKEN
const githubAuth = createTokenAuth(githubToken);
var cron = require('node-cron');
const clientOptions = {
    baseUrl: 'https://api.bitbucket.org/2.0',
    request: {
        timeout: 10,
    },
}

const bitbucketPublic = new Bitbucket(clientOptions)

const francoOptions = {
    auth: {
        username: process.env.FRANCO_USERNAME,
        password: process.env.FRANCO_PASS,
    },
}
const bitbucketFranco = new Bitbucket(francoOptions)

// bitbucketFranco.repositories
//     .listGlobal()
//     .then(({ data }) => console.log(data.values))
//     .catch((err) => console.error(err))

const revision = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim()
// Extract the required classes from the discord.js module
const { MessageEmbed } = require('discord.js');

const davinciVersion = '0.01b'

bot.on('ready', () => {
    console.log(`Bot Logged in as ${bot.user.tag}!`);
});

// bot command methods called by actual commands
const pingReply = msg => {
    msg.reply('Pong!');
}
const saveSubscription = sub => {
    return new Promise((resolve, reject) => {

    });
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

const subscribeToFrancoRepo = async msg => {
    let cmd = msg.content
    console.log("msg", msg)
    let channelId = msg.channel.id
    let userId = msg.author.id

    let parsedCommandArr = cmd.replace("!# ", '').split(" ")
    // console.log('parsedCommandArr', parsedCommandArr)
    let verb = parsedCommandArr[0].toLowerCase()
    let noun = parsedCommandArr[1] ? parsedCommandArr[1].toLowerCase() : 'default'
    let param = parsedCommandArr[2]
    console.log('verb', verb)
    console.log('noun', noun)
    console.log('param', param)

    let workspace = param.split(":")[1].split("/")[0]
    let repoSlug = param.split(":")[1].split("/")[1]
    let host = param.split(":")[0]


    if (host == "bb") {
        // bb:intellifire/intellifire_front
        bitbucketFranco.commits.list({
            //  exclude, 
            //   include, 
            "repo_slug": repoSlug,
            "workspace": workspace,
            // "page", 
            "pagelen": 1,
            // q, 
            // sort, 
            // fields 
        })
            .then(({ data, headers }) => {
                console.log(data)
                console.log(data.values[0].summary)
                console.log(data.values[0].links)
                let hash = data.values[0].hash
                let date = data.values[0].date
                let commitMsg = data.values[0].message
                let type = data.values[0].type
                let link = data.values[0].links.html.href
                let logos = {
                    "bb": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSe3ymaUPtB2AjTs05Gq1BHonnm5XIY6vSBkw&usqp=CAU",
                    "gh": "https://miro.medium.com/max/325/1*ekOYsVAtOKFeeJyhv5NVhA.jpeg"
                }
                var embed = new MessageEmbed()
                    // Set the title of the field

                    .setTitle(`${type}: ${commitMsg}`)
                    // Set the color of the embed
                    .setColor(0x0000ff)
                    // Set the main content of the embed
                    .setImage(logos[host])
                    .setDescription("This is a bitbucket commit.")
                    .addField('Commit Hash', hash, true)
                    .addField('Commit Date', date, true)
                    .addField('Commit URL', link, false)
                    .setTimestamp()
                    .setFooter(`Davinci ${davinciVersion} (rev. ${revision})` + ' - Powered by Discord.js', 'https://i.imgur.com/wSTFkRM.png');



                // Send the embed to the same channel as the message
                msg.channel.send(embed);

                let sub = {
                    subId: [channelId, host, workspace, repoSlug].join("-"),
                    channelId: channelId,
                    userId: userId,
                    host: host,
                    workspace: workspace,
                    repoSlug: repoSlug,
                    hash: hash

                }

                saveRepoTracking(sub)
                    .then(e => {
                        console.log('saved sub')
                    })
                    .catch(err => {
                        console.log(err)
                    })

            })
    }
    else {
        let owner = workspace
        let repo = repoSlug
        const ghAuthentication = await githubAuth();
        github.repos.listCommits({
            owner,
            repo,
        })
            .then(data => {
                console.log(data)
                console.log(data.data[0].commit)

                let hash = data.data[0].sha
                let date = data.data[0].commit.committer.date
                let commitMsg = data.data[0].commit.message
                let type = 'commit'
                let link = data.data[0].commit.url
                let logos = {
                    "bb": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSe3ymaUPtB2AjTs05Gq1BHonnm5XIY6vSBkw&usqp=CAU",
                    "gh": "https://miro.medium.com/max/325/1*ekOYsVAtOKFeeJyhv5NVhA.jpeg"
                }
                var embed = new MessageEmbed()
                    // Set the title of the field

                    .setTitle(`${type}: ${commitMsg}`)
                    // Set the color of the embed
                    .setColor(0x0000ff)
                    // Set the main content of the embed
                    .setImage(logos[host])
                    .setDescription("This is a github commit.")
                    .addField('Commit Hash', hash, true)
                    .addField('Commit Date', date, true)
                    .addField('Commit URL', link, false)
                    .setTimestamp()
                    .setFooter(`Davinci ${davinciVersion} (rev. ${revision})` + ' - Powered by Discord.js', 'https://i.imgur.com/wSTFkRM.png');



                // Send the embed to the same channel as the message
                msg.channel.send(embed);

                let sub = {
                    subId: [channelId, host, workspace, repoSlug].join("-"),
                    channelId: channelId,
                    userId: userId,
                    host: host,
                    workspace: workspace,
                    repoSlug: repoSlug,
                    hash: hash

                }

                saveRepoTracking(sub)
                    .then(e => {
                        console.log('saved sub')
                    })
                    .catch(err => {
                        console.log(err)
                    })

            })
    }


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
        let nounString = Object.keys(cm.nouns).filter(n => n !== 'default').join(" -OR- ")
        txt += "**" + cm.name + "**\n" + `!# ${cm.verb} ` + nounString + "\n"
    })


    var embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(`Davinci ${davinciVersion} (rev. ${revision}) Help!`)
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription(txt)
        .setTimestamp()
        .setFooter('Powered by Discord.js', 'https://i.imgur.com/wSTFkRM.png');



    // Send the embed to the same channel as the message
    msg.channel.send(embed);


}


const helpMonitor = msg => {

    let txt = `
    USAGE: !# monitor monitor_type code:<workspace>/<project>
    Examples: 
    !# monitor public_repo gh:spydmobile/spyd_davinci
    !# monitor public_rss http://rss.cnn.com/rss/cnn_topstories.rss
    !# monitor franco_repo bb:intellifire/intellifire_lrgs_collector


    intellifire/intellifire_lrgs_collector
    Where monitor_type is one of:
    
    "public_repo" Either a BitBucket or Github public repo.
    "public_rss" a public URL for an RSS Feed.
    "franco_repo" A Private BitBucket or Github repo on one of Francos Accounts.

    Where the code is either bb for BitBucket or gh for Github

    This will cause Davinci to pass along any changes to these feeds to the channel you requested monitoring from.
    `

    var embed = new MessageEmbed()
        // Set the title of the field
        .setTitle(`Davinci ${davinciVersion} (rev. ${revision}) Help!`)
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription(txt)
        .setTimestamp()
        .setFooter('Powered by Discord.js', 'https://i.imgur.com/wSTFkRM.png');



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
            "monitor": helpMonitor,
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

const sendChannelMessage = (channelId, messageText) => {
    return new Promise((resolve, reject) => {
        client.channels.get(channelId).send(messageText)
            .then(
                resolve()
            )
    });
}


const getBotCommandByVerb = verb => {
    let cmdObj = botCommands.filter(c => c.verb == verb)
    return cmdObj[0]
}
const pullSubData = sub => {
    return new Promise(async (resolve, reject) => {
        {


            let channelId = sub.channelId
            let workspace = sub.workspace
            let repoSlug = sub.repoSlug
            let host = sub.host


            if (host == "bb") {
                // bb:intellifire/intellifire_front
                bitbucketFranco.commits.list({
                    //  exclude, 
                    //   include, 
                    "repo_slug": repoSlug,
                    "workspace": workspace,
                    // "page", 
                    "pagelen": 1,
                    // q, 
                    // sort, 
                    // fields 
                })
                    .then(({ data, headers }) => {
                        console.log('bbdata', data)
                        resolve(data)
                    })
            }
            else {
                let owner = workspace
                let repo = repoSlug
                const ghAuthentication = await githubAuth();
                github.repos.listCommits({
                    owner,
                    repo,
                })
                    .then(data => {
                        console.log('ghdata', data)
                        resolve(data)


                    })
            }


        }
    });
}
const checkSubForUpdate = sub => {
    return new Promise(async (resolve, reject) => {
        //load sub data
        let data = await pullSubData(sub)
        //compare commits
        if (sub.host == 'bb') {
            //BB
            // if (sub.hash == data.)
        }
        else {
            //GH
        }
        // if commits same, resolve false

        // else resolve updated commit.
    });
}
const refreshRepoSubs = () => {
    return new Promise(async (resolve, reject) => {
        console.log("Checking repo subs...")
        // get all subs
        let subs = await getRepoTracking()
        //iterate each sub
        let updates = subs.filter(sub => {
            //check if commit is same, if it is ignore
            checkSubForUpdate(sub)
                .then(up => {
                    if (!up) {
                        let text = `no update for ${sub.subId}`
                        // post a debug to the channel.
                        sendChannelMessage(sub.channelId, text)
                    }
                    else {
                        //else post an embed of the new commit in the channel
                    }
                })




        })

    });

}
const refreshDavinciStatus = () => {
    return new Promise((resolve, reject) => {
        bot.user.setPresence({
            activity: {
                name: 'Franco trying to build me! LOL',
                details: 'I wanna be a cowboy',
                type: "WATCHING",
                emoji: ":thumb:",
                timestamps: {
                    start: new Date()
                },
                url: "https://spyd.com"
            },
            status: 'online' //idle invisible dnd online
        })
            .then(e => {
                console.log(e)
            })
    });
}
bot.on('message', msg => {
    if (msg.author.username != 'Davinci') {
        let cmd = msg.content

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
        else if (msg.channel.type == 'dm') {
            msg.reply('You do realize you are Direct Messaging an AI Bot? Try using my command feature, use ```!# help``` to get started.');
        }
        else if (cmd !== 'Huh?') {
            console.log(`${msg.author.username} says: ${msg.content}`)
            console.log('msg.channel.id', msg.channel.id)
            console.log('msg.channel.name', msg.channel.name)
            //debugMessageToChannel
            console.log('msg', msg)
            // msg.reply('FYI davinci is listenting to this conversation.');
        }
        else {
            console.log('msg', msg)
        }
    }
})

bot.login(process.env.BOT_TOKEN);
// bitbucketFranco.repositories
//     .listGlobal()
//     .then(({ data }) => console.log(data.values))
//     .catch((err) => console.error(err))

// bitbucketFranco.commits.list({
//     //  exclude, 
//     //   include, 
//     "repo_slug": 'intellifire_front',
//     "workspace": 'intellifire',
//     // "page", 
//     "pagelen": 1,
//     // q, 
//     // sort, 
//     // fields 
// })
//     .then(({ data, headers }) => {
//         console.log(data)
//         console.log(data.values[0].summary)
//         // console.log(data.values[0].links)
//     })

process.on('unhandledRejection', error => console.error('Uncaught Promise Rejection', error));

cron.schedule('*/2 * * * *', () => {
    console.log('running a task every two minutes');
    refreshDavinciStatus()
    refreshRepoSubs()
});

bot.on('ready', () => {
    // bot.user.setStatus('online', 'nose pickin')
    console.log("Davinci is ready!")
    bot.user.setPresence({
        activity: {
            name: 'Franco trying to build me! LOL',
            details: 'I wanna be a cowboy',
            type: "WATCHING",
            emoji: ":thumb:",
            timestamps: {
                start: new Date()
            },
            url: "https://spyd.com"
        },
        status: 'online' //idle invisible dnd online
    });
});