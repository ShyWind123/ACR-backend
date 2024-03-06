const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

const generateData = require('./GenerateData')

const peak_string = ["zero", "single", "double"]

router.get('/data/get', (req, res) => {
  const peak = req.query.peak
  const dense = req.query.dense
  const empty = req.query.empty
  const filePath = path.join(__dirname, "/data/" + peak_string[peak] + "_" + dense + "_" + empty + ".json")
  fs.readFile(filePath, "utf-8", (err, dataStr) => {
    if (err) {
      return console.log("读取文件失败" + err.message);
    }
    res.send({
      "peak": peak,
      "dense": dense,
      "empty": empty,
      "data": JSON.parse(dataStr)
    })
  })
})


router.get('/data/generate', (req, res) => {
  const peak = req.query.peak
  const dense = req.query.dense
  const empty = req.query.empty

  generateData(peak, dense, empty)

  res.send("成功生成数据")
})

router.get('/sample/get', (req, res) => {
  const filePath = path.join(__dirname, `/sample_data/aqi_data.json`)
  fs.readFile(filePath, "utf-8", (err, dataStr) => {
    if (err) {
      return console.log("读取文件失败" + err.message);
    }
    res.send({
      "data": JSON.parse(dataStr)
    })
  })
})


module.exports = router