const si = require('systeminformation')

/**
 * Get system timestamp (synchronously)
 */
function getTime () {
    let time = si.time()
    return {
        current: time.current,
        uptime: time.uptime
    }
}

/**
 * Get all current UUIDs
 */
module.exports.getUuids = function () {
    return new Promise((resolve, reject) => {
        let result = []
        si.blockDevices().then(data => {
            data.forEach(element => {
                result.push(element.uuid)
            })
            return result
        })
    })
}

/**
 * Get device information
 */
module.exports.getDevInfo = function () {
    return new Promise((resolve, reject) => {
        let result = {}
        let time = getTime()
        resolve(
            si.system().then(data => {
                result.system = data
                return si.cpu()
            }).then(data => {
                result.cpu = data
                return si.mem()
            }).then(data => {
                result.mem = data
                return si.osInfo()
            }).then(data => {
                result.os = data
                return {
                    timestamp: time.current,
                    manufacturer: result.system.manufacturer,
                    model: result.system.model,
                    version: result.system.version,
                    cpuManufacturer: result.cpu.manufacturer,
                    cpuCores: result.cpu.cores,
                    memory: result.mem.total,
                    osDistro: result.os.distro,
                    osCode: result.os.codename,
                    osHostname: result.os.hostname,
                    uptime: time.uptime
                }
            })
        )
    })
}

/**
 * Get user information
 */
module.exports.getUserInfo = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        resolve(
            si.users().then(data => {
                let result = []
                data.forEach(user => {
                    result.push({
                        timestamp: time.current,
                        user: user.user,
                        terminal: user.terminal,
                        loginDate: user.date,
                        loginTime: user.time,
                        ip: user.ip,
                        lastCmd: user.command
                    })
                })
                return result
            })
        )
    })
}

/**
 * Get network information
 */
module.exports.getNetInfo = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        let temp = {}
        resolve(
            si.networkInterfaces().then(data => {
                temp.ifaces = data
                return si.networkStats('*')
            }).then(data => {
                temp.stats = data
                let result = []
                for (let i = 0; i < temp.ifaces.length; i++) {
                    let statItem = temp.stats.find(x => x.iface.toLowerCase() === temp.ifaces[i].iface.toLowerCase())
                    result.push({
                        timestamp: time.current,
                        iface: temp.ifaces[i].iface,
                        ip: temp.ifaces[i].ip4,
                        mac: temp.ifaces[i].mac,
                        type: temp.ifaces[i].type,
                        speed: temp.ifaces[i].speed,
                        dhcp: temp.ifaces[i].dhcp,
                        rx: statItem.rx_bytes,
                        tx: statItem.tx_bytes
                    })
                }
                return result
            })
        )
    })
}

/**
 * Get CPU usage information
 */
module.exports.getCpuInfo = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        resolve(
            si.currentLoad().then(data => {
                return {
                    timestamp: time.current,
                    cpuLoad: data.currentload
                }
            })
        )
    })
}

/**
 * Get CPU temperature
 */
module.exports.getCpuTemp = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        resolve(
            si.cpuTemperature().then(data => {
                return {
                    timestamp: time.current,
                    temperature: data.main
                }
            })
        )
    })
}

/**
 * Get memory information
 */
module.exports.getMemInfo = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        resolve(
            si.mem().then(data => {
                return {
                    timestamp: time.current,
                    used: data.used,
                    buffered: data.buffers,
                    cached: data.cached,
                    swap: data.swapused,
                    swapTotal: data.swaptotal
                }
            })
        )
    })
}

/**
 * Get filesystem information
 */
module.exports.getFsInfo = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        let temp = {}
        resolve(
            si.diskLayout().then(data => {
                temp.layout = data
                return si.blockDevices()
            }).then(data => {
                temp.blk = data
                return si.fsSize()
            }).then(data => {
                temp.fsSize = data
                let result = []
                for (let i = 0; i < temp.layout.length; i++) {
                    // get disk + partition info from blockDevices
                    let blkItem = temp.blk.filter(x => x.name.startsWith(temp.layout[i].device.split('/').pop()))
                    if (!blkItem.length) continue
                    // get usage info from fsSize
                    let sizeItem = temp.fsSize.filter(x => x.fs.startsWith(temp.layout[i].device))

                    let fsTypes = []
                    let labels = []
                    let mounts = []
                    let uuids = []
                    let partSizes = []
                    blkItem.forEach(element => {
                        if (element.type === 'part') {
                            if (element.fstype !== '') fsTypes.push(element.fstype)
                            else fsTypes.push('-None-')
                            if (element.label !== '') labels.push(element.label)
                            else labels.push('-None-')
                            if (element.mount !== '') mounts.push(element.mount)
                            else mounts.push('-None-')
                            if (element.uuid !== '') uuids.push(element.uuid)
                            else uuids.push('-None-')
                            if (element.size !== '') partSizes.push(element.size)
                            else partSizes.push(0)
                        }
                    })

                    let isRemovable = false
                    if (blkItem.length === 1) {
                        isRemovable = blkItem[0].removable
                    }

                    let used = -1
                    let usedPercentage = -1
                    if (sizeItem.length) {
                        used = sizeItem[0].used
                        usedPercentage = sizeItem[0].use
                    }

                    result.push({
                        timestamp: time.current,
                        name: temp.layout[i].device,
                        fsType: fsTypes.join(', '),
                        label: labels.join(', '),
                        mount: mounts.join(', '),
                        size: temp.layout[i].size,
                        used: used,
                        usedPercentage: usedPercentage,
                        uuid: uuids.join(', '),
                        smart: temp.layout[i].smartStatus,
                        vendor: temp.layout[i].vendor,
                        modelName: temp.layout[i].name,
                        interface: temp.layout[i].interfaceType,
                        diskType: temp.layout[i].type,
                        removable: isRemovable,
                        partitionLabels: labels,
                        partitions: partSizes
                    })
                }
                return result
            })
        )
    })
}

/**
 * Get filesystem IO history
 */
module.exports.getFsIoHist = function () {
    return new Promise((resolve, reject) => {
        let time = getTime()
        resolve(
            si.fsStats().then(data => {
                return {
                    timestamp: time.current,
                    rx: data.rx,
                    tx: data.wx
                }
            })
        )
    })
}

/**
 * Get filesystem usage history
 * @param {string} uuid The UUID of the filesystem to get information for
 */
module.exports.getFsHist = function (uuid) {
    return new Promise((resolve, reject) => {
        let time = getTime()
        let temp = {}
        resolve(
            si.blockDevices().then(data => {
                temp.blk = data.find(x => x.uuid === uuid)
                return si.diskLayout()
            }).then(data => {
                let layout = data.find(x => x.device === ('/dev/' + temp.blk.name.replace(/\d+$/, '')))
                temp.smart = layout.smartStatus
                return si.fsSize()
            }).then(data => {
                let sizeItem = data.find(x => x.fs === ('/dev/' + temp.blk.name))
                temp.used = sizeItem.use
                return {
                    timestamp: time.current,
                    used: temp.used,
                    smart: temp.smart
                }
            })
        )
    })
}
