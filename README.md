# Buy tickets

Simple [Puppeteer](https://github.com/GoogleChrome/puppeteer) script to make buying multiple Greater Anglia tickets slightly faster (with a 16-25 railcard). 

Works on Mac OS, might work on Windows.

## What it does

* Logs into the Greater Anglia site and empties your basket. 

* Takes you to the payment page for an anytime (peak time) day return ticket from your origin to destination station. 

* Keeps the default option for how to receive your ticket - which will be smartcard if you have one set up.

## How to use

* Clone and cd to directory

* Install [node](https://nodejs.org/en/download/) if you don't have it

* Run the following:

```
npm install
node firstTimeSetup.js # and follow the instructions
node app.js
```

Enter dates in format ```YYYY-MM-DD```, eg ```2019-09-30```.


## Todo

* Make railcard optional
* Make it easier to buy multiple tickets in a row/easier to enter dates
