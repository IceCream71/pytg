'use strict'
const path = require('path')
const os = require('os')
let channels = require('./channels.json')
const MTProto = require('telegram-mtproto').MTProto
const inputField = require('./utils/fixtures').inputField
const fs = require('fs')
const MongoClient = require('mongodb').MongoClient
const jsonFile = require('jsonfile')
const app = require('./config/app.json').app
const api = {
  invokeWithLayer: 0xda9b0d0d,
  layer          : 57,
  initConnection : 0x69796de9,
  api_id         : app.id
}
const phone = {
  num: '+989378779889'
}
const server = {
  dev     : false,
  webogram: false
}

let trackingMessages = []
let mongoClient
let viewsQueue = []
const client = MTProto({ server, api })
const updatesState = {
  seq : 0,
  pts : 0,
  date: 0
}
const cycles = 10
const messageTracker = async function(){
  try {
    if (this.cycle < cycles) {
      const lastViews = this.trackCycles[this.trackCycles.length - 1].views
      console.log(`cycle: ${this.cycle} -- updating message with id: ${this.id}, before update views: ${lastViews}`)
      let start = (new Date()).getTime()
      start = Math.floor(start / 1000)
      const views = await client('messages.getMessagesViews', {
        peer: {
          _          : 'inputPeerChannel',
          channel_id : channels.id,
          access_hash: channels.access_hash
        },
        id       : [this.id],
        increment: false
      })
      this.trackCycles.push({
        date : start,
        views: views[0]
      })
      console.log(`updated message with id: ${this.id}, after update views: ${views[0]}`)
      this.cycle += 1
      setTimeout(this.tracker, 30000)
    } else {
      delete this.tracker
      console.log(`storing message with id: ${this.id} into DB`)
      await saveToDb(this)
      console.log(`message with id: ${this.id} stored into DB`)
    }
  } catch (error) {
    throw error
  }
}
const addTrackCycle = function(views) {
  try {
    console.log(`new views count: ${views} received`)
    let date = (new Date()).getTime()
    date = Math.floor(date / 1000)
    this.trackCycles.push({
      date,
      views
    })
    console.log(`views count: ${views} saved`)
  } catch (error) {
    console.log(`Error in addTrackCycle for message with id: ${this.id} and views argument ${views}`)
  }
}
const getMessagesViews = async function() {
  const queue = viewsQueue.slice()
  viewsQueue = []
  try {
    if (queue.length){
      console.log(`getMessagesViews with vector: ${queue}`)
      const viewsArray = await client('messages.getMessagesViews', {
        peer: {
          _          : 'inputPeerChannel',
          channel_id : channels.id,
          access_hash: channels.access_hash
        },
        id       : queue,
        increment: false
      })
      console.log(`getMessagesViews with vector: ${queue} has been fetched with result: ${viewsArray}`)
      console.log('updating messages')
      queue.forEach((messageId, index) => {
        const message = trackingMessages.find(msg => msg.id == messageId)
        if (message){
          message.addTrackCycle(viewsArray[index])
        }
      })
      console.log('updating messages done')
    }
    setTimeout(getMessagesViews, 5000)
  } catch (error) {
    console.log(`Error in getMessagesViews with queue: ${queue}`)
  }
}
const viewRequest = async function() {
  try {
    if (this.cycle < cycles) {
      console.log(`Submit a get view request for message with id: ${this.id}`)
      const inArray = viewsQueue.find(element => element === this.id)
      if (!inArray) {
        viewsQueue.push(this.id)
        console.log(`Get view request for message with id: ${this.id} submitted`)
        this.cycle += 1
      } else {
        console.log('previous request doesn\'t get process yet')
      }
      setTimeout(this.viewRequest, 30000)
    } else {
      delete this.tracker
      delete this.addTrackCycle
      delete this.viewRequest
      console.log(`storing message with id: ${this.id} into DB`)
      await saveToDb(this)
      console.log(`message with id: ${this.id} stored into DB`)
    }
  } catch (error) {
    console.log(`viewRequest error: ${error}`)
  }
}
const saveToDb = async (obj) => {
  // obj could be a single object or an array
  await mongoClient.collection('telegram_data').insert(obj)
  return
}

const logout = async () => {
  await client('auth.logOut', {})
  console.log('logged out')
  return true
}
const login = async () => {
  try {
    const { phone_code_hash } = await client('auth.sendCode', {
      phone_number  : phone.num,
      current_number: false,
      api_id        : app.id,
      api_hash      : app.hash
    }, { createNetworker: true })
    console.log(phone_code_hash)
    const code = await inputField('code')
    phone.code = code
    const result = await client('auth.signIn', {
      phone_number: phone.num,
      phone_code_hash,
      phone_code  : phone.code
    })
    return result.user
  } catch (error){
    throw new Error(error)
  }
}

const getHistory = async (channel) => {
  try {
    const limit = 200
    const offset = 0
    // const min_id = channel.min_id && channel.min_id !== 0 ? channel.min_id : 0
    const min_id = 0
    console.log('Fetching history')
    const result = await client('messages.getHistory', {
      peer: {
        _          : 'inputPeerChannel',
        channel_id : channel.id,
        access_hash: channel.access_hash
      },
      min_id,
      max_id: 0,
      offset,
      limit
    })
    console.log('History fetched')
    const messages = result.messages
    /*const messages = result.messages.filter((message) => {
      const { date } = message
      let nowTime = (new Date()).getTime()
      nowTime = Math.floor(nowTime / 1000)
      // return Math.abd(date - nowTime) < 60
      return true
    })*/
    if (messages.length) {
      messages.forEach( message => message.channel = channel)
      await saveToDb(messages)
      /*channels.min_id = messages[messages.length - 1].id
      trackingMessages = trackingMessages.concat(messages)
      console.log(`${messages.length} new messages added in tracking loop`)
      messages.forEach((element) => {
        element.trackCycles = [{
          date : element.date,
          views: element.views
        }]
        element.cycle = 0
        element.tracker = messageTracker.bind(element)
        element.addTrackCycle = addTrackCycle.bind(element)
        element.viewRequest = viewRequest.bind(element)
        setTimeout(element.viewRequest, 30000)
      })*/
    }
    // setTimeout(getMessagesViews, 5000)
    // setTimeout(getHistory, 22000)
    return true
  } catch (error) {
    throw new Error(error)
  }
}

const getState = async () => {
  try {
    const resultState = await client('updates.getState', {})
    updatesState.seq = resultState.seq
    updatesState.pts = resultState.pts
    updatesState.date = resultState.date
  } catch (error) {
    throw new Error(error)
  }
}

const getChannelDifference = async (channelID, pts) => {
  try {
    const channel = channels.find(element => element.id === channelID)
    if (!channel) {
      return false
    }
    channel.updateState = channel.updateState ? channel.updateState : { pts }
    console.log(`Fetching channel ${channel.id} difference`)
    const differenceResult = await client('updates.getChannelDifference', {
      channel: {
        _          : 'inputPeerChannel',
        channel_id : channel.id,
        access_hash: channel.access_hash
      },
      pts   : channel.updateState.pts,
      filter: {
        _: 'channelMessagesFilterEmpty'
      },
      limit: 30
    })
    console.log('Difference fetched')
    console.log(differenceResult)
    channel.updateState.pts = differenceResult.pts
    if (differenceResult._ === 'updates.channelDifference') {
      const messages = differenceResult.new_messages
      if (messages.length) {
        messages.forEach( message => message.channel = channel)
        await saveToDb(messages)
      }
    }
    // setTimeout(getChannelDifference, 22000)
  } catch (error) {
    throw new Error(error)
  }
}

const processUpdate = async (update) => {
  let channelID
  switch (update._) {
    case 'updateNewChannelMessage':
    case 'updateEditChannelMessage':
      channelID = update.message.to_id.channel_id
      break
    case 'updateChannelTooLong':
      channelID = update.channel_id
      break
  }
  if (channelID)
    await getChannelDifference(channelID, update.pts)
}

const getDifference = async (first) => {
  try {
    console.log(`Fetching difference`)
    const date = first ? Math.floor((new Date()).getTime() / 1000) - 9000 : updatesState.date
    const differenceResult = await client('updates.getDifference', {
      pts: updatesState.pts,
      date,
      qts: -1
    })
    console.log('Difference fetched')
    console.log(differenceResult)
    if (differenceResult._ === 'updates.differenceEmpty') {
      updatesState.date = differenceResult.date
      updatesState.seq = differenceResult.seq
      setTimeout(getDifference, 20000)
      return false
    }
    // channels = differenceResult.chats
    const nextState = differenceResult.intermediate_state || differenceResult.state
    updatesState.seq = nextState.seq
    updatesState.pts = nextState.pts
    updatesState.date = nextState.date
    differenceResult.other_updates.forEach(update => {
      switch (update._) {
        case 'updateChannelTooLong':
        case 'updateNewChannelMessage':
        case 'updateEditChannelMessage':
          processUpdate(update)
          break
      }
    })
    setTimeout(getDifference, 20000)
  } catch (error) {
    throw new Error(error)
  }
}

const dialogList = async () => {
  const dialogs = await client('messages.getDialogs')
  const { chats } = dialogs
  console.log(chats)
  return true
}

async function run(){
  try {
    mongoClient = await MongoClient.connect('mongodb://localhost:27017/telegram')
    const user = await login()
    console.log(`logged in as ${user.first_name} - ${user.last_name}`)
    await getState()
    // await getHistory(channels[i])
    // setTimeout(getMessagesViews, 9000)
    // await getChannelDifference()
    await dialogList()
    await getDifference()
  } catch (error) {
    console.log('error catch')
    console.log('error:', error)
    process.exit()
  }
}
run()

async function exitHandler() {
  console.log('loggingOut')
  jsonFile.writeFileSync('dataBase.json', trackingMessages, { spaces: 2 })
  await logout()
}
process.on('exit', exitHandler)
process.on('SIGINT', () => {
  process.exit(0)
})
