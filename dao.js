const sqlite3 = require('sqlite3').verbose()

/**
 * Data Access Object to access a sqlite3 database
 */
class DAO {
    /**
     * Create the DAO
     * @param {string} dbName Path to db
     */
    constructor(dbName) {
        if (typeof dbName == 'string' && dbName.endsWith('.db')) {
            this.db = new sqlite3.Database(dbName, (error) => {
                if (error) console.log('Connect to db failed!', error)
            })
        }
        else {
            this.db = null
            console.log('Creating failed. Wrong type of filename')
        }
    }

    /**
     * Serialize queries
     * @param {*} callback What should be serialized
     */
    serialize (callback) {
        return this.db.serialize(callback)
    }

    /**
     * Parallelize queries
     * @param {*} callback What should be parallelized
     */
    parallelize (callback) {
        return this.db.parallelize(callback)
    }

    /**
     * Runs a SQL command
     * @param {string} sqlCmd SQL command to run
     * @param {Array} params Further options
     */
    run (sqlCmd, params=[]) {
        return new Promise((resolve, reject) => {
            this.db.run(sqlCmd, params, (error) => {
                if (error) {
                    console.log('Error running sql command: ' + sqlCmd)
                    console.log(error)
                    reject(error)
                }
                else {
                    resolve({ id: this.lastID })
                }
            })
        })
    }

    /**
     * Close the database connection
     */
    close () {
        return this.db.close()
    }
}

module.exports = DAO
