const express = require('express')
const router = express.Router()
const sql = require('mssql')
const db = require('../db/db')
let pool

router.post('/api/smsreader', async (req, res) => {
  pool = await db.getConn()
  try {
    let logReq = await pool.request().query(`insert into SMSCargas.dbo.webhookSMS select getdate(),'${JSON.stringify(req.body)}','/api/smsreader'`)
    let { number, message, datetime } = req.body
    let insert = await pool
      .request()
      .query(`insert into SMSReportes.dbo.SMS_IN select '${message}','${number}','${datetime}','/api/smsreader',getdate()`)
    res.status(200).send({ desc: 'OK' })
  } catch (err) {
    let logErr = await pool.request().query(`insert into SMSCargas.dbo.webhookSMS select getdate(),'${JSON.stringify(err)}','/api/smsreader'`)
    // console.log(err)
    res.status(500).send({ desc: 'error interno' })
  }
})

module.exports = router
