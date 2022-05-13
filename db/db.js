const dbconfig = require('./config.json')
const sql = require('mssql')
const fs = require('fs')
let conn

async function getConn() {
  if (conn) {
    log('ya existe conexion')
    return conn
  }
  log('crea nueva conexion')
  conn = new sql.ConnectionPool(dbconfig.prod)
  await conn.connect()
  return conn
}


function log(info) {
	let hr = getDateTime()
	let archivoLog = getDate()
	//fs.appendFileSync(`./logs/logdb.${archivoLog}`, `${hr} | ${info}\r\n`)
	return
}
const getDateTime = () => {
	let today = new Date()
	let dd = today.getDate()
	let mm = today.getMonth() + 1
	const yyyy = today.getFullYear()
	let hr = today.getHours()
	let min = today.getMinutes()
	let seg = today.getSeconds()
	if (dd < 10) {
		dd = `0${dd}`
	}
	if (mm < 10) {
		mm = `0${mm}`
	}
	if (hr < 10) {
		hr = `0${hr}`
	}
	if (min < 10) {
		min = `0${min}`
	}
	if (seg < 10) {
		seg = `0${seg}`
	}
	today = `${dd}${mm}${yyyy}-${hr}${min}${seg}`
	return today
}
const getDate = () => {
	let today = new Date()
	let dd = today.getDate()

	let mm = today.getMonth() + 1
	const yyyy = today.getFullYear()
	if (dd < 10) {
		dd = `0${dd}`
	}

	if (mm < 10) {
		mm = `0${mm}`
	}
	today = `${dd}-${mm}-${yyyy}`
	return today
}

module.exports = {
  getConn
}
