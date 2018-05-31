# teleme

> simple cli tool that sends message as telegram bot

Can be useful when you run long duration cli tasks.


## Install

```bash
$ npm install --global teleme
```


## Setup

Firstly, you need to create a telegram bot via @botfather, get the bot's token, and the chatid.
The chat can be a group or 1-1 conversation.

Then, put the information into `~/.config/teleme/config.json`, such as:

```json
{
  "token": "TOKEN_OF_THE_BOT",
  "chatid": "12345678"
}
```

Execute `teleme` and you should be able to receive a message from the bot, that's it.

If you need to use it for root user, don't forget to set the config for root as well.


## Usage

```
$ teleme --help

  Usage
    $ tlm <message>
    OR
    $ teleme <message>
  Examples
    $ teleme
    $ tlm
    $ teleme "My sexy message ❤️ "
```

The usage can be flexible, for example:

* After you realize the command is slow, just enter `tlm` or `teleme`.
  ```
  $ some-slow-cmd
  output1
  output2
  ...
  tlm
  ```
* You know the command will take a long time
  ```
  $ some-heavy-task ; teleme
  ```
* Only let me know if there is something wrong
  ```
  $ cmd-that-should-not-fail || teleme 'something weird just happened'
  ```

## License

MIT © [Tianxiang Chen](https://github.com/txchen)
