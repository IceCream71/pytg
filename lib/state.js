'use strict'
const client = require('./initTelegram')
const getState = async (updatesState) => {
  try {
    const resultState = await client('updates.getState', {})
    updatesState.seq = resultState.seq
    updatesState.pts = resultState.pts
    updatesState.date = resultState.date
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = getState
