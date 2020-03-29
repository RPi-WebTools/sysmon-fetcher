const fs = require('fs')

const getInfo = require('./getInfo')
const initDb = require('./initDb')
const DAO = require('./dao')
const SQLiteWriter = require('./writeData')


const dbName = 'sysmon.db'


/**
 * Sleep for x milliseconds
 * @param {Number} ms Milliseconds to wait
 */
function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Store given information in the database
 * @param {SQLiteWriter} writer Database writer to use
 * @param {string} table Table name
 * @param {Array<string>} cols Names of the table columns
 * @param {Array|Object} data Data to write
 */
function storeGeneric (writer, table, cols, data) {
    if (Array.isArray(data)) {
        let dataToWrite = []
        data.forEach(element => {
            dataToWrite.push(Object.values(element))
        })
        writer.insertMultipleRows(table, cols, dataToWrite)
    }
    else {
        writer.insertRow(table, cols, Object.values(data))
    }
}

//----------------------------------------------------------------------------

// check if database exists or needs to be created
let sleepFor = 1
if (!fs.existsSync('./' + dbName)) {
    // TODO: get and supply real UUIDs here
    initDb.initSysMonDb(dbName, ['bla', 'blub', 'bleu'])
    sleepFor = 2000
}

// wait a bit to make sure it is done creating (if newly created)
sleep(sleepFor).then(() => {
    let dao = new DAO(dbName)
    let writer = new SQLiteWriter(dao)

    getInfo.getCpuInfo().then(data => {
        storeGeneric(writer, initDb.tableCpuInfo, initDb.getColsCpuInfo().names, data)
    })
})
