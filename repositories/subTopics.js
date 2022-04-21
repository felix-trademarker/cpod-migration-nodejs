let _table = process.env.TBLEXT + "sub_topics";
var Model = require('./_model')
var defaultModel = new Model(_table)

let conn = require('../config/DbConnect');

module.exports = {

    // BASE FUNCTIONS LOCATED IN defaultModel
    get : async function() {
        return await defaultModel.get()
    },
    find : async function(id) {
        return await defaultModel.find(id)
    },
    findQuery : async function(query) {
        return await defaultModel.findQuery(query)
	},
	update : async function(id,data) {
        return await defaultModel.update(id,data)
    },
	put : async function(data) {
        return await defaultModel.put(data)
    },
    remove : async function(id) {
        return await defaultModel.remove(id)
    },

    // ADD CUSTOM FUNCTION BELOW ========================
    // ==================================================
    getLatestTopics : async function() {
		return new Promise(function(resolve, reject) {

			let query = { status: {$ne: 'draft'} };
			
			conn.getDb().collection(_table).find(query).sort( { "created_at": -1 } ).limit(15).toArray(function(err, result) {
					
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}

			});

		});
	},
	

}