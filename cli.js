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
    OR if you want to use the non-default bot
    $ TLMBOT=bot2 teleme <message>
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

let tokenKey = 'token'
let chatidKey = 'chatid'
if (process.env.TLMBOT != null && process.env.TLMBOT.length) {
  tokenKey = process.env.TLMBOT + '_' + tokenKey
  chatidKey = process.env.TLMBOT + '_' + chatidKey
}

if (!configObj[tokenKey] || !configObj[chatidKey]) {
  console.error(
    `[ERROR] - '${tokenKey}' or '${chatidKey}' not defined in config file: "${configFileName}"`
  )
  process.exit(2)
}

for (ent of htmlEntities){
  text = text.replace(ent.regex, ent.entity)
}
text = text.split('\\n').join('\n') // to support multiline string in cli

text += `\n<pre>[${hostname}:${process.cwd()}]\n${new Date().toISOString()}</pre>`

// call telegram REST api
const jsonPayload = JSON.stringify({
  text,
  chat_id: configObj[chatidKey],
  parse_mode: 'HTML',
})

const https = require('https')
const req = https.request(
  {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${configObj[tokenKey]}/sendMessage`,
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
