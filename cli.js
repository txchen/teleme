#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const os = require('os')

const hostname = os.hostname()
const homedir = os.homedir()
const configFileName = path.join(os.homedir(), '.config/teleme/config.json')

const htmlEntities = [
  { regex: /&/g, entity: '&amp;' },
  { regex: />/g, entity: '&gt;' },
  { regex: /</g, entity: '&lt;' },
  { regex: /"/g, entity: '&quot;' },
];

let text = 'Command completed'
if (process.argv.length > 2) {
  if (process.argv[2] === '--help') {
    console.log(`
  Usage
    $ tlm <message>
    OR
    $ teleme <message>
  Examples
    $ teleme
    $ tlm
    $ teleme "My sexy message ❤️ "
  See https://github.com/txchen/teleme for detailed instruction.
  `)
    process.exit()
  }
  text = process.argv[2]
}

// read config from ~/.config/teleme/config.json
if (!fs.existsSync(configFileName)) {
  if (!fs.existsSync(path.join(homedir, '.config'))) {
    fs.mkdirSync(path.join(homedir, '.config'))
  }
  if (!fs.existsSync(path.join(homedir, '.config/teleme'))) {
    fs.mkdirSync(path.join(homedir, '.config/teleme'))
  }
  fs.writeFileSync(configFileName, '{}')
}

let configObj
try {
  configObj = JSON.parse(fs.readFileSync(configFileName))
} catch (e) {
  console.error(`[ERROR] - failed to read config from "${configFileName}"`, e)
  process.exit(2)
}

if (!configObj.token || !configObj.chatid) {
  console.error(
    `[ERROR] - 'token' or 'chatid' not defined in config file: "${configFileName}"`
  )
  process.exit(2)
}

for (ent of htmlEntities){
  text = text.replace(ent.regex, ent.entity)
}
text = text.split('\\n').join('\n') // to support multiline string in cli

text += `<pre>[${hostname}:${process.cwd()}]</pre>`

// call telegram REST api
const jsonPayload = JSON.stringify({
  text,
  chat_id: configObj.chatid,
  parse_mode: 'HTML',
})

const https = require('https')
const req = https.request(
  {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${configObj.token}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': jsonPayload.length
    }
  },
  res => {
    if (res.statusCode !== 200) {
      console.error(`[ERROR] - failed to call telegram api, status code: ${res.statusCode}`)
    }
  }
)

req.on('error', e => {
  console.error(e)
})

req.write(jsonPayload)
req.end()
