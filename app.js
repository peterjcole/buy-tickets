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

const getInput = () => {
  return new Promise ((resolve, reject) => {
    readline.question('What date do you want a ticket for? (type t for tomorrow, n for next day after the last, q to quit)\n', input => {
        resolve(input)
    })
  })
}

const buyTicketFor = async (date, page) => {

  const formattedDate = dateFormat(date, 'dd/mm/yy')

  await page.goto(buyUrl);
  
  await enterJourneyDetails(page, formattedDate);

  await selectPeakJourneys(page);

  await loginTo(page)

  await continueToPayment(page);

  await tickPaymentBoxes(page);

}

const clearBasket = async (page) => {
  await page.goto(basketUrl);

  await loginTo(page)

  await clearBasketOn(page)
}

const clearBasketOn = async page => {
  let stillNotEmpty = true
  while (true){
    if (await page.$('#ShoppingBasket_DeleteBooking_1') == null) break
    await removeTopBooking(page)
  }
}

const removeTopBooking = async page => {
  await Promise.all([page.click('#ShoppingBasket_DeleteBooking_1'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })])
}

const loginTo = async page => {
  if (await page.$('#loginIntoAccount') != null) await page.click('#loginIntoAccount')
  if (await page.$('#EmailTextBox') != null) {
    await page.evaluate((text) => { (document.getElementById('EmailTextBox')).value = text; }, username);

    await page.evaluate((text) => { (document.getElementById('PasswordTextBox')).value = text; }, password);
  
    await page.waitFor(3000)
  
    await Promise.all([page.click('#PrimaryLoginSubmitButton'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
  }
}

async function tickPaymentBoxes(page) {
  await page.click('#ShoppingBasket_Dpa84Checkbox_off');
  await page.click('#ShoppingBasket_TermsAndConditions');
  await page.click('#PaymentMethod_PaymentCard_Option');
}

async function continueToPayment(page) {
  await Promise.all([page.click('#cmd_continue'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
  await Promise.all([page.click('#Submit'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
}

async function selectPeakJourneys(page) {
  await page.evaluate(() => {
    document.querySelector("[id='107_1']").click();
  });
  await page.waitFor(100);
  await page.evaluate(() => {
    document.querySelector("[id='107_5']").click();
  });
  await page.waitFor(1000);
  await Promise.all([page.click('#SelectTicket'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
  await Promise.all([page.click('#SeatReservationButton'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
}

async function enterJourneyDetails(page, formattedDate) {
  await page.evaluate(() => document.getElementById("outwardDate").value = "");
  await page.evaluate(() => document.getElementById("returnDate").value = "");
  await page.evaluate(() => document.getElementById("OriginStation").value = "");
  await page.evaluate(() => document.getElementById("DestinationStation").value = "");
  await page.type('#OriginStation', process.env.ORIGIN);
  await page.type('#DestinationStation', process.env.DESTINATION);
  await page.select('#JourneyTypeListBox', 'R');
  await page.type('#outwardDate', formattedDate);
  await page.type('#returnDate', formattedDate);
  await page.select('#OutwardHour', '7');
  await page.select('#ReturnHour', '8');
  await page.select('#railCardsType_0', 'YNG');
  await Promise.all([page.click('#cmd_advancedsearch'), page.waitForNavigation({ waitUntil: 'load' }), page.waitForNavigation({ waitUntil: 'networkidle0' })]);
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

  let date;

  while (true) {
    const answer = await getInput()
    let done = false

    switch (answer) {
      case 'q':
        done = true
        break
      case 't':
        date = new Date()
        date.setDate(date.getDate() + 1)
        break
      case 'n':
        date ? date.setDate(date.getDate() + 1) : date = new Date()
        break
      default:
        date = new Date(answer)
    }

    console.log(date)
    if (done) break
    await buyTicketFor(date, page)
  }

  process.exit()
}

run()