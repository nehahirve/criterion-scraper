const fs = require('fs')
const puppeteer = require('puppeteer')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

//connect to database
mongoose
  .connect(process.env.MONGODB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log('connected to database!'))
  .catch(err => console.log(err))

//scrape urls

async function scrapeMainPage() {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const url = 'https://www.criterion.com/shop/browse/list?sort=spine_number'
  await page.goto(url, { waitUntil: 'load', timeout: 0 })
  let filmUrls = await page.$$('.gridFilm')
  let arr = []
  for (let film of filmUrls) {
    const filmUrl = await film.evaluate(film => film.getAttribute('data-href'))
    const spine = await film.$eval('.g-spine', el => el.innerText)
    const title = await film.$eval('.g-title', el => el.innerText)
    const year = await film.$eval('.g-year', el => el.innerText)
    const director = await film.$eval('.g-director', el => el.innerText)
    const country = await film.$eval('.g-country', el => el.innerText)
    const coverUrl = await film.$eval('img', el =>
      el.src.replace('_thumbnail.jpg', '_small.jpg')
    )

    arr.push({ filmUrl, spine, title, year, director, country, coverUrl })
  }
  arr = arr.filter(item => item.spine)

  // const data = JSON.stringify(filmUrls)
  // fs.writeFileSync('data.json', data)
  await browser.close()
  console.log(arr[arr.length - 1])
}

scrapeMainPage()
