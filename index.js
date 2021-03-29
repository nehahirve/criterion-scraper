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

  const filmUrls = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.gridFilm')).map(film =>
      film.getAttribute('data-href')
    )
  )

  const data = JSON.stringify(filmUrls)
  fs.writeFileSync('data.json', data)
  await browser.close()
  console.log('JSON data is saved.')
}

// scrapeMainPage()
