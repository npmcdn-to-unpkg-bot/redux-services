import cuid                 from 'cuid'
import { error, write }     from 'redux-journal'
import { daemonServices }   from 'redux-services'

daemonServices().config({
  security:         { priority: 0,  from: 'redux-services/security', },
  journal:          { priority: 1,  from: 'redux-services/journal', },
  logger:           { priority: 1,  from: 'redux-services/logger', },
  services:         { priority: 1,  from: 'redux-services/services', },
  factoryActions:   { priority: 10, from: 'redux-services/factoryActions', },
  factoryLinks:     { priority: 10, from: 'redux-services/factoryLinks', },
  factoryServices:  { priority: 10, from: 'redux-services/factoryServices', },
  factory:          { priority: 20, from: 'redux-services/factory', },
}).run().then((api) => {
  const services = api.get('services')
  const factory = api.get('factory')
  const factoryActions = api.get('factoryActions')
  const factoryLinks = api.get('factoryLinks')
  const factoryServices = api.get('factoryServices')

  const service1 = { _id: cuid(), name: 'imgur' }

  factoryServices.api.insert(service1)

  const link1 = { _id: cuid(), serviceID: service1._id, name: 'fetch', from: 'redux-services/fetch' }

  factoryLinks.api.insert(link1)

  const prepareFuncText = (s) => s.slice(s.indexOf('{') + 1, -1)

  const action1 = { _id: cuid(), serviceID: service1._id,
    name: 'upload',

    saga: true,

    request: true,
    success: true,
    failure: true,

    api: true,
    apiCode: `return this.api('fetch').fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: 'Client-ID ' + payload.clientID,
          Accept: 'application/json'
        },
        body: payload.imageBase64
      }).then(function (response) { 
        return response.json();
      }).then(function (json) {
        if (json.success && json.status == 200) {
          return json['data']['link'];
        } else {
          throw new Error(json.error);
        }
      })`
  }

  factoryActions.api.insert(action1)

  const action2 = { _id: cuid(), serviceID: service1._id,
    name: 'removeDocsOverMax',

    saga: true,
    sagaType: 'insert',

    // api: true,
    // apiCode: prepareFuncText((payload => {
    //   const docsMax = 2
    //   const removeLength = getState().docs.length - docsMax
    //   api('journal').write(`removeLength = ${removeLength}`, tags)
    // }).toString())
  }

  factoryActions.api.insert(action2)

  // const resultConfig = require('babel-core').transform(factory.api.doConfig('imgur'), { presets: ["es2015"] })
  // const config = eval(resultConfig.code)
  // console.log(config)
  //
  // const resultActions = require('babel-core').transform(factory.api.doActions(config), { presets: ["es2015"] })
  // const actions = eval(resultActions.code)
  // console.log(actions)

  services.api.importAlias('redux-imgur/imgur', (...args) =>
    factory.api.doIndex({ serviceName: 'imgur' }).configService(...args))

  services.api.config({
    security: { priority: 0,  from: 'redux-services/security', },
    journal:  { priority: 1,  from: 'redux-services/journal', },
    logger:   { priority: 1,  from: 'redux-services/logger', },
    fetch:    { priority: 5,  from: 'redux-services/fetch', },
    imgur:    { priority: 10, from: 'redux-imgur/imgur', },
  }).run().then((api) => {
    const imgur = api.get('imgur')
    console.log(`examples/factory/main.js`, imgur)

    const fileToBase64 = (fileName) => new Buffer(require('fs').readFileSync(fileName)).toString('base64')

    const clientID = 'adcf840e0bf408c'
    const imageBase64 = fileToBase64('test.jpg')

    imgur.api.upload({ clientID, imageBase64 }).then((result) => {
      console.log(result)
    })

    // imgur.api.uploadRequest({ name: 'Wow' })
    // imgur.api.uploadSuccess({ name: 'Bla' })
    // imgur.api.uploadFailure({ error: 'fuck' })
    // imgur.api.insert({ name: 'blaBla' })
  })

}).catch((e) => {
  error(e)
  if (e.stack) write(e.stack)
})
