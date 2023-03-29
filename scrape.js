const puppeteer = require('puppeteer')

const scrape = async () => {
    const broswer = await puppeteer.launch()
    const page = await broswer.newPage()
  
    await page.goto('https://www.tapology.com/fightcenter?group=major&schedule=upcoming')
  
    //selects mma events from the desired orgs
  
    let events = await page.evaluate(() => {
        const majorOrgs = ['UFC', 'PFL', 'BELLATOR', 'ONE'];
        return Array.from(document.querySelectorAll('.fcListing .main .left'), e => ({
          title: e.querySelector('.name').innerText,
          date: e.querySelector('.datetime').innerText,
          link: e.querySelector('.name a').href
      })).filter(event => {
        return majorOrgs.some(org => event.title.includes(org))
      }).slice(0, 5)
    })
  
    //iterate over events => follow their link parameter => get the fightcard info and add it to each object
  
    for (const event of events) {
  
      await page.goto(event.link);
  
      const fights = await page.$$eval('#content > ul.fightCard > li.fightCard', (fight) => 
        fight.map((e) => ({
          main: e.querySelector('.billing').innerText.includes('MAIN') ? true : false,
          fighterA: {
            name: e.querySelector('.fightCardFighterBout.left a').innerText,
            link: e.querySelector('.fightCardFighterBout.left a').href,
            last5: []
          },
          fighterB: {
            name: e.querySelector('.fightCardFighterBout.right a').innerText,
            link: e.querySelector('.fightCardFighterBout.right a').href,
            last5: []
          }
        }))
      );
  
      event.fights = [...fights]
  
      //determining the last 5 results for fighterA and fighterB 
  
      for (const fight of fights) {
  
        const acceptedResults = ['win', 'loss', 'draw']
        
        await page.goto(fight.fighterA.link);
  
        const AresultsArray = await page.$$eval('li > div.result', (elements) =>
            elements.map(e => e.getAttribute('data-result'))
        )
  
        const filteredAResults = AresultsArray.filter(result => {
          return acceptedResults.some(accepted => result.includes(accepted))
        }).slice(0, 5);
  
        fight.fighterA.last5 = [...filteredAResults]
        
        //fighterB results
  
        await page.goto(fight.fighterB.link);
  
        const BresultsArray = await page.$$eval('li > div.result', (elements) =>
          elements.map(e => e.getAttribute('data-result'))
        )
  
        const filteredBResults = BresultsArray.filter(result => {
          return acceptedResults.some(accepted => result.includes(accepted))
        }).slice(0, 5);
  
        fight.fighterB.last5 = [...filteredBResults]
      }
    }
  
    await broswer.close()
  
    return events
  }

  module.exports = scrape