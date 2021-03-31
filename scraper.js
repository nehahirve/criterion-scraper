import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
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
async function generateData() {
  const url = 'https://www.criterion.com/shop/browse/list?sort=spine_number'
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 0 })
  let films = await page.$$('.gridFilm')
  const arr = []
  for (let film of films) {
    const spine = await film.$eval('.g-spine', el => el.innerText)
    if (spine) {
      const externalUrl = await film.evaluate(film =>
        film.getAttribute('data-href')
      )
      const id = uuidv4()
      const title = await film.$eval('.g-title', el => el.innerText)
      const year = await film.$eval('.g-year', el => el.innerText)
      const director = await film.$eval('.g-director', el => el.innerText)
      const country = await film.$eval('.g-country', el => el.innerText)
      const coverUrl = await film.$eval('img', el =>
        el.src.replace('_thumbnail.jpg', '_small.jpg')
      )
      arr.push({
        id,
        spine,
        title,
        year,
        director,
        country,
        coverUrl,
        externalUrl
      })
    }
  }
  await browser.close()
  fs.writeFile('data.json', JSON.stringify(arr), () => console.log('done'))
  return arr
}

generateData()

// if no db in mongoose
//create db
// else connect to db
//for each film
// if film not in db
// save film to db
