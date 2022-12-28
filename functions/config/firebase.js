const fbAdmin = require('firebase-admin')
const functions = require('firebase-functions')
const serviceAccount = require('./service-functions-account.json')
const extraConfigs = require('./service-extra-configs.json')

let loaded = false

if (!loaded) {
  loaded = true
}

const admin = fbAdmin.initializeApp({
  credential: fbAdmin.credential.cert(serviceAccount)
})

const firestore = admin.firestore()
firestore.settings({})

const firebase = {
  app: fbAdmin,
  admin,
  //db: firestore,
  functions
  //timestamp: fbAdmin.firestore.FieldValue.serverTimestamp
}

module.exports = firebase