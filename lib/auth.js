'use strict'
const client = require('./initTelegram')
const app = require('../config/app.json').app
const inputField = require('./utils/fixtures').inputField
const phone = {
  num: '+989378779889'
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
