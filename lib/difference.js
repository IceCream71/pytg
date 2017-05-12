'use strict'
const client = require('./initTelegram')

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
        await mongoClient.collection('telegram_data').insert(messages)
      }
    }
    // setTimeout(getChannelDifference, 22000)
  } catch (error) {
    throw new Error(error)
  }
}


module.exports = {
  getDifference,
  getChannelDifference
}
