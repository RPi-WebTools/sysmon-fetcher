const DAO = require('./dao')

class SQLiteWriter {
    /**
     * Reader for SQLite databases
     * @param {DAO} dao 
     */
    constructor (dao) {
        this.dao = dao
    }

    /**
     * Turns on WAL / Write Ahead Logging
     */
    setWalMode () {
        return this.dao.run('PRAGMA journal_mode = WAL;')
    }

    /**
     * Serialize queries
     * @param {*} callback What should be serialized
     */
    serialize (callback) {
        return this.dao.serialize(callback)
    }

    /**
     * Parallelize queries
     * @param {*} callback What should be parallelized
     */
    parallelize (callback) {
        return this.dao.parallelize(callback)
    }

    /**
     * Close the database connection
     */
    closeDb () {
        return this.dao.close()
    }

    /**
     * Create a new table
     * @param {string} name Table name
     * @param {Array<string>} colNames Column names
     * @param {Array<string>} colTypes Column types
     */
    createTable (name, colNames, colTypes) {
        let sql = `CREATE TABLE IF NOT EXISTS ` + name + `(id INTEGER PRIMARY KEY AUTOINCREMENT,`

        // check if arrays match and if at least one item in them
        if (colNames.length !== colTypes.length) return false
        if (!colNames.length) return false

        for (let i = 0; i < colNames.length; i++) {
            sql += colNames[i] + ' ' + colTypes[i]
            if (i < (colNames.length - 1)) {
                sql += ', '
            }
        }
        sql += ')'
        return this.dao.run(sql)
    }

    /**
     * Drop a table
     * @param {string} name Table name
     */
    dropTable (name) {
        return this.dao.run('DROP TABLE IF EXISTS ' + name + ';')
    }

    /**
     * Insert new row into table
     * @param {string} table Table name
     * @param {Array<string>} cols Column names
     * @param {Array} data Row data
     */
    insertRow (table, cols, data) {
        let sql = 'INSERT INTO ' + table + '('

        for (let i = 0; i < cols.length; i++) {
            sql += cols[i]
            if (i < (cols.length - 1)) {
                sql += ', '
            }
        }
        sql += ') VALUES ('
        sql += data.map(() => '?').join(', ')
        sql += ')'
        return this.dao.run(sql, data)
    }

    /**
     * Insert multiple new rows into table
     * @param {string} table Table name
     * @param {Array<string>} cols Column names
     * @param {Array<Array>} data Data for each row to be inserted
     */
    insertMultipleRows (table, cols, data) {
        let sql = 'INSERT INTO ' + table + '('
        
        for (let i = 0; i < cols.length; i++) {
            sql += cols[i]
            if (i < (cols.length - 1)) {
                sql += ', '
            }
        }
        sql += ') VALUES '
        sql += data.map((value) => {
            let innerPlaceholder = value.map(() => '?').join(', ')
            return '(' + innerPlaceholder + ')'
        }).join(', ')

        // merge all sub arrays into one "toplevel" array
        let flattenedData = [].concat.apply([], data)

        return this.dao.run(sql, flattenedData)
    }
}

module.exports = SQLiteWriter
