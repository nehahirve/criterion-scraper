const puppeteer = require('puppeteer')
const mongoose = require('mongoose')
const dotenv = require('dotenv').config()

import Film from './models/Film'

//connect to database
mongoose
  .connect(process.env.MONGODB, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log('Connected to database!'))
  .catch(err => console.log(err))

//scrape urls
async function generateData() {
  const url = 'https://www.criterion.com/shop/browse/list?sort=spine_number'
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'load', timeout: 0 })
  let filmDivs = await page.$$('.gridFilm')
  for (let filmDiv of filmDivs) {
    const spine = await filmDiv.$eval('.g-spine', el => el.innerText)
    if (spine) {
      const externalUrl = await filmDiv.evaluate(film =>
        film.getAttribute('data-href')
      )
      const title = await filmDiv.$eval('.g-title', el => el.innerText)
      const year = await filmDiv.$eval('.g-year', el => el.innerText)
      const director = await filmDiv.$eval('.g-director', el => el.innerText)
      const country = await filmDiv.$eval('.g-country', el => el.innerText)
      const coverUrl = await filmDiv.$eval('img', el =>
        el.src.replace('_thumbnail.jpg', '_small.jpg')
      )

      const filmExists = await Film.findOne({ externalUrl }).exec()

      if (!filmExists) {
        const film = new Film({
          spine,
          title,
          year,
          director,
          country,
          coverUrl,
          externalUrl
        })

        try {
          film.save()
          console.log(film)
        } catch (err) {
          console.error(err)
        }
      }
    }
  }
  await browser.close()
  return console.log('API Generated!')
}

generateData()
