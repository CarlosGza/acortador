const express = require('express')
const router = express.Router()
const sql = require('mssql')
const db = require('../db/db')
let pool 
let credenciales = {
  user: 'PQUIUBAS2018',
  password: 'UFF1aXViYXMyMDE4'
}
router.post('/api/quiubas/webhook_mo', async (req, res) => {
  pool = await db.getConn()
	try {
    let logRes = await pool.request().query(`insert into SMSCargas.dbo.webhookSMS select getdate(),'${JSON.stringify(req.body)}'`)
    let { source_addr, message, sms_id } = req.body
    let insert = await pool
      .request()
      .input('user', sql.VarChar(100), credenciales.user)
      .input('password', sql.VarChar(100), credenciales.password)
      .input('sms_id', sql.VarChar(100), sms_id)
      .input('source_addr', sql.VarChar(200), source_addr)
      .input('message', sql.VarChar(800), message)
      .input('mnc', sql.VarChar(10), '')
      .input('mcc', sql.VarChar(10), '')
      .input('cic', sql.VarChar(10), '')
      .execute('ServicioWCF.SMS_sp_InsertaRespuestaQbs')
    res.status(200).send({desc: 'OK'})
  } catch (err) {
    let logErr = await pool.request().query(`insert into SMSCargas.dbo.webhookSMS select getdate(),'${JSON.stringify(err)}'`)
    // console.log(err)
    res.status(500).send({desc: 'error interno'})
  } 
})

module.exports = router
