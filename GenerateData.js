const fs = require('fs')
const path = require('path')

const daysOfMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const daysOfHalfMonth = [15, 16, 15, 14, 15, 16, 15, 15, 15, 16, 15, 15, 15, 16, 15, 16, 15, 15, 15, 16, 15, 15, 15, 16]
const peak_string = ["zero", "single", "double"]


function generateData(peak, dense, empty) {
  let timeScale1 = []
  for (let i = 0; i < 52; i++) {
    timeScale1.push({
      "largeScale": i + 1,
      "timeRange": (i === 51 ? 8 : 7) * 24,
      "time": []
    })
  }

  let timeScale2 = []
  for (let i = 0; i < 24; i++) {
    timeScale2.push({
      "largeScale": i + 1,
      "timeRange": daysOfHalfMonth[i] * 24,
      // "timeRange": (i === 23 ? 20 : 15) * 24,
      "time": []
    })
  }

  let timeScale3 = []
  for (let i = 0; i < 12; i++) {
    timeScale3.push({
      "largeScale": i + 1,
      "timeRange": daysOfMonth[i] * 24,
      "time": []
    })
  }

  let arr = generateOriginData(peak)
  let array = Array.from(arr)
    // .filter((item, index) => ((arr.indexOf(item) === index) && item >= mean && item <= 8760 + mean))
    .filter((item, index) => ((arr.indexOf(item) === index) && item >= 0 && item < 8760))
    // .map((val) => {
    //   if (val < 0) {
    //     return val + 8760;
    //   } else if (val > 8760) {
    //     return val - 8760;
    //   } else {
    //     return val;
    //   }
    // })
    .sort((a, b) => a - b)

  console.log(array);

  let halfmonth = 0, month = 0
  let halfmonthTotal = 0, monthTotal = 0
  for (let val of array) {
    let day = getDay(val)

    //周
    let week = getWeek(val)
    week = week === 52 ? 51 : week
    timeScale1[week].time.push(val - week * 7 * 24)

    //半月
    if (day >= halfmonthTotal + daysOfHalfMonth[halfmonth]) {
      halfmonthTotal += daysOfHalfMonth[halfmonth]
      halfmonth++
    }
    timeScale2[halfmonth].time.push(val - halfmonthTotal * 24)

    //月
    if (day >= monthTotal + daysOfMonth[month]) {
      monthTotal += daysOfMonth[month]
      month++
    }
    timeScale3[month].time.push(val - monthTotal * 24)
  }

  // create a JSON object
  let data = {
    "timeScale1": timeScale1,
    "timeScale2": timeScale2,
    "timeScale3": timeScale3
  };

  const jsonData = JSON.stringify(data, undefined, 4);
  const filePath = path.join(__dirname, "/data/" + peak_string[peak] + "_" + dense + "_" + empty + ".json")
  fs.writeFile(filePath, jsonData, (err) => {
    if (err) {
      console.log('写入出错了');
    } else {
      console.log('文件写入成功');
    }
  })
}

function generateOriginData(peak) {
  let arr = []
  let cnt = new Map()
  let times = 1500

  if (peak == 0) {
    for (let k = 0; k < times; k++) {
      arr.push(Math.random() * 8760 | 0)
    }
  } else {
    let mean = []
    let std_dev

    if (peak == 1) {
      mean = [getRandom(1500, (8760 - 1500))]
      std_dev = 2000
      console.log(mean[0]);
    } else if (peak == 2) {
      // 8760 / 2 = 4380
      // 4380 / 2 = 2190
      // 4380+2190 = 6570
      // 两个长度为4380的区域，左右各2190，中心分别为2190和6570
      mean = [getRandom(-1000, 1000) + 2190, getRandom(-1000, 1000) + 6570]
      std_dev = 1000
      console.log(mean[0] + " " + mean[1])
    }
    // else if (peak == 3) {
    //   // 8760 / 3 = 2920
    //   // 2920 / 2 = 1460 
    //   // 1460 + 2920 = 4380
    //   // 4380 + 2920 = 7300
    //   // 三个长度为2920的区域，左右各1460，中心分别为1460，4380,7300
    //   mean = [getRandom(-1000, 1000) + 1460, getRandom(-1000, 1000) + 4380, getRandom(-1000, 1000) + 7300]
    //   std_dev = 600;
    //   console.log(mean[0] + " " + mean[1] + " " + mean[2])
    // }

    let randomMean = mean[getRandom(0, mean.length)]
    let denseMean = getRandom(randomMean - 1000, randomMean + 1000)
    console.log(denseMean);

    //连续区域
    for (let i = 0; i < 20; i++) {
      let val = getNumberInNormalDistribution(denseMean, 10) | 0
      // let val = denseMean + i - 10
      let valWeek = getWeek(val)
      cnt.set(valWeek, 1 + (cnt.has(valWeek) ? cnt.get(valWeek) : 0))
      arr.push(val)
      if (peak === 1)
        console.log(val + "," + valWeek);
    }
    //整体分布
    for (let k = 0; k < mean.length; k++) {
      for (let i = 0; i < times / mean.length; i++) {
        let val = getNumberInNormalDistribution(mean[k], std_dev) | 0
        let valWeek = getWeek(val)
        if (cnt.has(valWeek)) {
          cnt.set(valWeek, cnt.get(valWeek) - 1)
          if (cnt.get(valWeek) === 0) {
            cnt.delete(valWeek)
          }
        } else {
          arr.push(val)
        }
      }
    }
  }

  return arr;
}

function getNumberInNormalDistribution(mean, std_dev) {
  return mean + (randomNormalDistribution() * std_dev);
}

function randomNormalDistribution() {
  var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
  do {
    //获得两个（-1,1）的独立随机变量
    u = Math.random() * 2 - 1.0;
    v = Math.random() * 2 - 1.0;
    w = u * u + v * v;
  } while (w == 0.0 || w >= 1.0)
  //这里就是 Box-Muller转换
  c = Math.sqrt((-2 * Math.log(w)) / w);
  //返回2个标准正态分布的随机数，封装进一个数组返回
  //当然，因为这个函数运行较快，也可以扔掉一个
  //return [u*c,v*c];
  return u * c;
}

function getRandom(left, right) {
  return (Math.random() * (right - left) + left) | 0
}

function getDay(a) {
  return a / 24 | 0
}

function getWeek(a) {
  return a / 24 / 7 | 0
}

module.exports = generateData