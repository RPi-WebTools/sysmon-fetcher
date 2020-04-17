const DAO = require('./DBmngr/dao')
const SQLiteWriter = require('./DBmngr/sqliteWriter')

/**
 * Name of the devInfo table
 */
module.exports.tableDevInfo = 'devInfo'

/**
 * Name of the userInfo table
 */
module.exports.tableUserInfo = 'users'

/**
 * Name of the netInfo table
 */
module.exports.tableNetInfo = 'netIfaces'

/**
 * Name of the cpuInfo table
 */
module.exports.tableCpuInfo = 'cpu'

/**
 * Name of the temperatureInfo table
 */
module.exports.tableCpuTemp = 'temperature'

/**
 * Name of the memInfo table
 */
module.exports.tableMemInfo = 'mem'

/**
 * Name of the fsInfo table
 */
module.exports.tableFsInfo = 'fs'

/**
 * Name of the fsHist table template
 */
module.exports.tableFsHistTemplate = 'fsHist_?' // '?' later replaced by UUID

/**
 * Name of the fsIoHist table
 */
module.exports.tableFsIoHist = 'fsIo'

/**
 * Name of the dockerInfo table
 */
module.exports.tableDocker = 'docker'

/**
 * Create / open a database and initialise / overwrite with empty tables
 * @param {string} dbName Filename of the database
 * @param {Array<string>} uuids UUIDs of the filesystems that should have tables
 */
module.exports.initSysMonDb = function (dbName, uuids) {
    let dao = new DAO(dbName, 'CW')
    let writer = new SQLiteWriter(dao)
    writer.setWalMode()

    //writer.serialize()
    //writer.insertRow('tablename', ['name', 'count', 'another'], ['bla', 1, 2])
    //writer.insertMultipleRows('tablename', ['name', 'count', 'another'], [['bla', 3, 2], ['blub', 40, 10]])

    let tableFsHist = uuids.map((uuid) => this.tableFsHistTemplate.replace('?', uuid))

    // drop all tables to clean database
    writer.dropTable(this.tableDevInfo)
    writer.serialize()
    writer.dropTable(this.tableUserInfo)
    writer.serialize()
    writer.dropTable(this.tableNetInfo)
    writer.serialize()
    writer.dropTable(this.tableCpuInfo)
    writer.serialize()
    writer.dropTable(this.tableCpuTemp)
    writer.serialize()
    writer.dropTable(this.tableMemInfo)
    writer.serialize()
    writer.dropTable(this.tableFsInfo)
    writer.serialize()
    tableFsHist.forEach((table) => {
        writer.dropTable(table)
        writer.serialize()
    })
    writer.dropTable(this.tableFsIoHist)
    writer.serialize()
    writer.dropTable(this.tableDocker)

    // wait until all complete
    writer.serialize()

    // (re-)create all tables
    const colsDevInfo = this.getColsDevInfo()
    writer.createTable(this.tableDevInfo, colsDevInfo.names, colsDevInfo.types)
    const colsUserInfo = this.getColsUserInfo()
    writer.createTable(this.tableUserInfo, colsUserInfo.names, colsUserInfo.types)
    const colsNetInfo = this.getColsNetInfo()
    writer.createTable(this.tableNetInfo, colsNetInfo.names, colsNetInfo.types)
    const colsCpuInfo = this.getColsCpuInfo()
    writer.createTable(this.tableCpuInfo, colsCpuInfo.names, colsCpuInfo.types)
    const colsCpuTemp = this.getColsCpuTemp()
    writer.createTable(this.tableCpuTemp, colsCpuTemp.names, colsCpuTemp.types)
    const colsMemInfo = this.getColsMemInfo()
    writer.createTable(this.tableMemInfo, colsMemInfo.names, colsMemInfo.types)
    const colsFsInfo = this.getColsFsInfo()
    writer.createTable(this.tableFsInfo, colsFsInfo.names, colsFsInfo.types)
    const colsFsHist = this.getColsFsHist()
    tableFsHist.forEach((table) => {
        writer.createTable(table, colsFsHist.names, colsFsHist.types)
    })
    const colsFsIoHist = this.getColsFsIoHist()
    writer.createTable(this.tableFsIoHist, colsFsIoHist.names, colsFsIoHist.types)
    // writer.createTable(this.tableDocker)

    // wait until all complete
    writer.serialize()

    writer.closeDb()
}

/**
 * Get columns to create in DevInfo table
 */
module.exports.getColsDevInfo = function () {
    const colNames = [
        'timestamp',
        'manufacturer',
        'model',
        'version',
        'cpuManufacturer',
        'cpuCores',
        'memory',
        'osDistro',
        'osCode',
        'osHostname',
        'uptime'
    ]
    const colTypes = [
        'INTEGER',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in UserInfo table
 */
module.exports.getColsUserInfo = function () {
    const colNames = [
        'timestamp',
        'user',
        'terminal',
        'loginDate',
        'loginTime',
        'ip',
        'lastCmd'
    ]
    const colTypes = [
        'INTEGER',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in NetInfo table
 */
module.exports.getColsNetInfo = function () {
    const colNames = [
        'timestamp',
        'iface',
        'ip',
        'mac',
        'type',
        'speed',
        'dhcp',
        'rx',
        'tx'
    ]
    const colTypes = [
        'INTEGER',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'REAL',
        'REAL'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in CpuInfo table
 */
module.exports.getColsCpuInfo = function () {
    const colNames = [
        'timestamp',
        'cpuLoad'
    ]
    const colTypes = [
        'INTEGER',
        'REAL'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in CpuTemp table
 */
module.exports.getColsCpuTemp = function () {
    const colNames = [
        'timestamp',
        'temperature'
    ]
    const colTypes = [
        'INTEGER',
        'REAL'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in MemInfo table
 */
module.exports.getColsMemInfo = function () {
    const colNames = [
        'timestamp',
        'used',
        'buffered',
        'cached',
        'swap',
        'swapTotal'
    ]
    const colTypes = [
        'INTEGER',
        'INTEGER',
        'INTEGER',
        'INTEGER',
        'INTEGER',
        'INTEGER'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in FsInfo table
 */
module.exports.getColsFsInfo = function () {
    const colNames = [
        'timestamp',
        'name',
        'fsType',
        'label',
        'mount',
        'size',
        'used',
        'usedPercentage',
        'uuid',
        'smart',
        'vendor',
        'modelName',
        'interface',
        'diskType',
        'removable',
        'partitionLabels',
        'partitions'
    ]
    const colTypes = [
        'INTEGER',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'INTEGER',
        'INTEGER',
        'REAL',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'TEXT',
        'BIT',
        'TEXT',
        'TEXT'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in FsIoHist table
 */
module.exports.getColsFsIoHist = function () {
    const colNames = [
        'timestamp',
        'rx',
        'tx'
    ]
    const colTypes = [
        'INTEGER',
        'INTEGER',
        'INTEGER'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}

/**
 * Get columns to create in FsHist table
 */
module.exports.getColsFsHist = function () {
    const colNames = [
        'timestamp',
        'used',
        'smart'
    ]
    const colTypes = [
        'INTEGER',
        'INTEGER',
        'TEXT'
    ]
    return {
        names: colNames,
        types: colTypes
    }
}
