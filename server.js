const express = require('express')
const fs = require('fs')
const sql = require('mssql')
const app = express()
const https = require('https')
const urlDominio = 'https://mtel.ai/'
const sqlConfig = require('./sqlconfig/config.json')
const shortId = require('shortid')
const cors = require('cors')
const helmet = require('helmet')
const port = 443
let pool

app.use(helmet())
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

app.post('/acortador', async (req, res) => {
  req.body.usuario = 'marcademo'
  req.body.password = 'Marcatel123'

  if (req.body.usuario == undefined || req.body.password == undefined)
    return res.status(401).json({ descripcion: 'credenciales invalidas' })
  if (req.body.fullUrl == undefined || req.body.fullUrl.length < 5)
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

app.get('*',(req,res)=>{
  res.send('ruta invalida')
})

;(async () => {
  pool = new sql.ConnectionPool(sqlConfig.prod)
  await pool.connect()
  https
	.createServer(
		{
			cert: fs.readFileSync('/etc/letsencrypt/live/mtel.ai/fullchain.pem'),
			key: fs.readFileSync('/etc/letsencrypt/live/mtel.ai/privkey.pem'),
		},
		app
	)
	.listen(port, () => {
		console.log(`running on port ${port}`)
	}) 
})()

/* ;(async () => {
  pool = new sql.ConnectionPool(sqlConfig.dev)
  await pool.connect()
  app.listen( 443 , () => console.log(`Server on`));
})() */