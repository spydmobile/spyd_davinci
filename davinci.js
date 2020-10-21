require('dotenv').config()
const Discord = require('discord.js');
const bot = new Discord.Client();
const jsonFile = require('jsonfile');
const {
    getRepoTracking,
    saveRepoTracking,
    updateSubCommit
} = require('./storage')
const logos = {
    "bb": "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcSe3ymaUPtB2AjTs05Gq1BHonnm5XIY6vSBkw&usqp=CAU",
    "gh": "https://miro.medium.com/max/325/1*ekOYsVAtOKFeeJyhv5NVhA.jpeg"
}
const { Bitbucket } = require('bitbucket')
const { Octokit } = require("@octokit/rest");
const { createTokenAuth } = require("@octokit/auth-token");

const githubToken = process.env.GH_TOKEN
console.log(typeof githubToken, githubToken)
//const githubAuth = createTokenAuth(String(githubToken));
//const githubTokenAuth = githubAuth()
const github = new Octokit(
    {
        auth: githubToken,
    }
);
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
// const saveSubscription = sub => {
//     return new Promise((resolve, reject) => {

//     });
// }
const helloReply = msg => {
    // msg.react('😄');
    // msg.reply('Hiya!');
    msg.react('👍').then(() => msg.react('👎'));

    const filter = (reaction, user) => {
        return ['👍', '👎'].includes(reaction.emoji.name) && user.id === msg.author.id;
    };

    msg.awaitReactions(filter, { max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();

            if (reaction.emoji.name === '👍') {
                msg.reply('you reacted with a thumbs up.');
            } else {
                msg.reply('you reacted with a thumbs down.');
            }
        })
        .catch(collected => {
            msg.reply('Timeout....you reacted with neither a thumbs up, nor a thumbs down.');
        });
}
const createGithubIssue = msg => {
    return new Promise(async (resolve, reject) => {

        console.log(msg)
        let cmd = await msg.content
        let parsedCommandArr = await cmd.replace("!# ", '').split(" ")
        console.log('parsedCommandArr', parsedCommandArr)
        //let verb = parsedCommandArr[0].toLowerCase()
        //let noun = parsedCommandArr[1] ? parsedCommandArr[1].toLowerCase() : 'default'
        let owner = await parsedCommandArr[2]
        let repo = await parsedCommandArr[3]
        let title = await parsedCommandArr.slice(4).join(' ');
        console.log(title)
        //const ghAuthentication = await githubAuth();
        github.request('POST /repos/{owner}/{repo}/issues', {
            owner: owner,
            repo: repo,
            title: title,
            body: "This issue was created by the Davinci Bot.",
            accept: 'application/vnd.github.v3+json'
        })
            .then((foo) => {
                console.log(foo)
                msg.reply(`issue created....`, "/n", JSON.stringify(foo));
                resolve()
            })
            .catch(err => {
                console.log(err)
                reject(err)
            })
    });






}
const createRedmineIssue = msg => {
    return new Promise((resolve, reject) => {
        msg.reply(`Sorry, I cant do that yet....`);
        resolve()
    });

}
const createBitbucketIssue = msg => {
    return new Promise(async (resolve, reject) => {

        // console.log(msg)
        let cmd = await msg.content
        let parsedCommandArr = await cmd.replace("!# ", '').split(" ")
        console.log('parsedCommandArr', parsedCommandArr)
        //let verb = parsedCommandArr[0].toLowerCase()
        //let noun = parsedCommandArr[1] ? parsedCommandArr[1].toLowerCase() : 'default'
        let workspace = await parsedCommandArr[2]
        let repo_slug = await parsedCommandArr[3]
        let title = await parsedCommandArr.slice(4).join(" ")



        bitbucketFranco.issue_tracker.create({
            _body: {
                title: title,
                body: "This issue was created by the Davinci Bot."
            },
            repo_slug,
            workspace
        })


            .then(({ data, headers }) => {
                console.log(data)
                msg.reply(`issue created....`, "/n", JSON.stringify(foo));
                resolve()

            })

    });

}
const subscribeToPublicRepo = msg => {
    // bb:intellifire/intellifire_front
}
const subscribeToPublicRSS = msg => {
    // bb:intellifire/intellifire_front
}
const createNewGitHubIssue = (title, owner, repo) => {
    console.group("Executing createNewGitHubIssue...")



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

                var embed = new MessageEmbed()
                    // Set the title of the field

                    .setTitle(`${repoSlug} - ${type}: ${commitMsg}`)
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

                    .setTitle(`${repoSlug} - ${type}: ${commitMsg}`)
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
const helpCreateIssue = msg => {

    let txt = `
    USAGE: !# create_issue <service> <owner/projectid> <repo/issue_type> <title>
    Examples: 
    !# create_issue github spydmobile spyd_davinci purple widge should be green.
    !# create_issue bitbucket intellifire intellifire_easymap This is a sample issue.
    !# create_issue redmine 1234 bug output file is blank.


    **Where <service> is one of:**
    
    "github" Creates the issue in Github.
    "bitbucket" Creates the issue in Bitbucket.
    "redmine" Creates the issue in Redmine.

    **Where the <owner/projectid> is either:**

    for github/bitbucket, the repo owner string or project owner string.
    for redmine, the projectid to make the issue in.

    **Where the <repo/issue_type> is either:**

    for github/bitbucket, the github repo code or repo slug
    for redmine, the issue_type: eg bug, task, depends on redmine config.

    **Where the <title> is a string that will be used for the title**
    in either github/bitbucket or redmine.

    This will cause Davinci to create a new issue in either github/bitbucket or redmine.
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
            "create_issue": helpCreateIssue,
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
            "redmine": createRedmineIssue,
            "bitbucket": createBitbucketIssue
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
        // console.log('channel=====', bot.channels)
        bot.channels.cache.get(channelId).send(messageText)
            // bot.channels[channelId].send(messageText)
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
                        //('bbdata', data)
                        resolve(data)
                    })
            }
            else {
                let owner = workspace
                let repo = repoSlug
                //  const ghAuthentication = await githubAuth();
                github.repos.listCommits({
                    owner,
                    repo,
                })
                    .then(data => {
                        // console.log('ghdata', data)
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
            // console.log('bbdata', data)
            sub.commitMessage = data.values[0].message
            sub.date = data.values[0].date
            sub.link = data.values[0].links.html.href
            if (sub.hash == data.values[0].hash) {

                resolve(false)
            }
            else {

                updateSubCommit(sub, data.values[0].hash)
                    .then(e => {
                        resolve(sub)
                    })
            }
        }
        else {
            //GH
            //console.log('ghdata', data.data[0])
            sub.commitMessage = data.data[0].commit.message
            sub.date = data.data[0].commit.author.date
            sub.link = data.data[0].html_url
            if (sub.hash == data.data[0].sha) {
                resolve(false)
            }
            else {
                updateSubCommit(sub, data.data[0].sha)
                    .then(e => {
                        resolve(sub)
                    })
            }
        }

        // if commits same, resolve false

        // else resolve updated commit.
    });
}
const postSubUpdate = (update) => {
    console.log("update:", update)
    let repoType = (update.host == 'bb') ? 'BitBucket' : "Github"
    var embed = new MessageEmbed()
        // Set the title of the field

        .setTitle(`${update.repoSlug} - Commit: ${update.commitMessage}`)

        // Set the color of the embed
        .setColor(0x0000ff)
        // Set the main content of the embed
        //.setImage(logos[update.host])
        .setThumbnail(logos[update.host])
        .setDescription(`This is a ${repoType} commit.`)
        .addField('Commit Hash', update.hash, true)
        .addField('Commit Date', update.date, true)
        .addField('Commit URL', update.link, false)
        .setTimestamp()
        .setFooter(`Davinci ${davinciVersion} (rev. ${revision})` + ' - Powered by Discord.js', 'https://i.imgur.com/wSTFkRM.png');



    // Send the embed to the same channel as the message
    sendChannelMessage(update.channelId, embed)
    // msg.channel.send(embed);
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
                        console.log(text)
                        // post a debug to the channel.
                        //   sendChannelMessage(sub.channelId, text)
                    }
                    else {
                        //else post an embed of the new commit in the channel
                        postSubUpdate(up)
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
            console.log('msg.author', msg.author)
            // Lets filter out psaas community messages that are from non-devs.

            // check server

            // check for dev role


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
    //refreshDavinciStatus()
    refreshRepoSubs()
});

bot.on('ready', () => {
    // bot.user.setStatus('online', 'nose pickin')
    console.log("Davinci is ready!")
    refreshRepoSubs()
    bot.user.setPresence({
        activity: {
            name: '!# Help',
            details: 'About bot building',
            type: "PLAYING",
            timestamps: {
                start: new Date()
            },
            //  url: "https://spyd.com", //url when streaming
            status: 'dnd',
        },
        status: 'online' //idle invisible dnd online
    });
});