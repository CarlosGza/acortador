const express = require('express')
const fs = require('fs')
const sql = require('mssql')
const app = express()
const https = require('https')
const urlDominio = 'https://mtel.ai/'
// const sqlConfig = require('./sqlconfig/config.json')
const shortId = require('shortid')
const cors = require('cors')
const helmet = require('helmet')
const portSec = 443
// const portUnsec = 80
let regex = new RegExp(/^(http|https):\/\/(?:(?:(?:[\w\.\-\+!$&'\(\)*\+,;=]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$/)
let pool
const db = require('./db/db')

app.use(helmet())
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

const rutaQuiubas = require('./routes/quiubas.js')
const rutaSMSReader = require('./routes/smsreader.js')

app.use(rutaQuiubas)
app.use(rutaSMSReader)

app.post('/acortador', async (req, res) => {
  req.body.usuario = 'marcademo'
  req.body.password = 'Marcatel123'

  if (req.body.usuario == undefined || req.body.password == undefined)
    return res.status(401).json({ descripcion: 'credenciales invalidas' })
  if (req.body.fullUrl == undefined || !regex.test(req.body.fullUrl))
    return res.status(400).json({ descripcion: 'url invalida' })

  try {
    let pass = new Buffer.from(req.body.password)
    let encodedPass = pass.toString('base64')
    let newShort = await pool.request()
      .input('Usuario', sql.VarChar(50), req.body.usuario)
      .input('Password', sql.VarChar(50), encodedPass)
      .input('fullUrl', sql.VarChar(sql.MAX), req.body.fullUrl)
      .input('shortUrl', sql.VarChar(sql.MAX), shortId.generate())
      .execute('sp_InsertaURLcorta')
    // console.log(newShort.recordset[0])
    // res.send({})
    res.send({ fullUrl: newShort.recordset[0].full, shortUrl: urlDominio + newShort.recordset[0].short })
  } catch (err) {
    console.log(err)
    res.status(500).json({ descripcion: 'error al generar liga corta' })
  }
})
//https://b2c.marcatel.com.mx/okjuhydsvnkijuytfd
app.get('/:shortUrl', async (req, res) => {
  // const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  try {
    const shortUrl = await pool.request()
      .input('shortUrl', sql.VarChar(sql.MAX), req.params.shortUrl)
      .execute('sp_ObtenerUrl')
    if (shortUrl == null || shortUrl.recordset.length < 1) return res.sendStatus(404)
    // console.log(req.ip)
    // shortUrl.clicks++
    // shortUrl.save()

    res.redirect(shortUrl.recordset[0].full)

  } catch (err) {
    console.log(err)
    res.sendStatus(404)
  }
})

app.get('*', (req, res) => {
  res.send('ruta invalida')
})

  ; (async () => {
    // pool = new sql.ConnectionPool(sqlConfig.prod)
    // await pool.connect()
    pool = await db.getConn()
    https
      .createServer(
        {
          cert: fs.readFileSync('/etc/letsencrypt/live/mtel.ai/fullchain.pem'),
          key: fs.readFileSync('/etc/letsencrypt/live/mtel.ai/privkey.pem'),
        },
        app
      )
      .listen(portSec, () => {
        console.log(`running on port ${portSec}`)
      })

  })()

/* ;(async () => {
  // pool = new sql.ConnectionPool(sqlConfig.dev)
  // await pool.connect() 
  pool = await db.getConn()
  app.listen( 8080 , () => console.log(`Server on`));
})() */