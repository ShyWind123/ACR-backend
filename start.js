const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

const router = require('./router')
app.use(router);

app.listen(100, () => {
  console.log("已成功监听端口100");
})