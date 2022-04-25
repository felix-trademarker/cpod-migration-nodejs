let rpoContents = require('../repositories/mysql/_contents');
let rpoUsers = require('../repositories/mysql/_users');
let rpoUserOptions = require('../repositories/mysql/_user_options');
let rpoUserAddresses = require('../repositories/mysql/_user_addresses');
let rpoUserSettings = require('../repositories/mysql/_user_settings');
let rpoUserVocabulary = require('../repositories/mysql/_user_vocabulary');
let rpoUserPreferences = require('../repositories/mysql/_user_preferences');

let rpocontentDialogues = require('../repositories/mysql/_contents_dialog')
let rpoVocabulary = require('../repositories/mysql/_vocabulary')
let rpoComments = require('../repositories/mysql/_comments')

let rpoMigrations = require('../repositories/mysql/_migrations');

let rpoLessons = require('../repositories/lessons')

let moment = require('moment');

exports.lessons = async function(req, res, next) {


    // rpoMigrations.removeMigrate('lessons')
    // console.log("remove lessons");
    let lastMigrated = await rpoMigrations.getLastMigrate('lessons')
    let page = 1, limit = 10, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : 'lessons',
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    await rpoMigrations.put(migrationData)

    let contents = await rpoContents.getSQL(page,limit)
    
    
    // delete data._id
    // console.log(data);
    
    // push to mongoDB
    await contents.forEach(async items => {

        let data = items

        // fetch dialog and vocabulary
        let dialogues = await rpocontentDialogues.getByV3Id(items.v3_id)
        let keyVocabulary = await rpoVocabulary.getByV3Id(items.v3_id,"Key Vocabulary")
        let supVocabulary = await rpoVocabulary.getByV3Id(items.v3_id,"Supplementary")
        let comments = await rpoComments.getByV3Id(items.v3_id)

        data.dialogues = dialogues
        data.keyVocabulary = keyVocabulary
        data.supVocabulary = supVocabulary
        data.comments = comments

        rpoLessons.put(data)
        console.log("put lessons");
    })
    console.log("==MIGRATING LESSONS PAGE "+page+ " OF " +"COMBINED CONTENTS AND VOCABULARY ==")

 
}

exports.default = async function(table) {

    try {
        let rpo = require("../repositories/mysql/_"+table)
        let lastMigrated = await rpoMigrations.getLastMigrate(table)
        let page = 1, limit = 10, offset = 0;

        // console.log("last migrated", lastMigrated);
        if (lastMigrated.length > 0) {
            page = lastMigrated[0].page + 1
            limit = lastMigrated[0].limit
        }

        let migrationData = {
            obj : table,
            page: page,
            limit: limit,
            created_at : moment().format()
        }

        
        let contents = await rpo.getSQL(page,limit)
        // console.log(contents.length);
        if(contents.length > 0) {
            
            await rpoMigrations.put(migrationData)

            await contents.forEach(async items => {
                let dupl = await rpo.findQuery({id:items.id})
    
                if(dupl.length <= 0) {
                    await rpo.put(items)
                }
            })

            console.log("==MIGRATING PAGE "+page+ " OF " + table +"==")
        } else {
            console.log(">>>>> Stop Migration "+ table);
        }
        
    } catch (err) {
        console.log(err)
        console.log("Can't Find repository ")
    }

    

 
}


exports.users = async function(req, res, next) {

    let objVersions = "users-v4-3-24-2022"

    let lastMigrated = await rpoMigrations.getLastMigrate(objVersions)
    let page = 1, limit = 10, offset = 0;

    if (lastMigrated.length > 0) {
        page = lastMigrated[0].page + 1
        limit = lastMigrated[0].limit
    }

    let migrationData = {
        obj : objVersions,
        page: page,
        limit: limit,
        created_at : moment().format()
    }

    

    let users = await rpoUsers.getSQL(page,limit)

    if (users.length > 0) {
        
        // push to mongoDB
        await users.forEach(async user => {

            let dupl = await rpoUsers.findQuery({id:user.id})
            console.log("== validating "+user.name+" ==");

            // fetch other data | user_options | user_addresses
            let addresses = await rpoUserAddresses.getUserData(user.id)
            user.addresses = addresses

            let userOptions = await rpoUserOptions.getUserData(user.id)
            user.userOptionsData = userOptions

            let userSettings = await rpoUserSettings.getUserData(user.id)
            user.userSettings = userSettings

            let userVocabulary = await rpoUserVocabulary.getUserData(user.id)
            user.userVocabulary = userVocabulary

            let userPreferences = await rpoUserPreferences.getUserData(user.id)
            user.userPreferences = userPreferences

            if(dupl.length <= 0 ) {
                console.log("**************** Added new record ********************");
                await rpoUsers.put(user)
            } else {
                let userId = user.id
                delete user.id
                console.log("**************** Updated record ********************");
                await rpoUsers.update(userId,user)

            }

            
        })

        await rpoMigrations.put(migrationData)

    }
    
    

    console.log("==MIGRATING PAGE "+page+ " OF " +"USERS ==")
 
}
