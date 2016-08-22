import cuid                 from 'cuid'
import { error, write }     from 'redux-journal'
import { daemonServices }   from 'redux-services'

daemonServices().config({
  security:         { priority: 0,  from: 'redux-services/security', },
  journal:          { priority: 1,  from: 'redux-services/journal', },
  logger:           { priority: 1,  from: 'redux-services/logger', },
  services:         { priority: 1,  from: 'redux-services/services', },
  factoryActions:   { priority: 10, from: 'redux-services/factoryActions', },
  factoryComponent: { priority: 10, from: 'redux-services/factoryComponent', },
  factoryElement:   { priority: 10, from: 'redux-services/factoryElement', },
  factoryLinks:     { priority: 10, from: 'redux-services/factoryLinks', },
  factoryService:   { priority: 10, from: 'redux-services/factoryService', },
  factory:          { priority: 20, from: 'redux-services/factory', },
}).run().then((api) => {
  const services = api.get('services')
  const factory = api.get('factory')
  const factoryActions = api.get('factoryActions')
  const factoryComponent = api.get('factoryComponent')
  const factoryElement = api.get('factoryElement')
  const factoryLinks = api.get('factoryLinks')
  const factoryService = api.get('factoryService')

  const service1 = { _id: cuid(), name: 'imgur' }

  factoryService.do.insert(service1)

  const link1 = { _id: cuid(), serviceID: service1._id, name: 'fetch', from: 'redux-services/fetch' }

  factoryLinks.do.insert(link1)

  const link2 = { _id: cuid(), serviceID: service1._id, name: 'config', from: 'redux-services/servicesConfig' }

  factoryLinks.do.insert(link2)

  const prepareFuncText = (s) => s.slice(s.indexOf('{') + 1, -1)

  const action1 = { _id: cuid(), serviceID: service1._id,
    name: 'upload',

    saga: true,
    sagaInsert: true,

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
          return { imageURL: json['data']['link'] };
        } else {
          throw new Error(json.error);
        }
      })`,
  }

  factoryActions.do.insert(action1)

  const action2 = { _id: cuid(), serviceID: service1._id,
    name: 'removeDocsOverMax',

    saga: true,
    sagaType: 'INSERT',

    api: true,
    apiCode: `
      var apiConfig = this.api('config')
      var docsMax = apiConfig ? apiConfig.get({ name: 'imgur.docsMax' }) || 2 : 2
      var index = this.getState().docs.length - docsMax
      while (index-- > 0) {
        var _id = this.getState().docs[0]._id
        this.do.remove({ _id: _id })
      }
    `
  }

  factoryActions.do.insert(action2)

  const component1 = { _id: cuid(), name: 'ImgurUploader', serviceID: service1._id, }

  factoryComponent.do.insert(component1)

  const element1 = { _id: cuid(), name: 'Root', tag: 'div', componentID: component1._id, }
  factoryElement.do.insert(element1)

  const element2 = { _id: cuid(), name: 'ImageContainer', tag: 'div', componentID: component1._id, parentID: element1._id, }
  factoryElement.do.insert(element2)

  const element3 = { _id: cuid(), name: 'Image', tag: 'img', componentID: component1._id, parentID: element2._id, }
  factoryElement.do.insert(element3)



  // const resultConfig = require('babel-core').transform(factory.api.doConfig('imgur'), { presets: ["es2015"] })
  // const config = eval(resultConfig.code)
  // console.log(config)
  //
  // const resultActions = require('babel-core').transform(factory.api.doActions(config), { presets: ["es2015"] })
  // const actions = eval(resultActions.code)
  // console.log(actions)

  services.api.importAlias('redux-imgur/imgur', (...args) =>
    factory.api.doIndex({ serviceName: 'imgur' }).configService(...args))

  return services.api.config({
    config:   { priority: 10,   from: 'redux-services/servicesConfig' },
    security: { priority: 11,   from: 'redux-services/security', },
    journal:  { priority: 12,   from: 'redux-services/journal', },
    logger:   { priority: 13,   from: 'redux-services/logger', },
    fetch:    { priority: 14,   from: 'redux-services/fetch', },
    imgur:    { priority: 100,  from: 'redux-imgur/imgur', },
    uiWeb:    { priority: 1000, from: 'redux-services/uiWeb', },
  }).run().then((api) => {
    const imgur = api.get('imgur')

    console.log(imgur)
    // const config = api.get('config')
    // const uiWeb = api.get('uiWeb')
    //
    // config.api.set({ name: 'imgur.docsMax', value: 1 })
    //
    // uiWeb.api.set({ name: 'title', value: 'redux-service title' })
    // uiWeb.api.run({ store: api.getStore() })
  })

}).catch((e) => {
  error(e)
  if (e.stack) write(e.stack)
})
