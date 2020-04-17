const fs = require('fs')

const getInfo = require('./getInfo')
const initDb = require('./initDb')
const DAO = require('./DBmngr/dao')
const SQLiteWriter = require('./DBmngr/sqliteWriter')

/**
 * Sleep for x milliseconds
 * @param {Number} ms Milliseconds to wait
 */
module.exports.sleep = function (ms) {
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

/**
 * Get all UUIDs of filesystems that are currently connected
 */
module.exports.getCurrentUuids = function () {
    return getInfo.getUuids()
}

/**
 * Initialise the database with all needed tables
 * @param {string} dbName Path and name of the database file
 * @param {Array<string>} uuids All current UUIDs
 */
module.exports.initialise = function (dbName, uuids) {
    let sleepFor = 1
    if (!fs.existsSync(dbName)) {
        initDb.initSysMonDb(dbName, uuids)
        sleepFor = 2000
    }
    // wait a bit to make sure it is done creating (if newly created)
    return this.sleep(sleepFor)
}

/**
 * Read new data and write it to the database
 * @param {string} dbName Path and name of the database file
 * @param {string} mode Specifies what part should be read (e.g. cpuInfo, all, ...)
 * @param {string|Array<string>} uuid UUID, only needed if mode = fsHist or all
 */
module.exports.newData = function (dbName, mode, uuid='') {
    let dao = new DAO(dbName, 'CW')
    let writer = new SQLiteWriter(dao)
    switch (mode) {
        case 'devInfo':
            getInfo.getDevInfo().then(data => {
                storeGeneric(writer, initDb.tableDevInfo, initDb.getColsDevInfo().names, data)
            })
            break
        case 'userInfo':
            getInfo.getUserInfo().then(data => {
                storeGeneric(writer, initDb.tableUserInfo, initDb.getColsUserInfo().names, data)
            })
            break
        case 'netInfo':
            getInfo.getNetInfo().then(data => {
                storeGeneric(writer, initDb.tableNetInfo, initDb.getColsNetInfo().names, data)
            })
            break
        case 'cpuInfo':
            getInfo.getCpuInfo().then(data => {
                storeGeneric(writer, initDb.tableCpuInfo, initDb.getColsCpuInfo().names, data)
            })
            break
        case 'cpuTemp':
            getInfo.getCpuTemp().then(data => {
                storeGeneric(writer, initDb.tableCpuTemp, initDb.getColsCpuTemp().names, data)
            })
            break
        case 'memInfo':
            getInfo.getMemInfo().then(data => {
                storeGeneric(writer, initDb.tableMemInfo, initDb.getColsMemInfo().names, data)
            })
            break
        case 'fsInfo':
            getInfo.getFsInfo().then(data => {
                storeGeneric(writer, initDb.tableFsInfo, initDb.getColsFsInfo().names, data)
            })
            break
        case 'fsIoHist':
            getInfo.getFsIoHist().then(data => {
                storeGeneric(writer, initDb.tableFsIoHist, initDb.getColsFsIoHist().names, data)
            })
            break
        case 'fsHist':
            if (uuid === '') break
            getInfo.getFsHist(uuid).then(data => {
                storeGeneric(
                    writer,
                    initDb.tableFsHistTemplate.replace('?', uuid),
                    initDb.getColsFsHist().names,
                    data
                )
            })
            break
        case 'all':
            getInfo.getDevInfo().then(data => {
                storeGeneric(writer, initDb.tableDevInfo, initDb.getColsDevInfo().names, data)
            })
            getInfo.getUserInfo().then(data => {
                storeGeneric(writer, initDb.tableUserInfo, initDb.getColsUserInfo().names, data)
            })
            getInfo.getNetInfo().then(data => {
                storeGeneric(writer, initDb.tableNetInfo, initDb.getColsNetInfo().names, data)
            })
            getInfo.getCpuInfo().then(data => {
                storeGeneric(writer, initDb.tableCpuInfo, initDb.getColsCpuInfo().names, data)
            })
            getInfo.getCpuTemp().then(data => {
                storeGeneric(writer, initDb.tableCpuTemp, initDb.getColsCpuTemp().names, data)
            })
            getInfo.getMemInfo().then(data => {
                storeGeneric(writer, initDb.tableMemInfo, initDb.getColsMemInfo().names, data)
            })
            getInfo.getFsInfo().then(data => {
                storeGeneric(writer, initDb.tableFsInfo, initDb.getColsFsInfo().names, data)
            })
            if (uuid === '' || !Array.isArray(uuid)) break
            uuid.forEach(single => {
                getInfo.getFsHist(single).then(data => {
                    storeGeneric(
                        writer,
                        initDb.tableFsHistTemplate.replace('?', single),
                        initDb.getColsFsHist().names,
                        data
                    )
                })
            })
            break
        default:
            break
    }
    writer.closeDb()
}
