const keytar = require('keytar')
const fs = require('fs')
const readline = require('readline')
const Writable = require('stream').Writable;


const mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted)
      process.stdout.write(chunk, encoding);
    callback();
  }
});

mutableStdout.muted = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

const run = async () => {

  await fs.unlink('.env', () => {})

  
  const username = await askQuestion('Please enter your account username', false)
  const origin = await askQuestion('Please enter your 3 letter origin code', false)
  const destination = await askQuestion('Please enter your 3 letter destination code', false)



  fs.appendFileSync('.env', `USERNAME=${username}\nORIGIN=${origin}\nDESTINATION=${destination}`)

  mutableStdout.muted = true
  console.log('Please enter your password (stored securely in keychain)')
  const password = await askQuestion('', true)

  await keytar.setPassword('buy-tickets', username, password)
  
  rl.close();

}

const askQuestion = async questionText => {
  return new Promise((resolve, reject) => {
    rl.question(`${questionText}\n`, (answer) => {
      resolve(answer)
    });
  })
}

run()