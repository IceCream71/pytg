'use strict'

const MTProto = require('telegram-mtproto').MTProto
const app = require('../config/app.json').app
const api = {
  invokeWithLayer: 0xda9b0d0d,
  layer          : 57,
  initConnection : 0x69796de9,
  api_id         : app.id
}
const server = {
  dev     : false,
  webogram: false
}

const client = MTProto({ server, api })
module.exports = client
