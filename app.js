require('dotenv').config()
const puppeteer = require('puppeteer');
const path = require('path');
const keytar = require('keytar')
const dateFormat = require('dateformat')
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
const appDir = path.dirname(require.main.filename);
let username
let password

const buyUrl = 'https://www.buytickets.greateranglia.co.uk'
const basketUrl = 'https://www.buytickets.greateranglia.co.uk/buytickets/shoppingbasket.aspx'


const getPassword = username => {
  return keytar.getPassword('buy-tickets', username)
}

const getDate = () => {
  return new Promise ((resolve, reject) => {
    readline.question('What date do you want a ticket for? (type q to quit)', date => {
      if (date === 'q') resolve('q')
      resolve(new Date(date))
    })
  })
}

const buyTicketFor = async (date, page) => {


  const formattedDate = dateFormat(date, 'dd/mm/yy')
  console.log(formattedDate)


  await page.goto(buyUrl);
  
  await page.evaluate( () => document.getElementById("outwardDate").value = "")
  await page.evaluate( () => document.getElementById("returnDate").value = "")

  await page.evaluate( () => document.getElementById("OriginStation").value = "")
  await page.evaluate( () => document.getElementById("DestinationStation").value = "")


  await page.type('#OriginStation', process.env.ORIGIN)
  await page.type('#DestinationStation', process.env.DESTINATION)
  await page.select('#JourneyTypeListBox', 'R')

  await page.type('#outwardDate', formattedDate)
  await page.type('#returnDate', formattedDate)

  await page.select('#OutwardHour', '7')
  await page.select('#ReturnHour', '8')
  await page.select('#railCardsType_0', 'YNG')

  await Promise.all([page.click('#cmd_advancedsearch'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);

  await page.evaluate(() => {
    document.querySelector("[id='66_1']").click()
  })
  await page.waitFor(100)

  await page.evaluate(() => {
    document.querySelector("[id='66_5']").click()
  })
  await page.waitFor(1000)

  await Promise.all([page.click('#SelectTicket'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);

  await Promise.all([page.click('#SeatReservationButton'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);

  loginTo(page)

  await Promise.all([page.click('#cmd_continue'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);

  await Promise.all([page.click('#Submit'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);

  await page.click('#ShoppingBasket_Dpa84Checkbox_off')

  await page.click('#ShoppingBasket_TermsAndConditions')

  await page.click('#PaymentMethod_PaymentCard_Option')

}

const clearBasket = async (page) => {
  // const browser = await puppeteer.launch({
  //   // userDataDir: `${appDir}/user_data`,
  //   headless: false
  // });
  // const page = await browser.newPage();
  await page.goto(basketUrl);

  await loginTo(page)

  await clearBasketOn(page)
  console.log('what')
}

const clearBasketOn = async page => {
  let stillNotEmpty = true
  while (true){
    if (await page.$('#ShoppingBasket_DeleteBooking_1') == null) break
    await removeTopBooking(page)
  }
  console.log('what')

}

const removeTopBooking = async page => {
  await Promise.all([page.click('#ShoppingBasket_DeleteBooking_1'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })])
}

const loginTo = async page => {
  if (await page.$('#loginIntoAccount') != null) await page.click('#loginIntoAccount')

  // await page.type('#EmailTextBox', 'peter@petercole.net')
  if (await page.$('#EmailTextBox') != null) {
    await page.evaluate((text) => { (document.getElementById('EmailTextBox')).value = text; }, username);

    await page.evaluate((text) => { (document.getElementById('PasswordTextBox')).value = text; }, password);
  
    await page.waitFor(3000)
  
    await Promise.all([page.click('#PrimaryLoginSubmitButton'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
  }
}


const run = async () => {

  username = process.env.USERNAME
  password = await getPassword(username)


  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: `${appDir}/user_data`,
  });

  const page = await browser.newPage();

  await clearBasket(page)

  while (true) {
    let date = await getDate()
    console.log(date)
    if(date === 'q') break
    buyTicketFor(date, page)
  }

  process.exit()

}

run()






