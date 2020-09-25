
const jsonfile = require('jsonfile')

const getRepoTracking = () => {
    return new Promise((resolve, reject) => {
        const file = './data/repoTracking.json'
        jsonfile.readFile(file, function (err, obj) {
            if (err) {
                console.error(err)
                reject(err)
            }
            else {
                resolve(obj)
            }
        })
    })
}


const saveRepoTracking = repoTrackingObj => {
    return new Promise((resolve, reject) => {
        const file = './data/repoTracking.json'
        jsonfile.readFile(file, async function (err, obj) {
            if (err) console.error(err)
            console.dir(obj)

            // in theory, if the sub is not already in storage, it willbe added
            // if it exists, it will be replaced.
            let readyObj = await obj.filter(rt => {
                console.log(rt, repoTrackingObj)
                return rt.subId != repoTrackingObj.subId
            })


            readyObj.push(repoTrackingObj)
            jsonfile.writeFile(file, readyObj, { spaces: 2 }, function (err) {
                if (err) console.error(err)
                console.log('Wrote new trackingObject...', repoTrackingObj)
                resolve()
            })
        })
    });

}
const updateSubCommit = (sub, hash) => {
    return new Promise(async (resolve, reject) => {
        const file = './data/repoTracking.json'
        jsonfile.readFile(file, async function (err, obj) {
            if (err) console.error(err)
            // console.dir(obj)
            sub.hash = await hash
            // in theory, if the sub is not already in storage, it willbe added
            // if it exists, it will be replaced.
            let readyObj = await obj.filter(rt => {
                // console.log(rt, sub)
                return rt.subId != sub.subId
            })


            readyObj.push(sub)
            jsonfile.writeFile(file, readyObj, { spaces: 2 }, function (err) {
                if (err) console.error(err)
                console.log('Updated trackingObject...', sub)
                resolve()
            })
        })
    });

}

module.exports = {
    getRepoTracking,
    saveRepoTracking,
    updateSubCommit

}