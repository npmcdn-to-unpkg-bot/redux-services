import cuid                 from 'cuid'
import { error, write }     from 'redux-journal'
import { daemonServices }   from 'redux-services'

daemonServices().config({
  security:         { priority: 11,  from: 'redux-services/security', },
  journal:          { priority: 12,  from: 'redux-services/journal', },
  logger:           { priority: 13,  from: 'redux-services/logger', },
  services:         { priority: 14,  from: 'redux-services/services', },
  factoryAction:    { priority: 100, from: 'redux-services/factoryAction', },
  factoryCode:      { priority: 100, from: 'redux-services/factoryCode', },
  factoryComponent: { priority: 100, from: 'redux-services/factoryComponent', },
  factoryElement:   { priority: 100, from: 'redux-services/factoryElement', },
  factoryLink:      { priority: 100, from: 'redux-services/factoryLink', },
  factoryProp:      { priority: 100, from: 'redux-services/factoryProp', },
  factoryService:   { priority: 100, from: 'redux-services/factoryService', },
  factoryStyle:     { priority: 100, from: 'redux-services/factoryStyle', },
  factory:          { priority: 110, from: 'redux-services/factory', },
  uiWeb:            { priority: 200, from: 'redux-services/uiWeb', },
  router:           { priority: 210, from: 'reudx-services/router', },
  designer:         { priority: 300, from: 'redux-services/designer', },
}).run().then(api => {
  const factory           = api.get('factory')
  const services          = api.get('services')
  const factoryAction     = api.get('factoryAction')
  const factoryCode       = api.get('factoryCode')
  const factoryComponent  = api.get('factoryComponent')
  const factoryElement    = api.get('factoryElement')
  const factoryLink       = api.get('factoryLink')
  const factoryProp       = api.get('factoryProp')
  const factoryService    = api.get('factoryService')

  const service1 = { _id: cuid(), name: 'imgur' }
  factoryService.do.insert(service1)

  const link1 = { _id: cuid(), serviceID: service1._id, name: 'fetch', from: 'redux-services/fetch' }
  factoryLink.do.insert(link1)

  const service2 = { _id: cuid(), name: 'security' }
  factoryService.do.insert(service2)

  const service3 = { _id: cuid(), name: 'location' }
  factoryService.do.insert(service3)

  const action1 = {
    _id: cuid(),
    serviceID: service1._id,
    name: 'upload',

    saga: '1',
    sagaInsert: '1',

    request: '1',
    success: '1',
    failure: '1',

    api: '1',
  }
  factoryAction.do.insert(action1)

  api.get('designer').api.run({ api })
}).catch((e) => {
  error(e)
  if (e.stack) write(e.stack)
})

// const services = api.get('services')
// const factoryActions = api.get('factoryActions')
// const factoryCode = api.get('factoryCode')
// const factoryComponent = api.get('factoryComponent')
// const factoryElement = api.get('factoryElement')
// const factoryLinks = api.get('factoryLinks')
// const factoryProp = api.get('factoryProp')
// const factoryStyle = api.get('factoryStyle')
//
// const service1 = { _id: cuid(), name: 'imgur' }
// factoryService.do.insert(service1)
//
// const link1 = { _id: cuid(), serviceID: service1._id, name: 'fetch', from: 'redux-services/fetch' }
// factoryLinks.do.insert(link1)
//
// const link2 = { _id: cuid(), serviceID: service1._id, name: 'config', from: 'redux-services/servicesConfig' }
// factoryLinks.do.insert(link2)
//
// const prepareFuncText = (s) => s.slice(s.indexOf('{') + 1, -1)
//
// const action1 = { _id: cuid(), serviceID: service1._id,
//   name: 'upload',
//
//   saga: true,
//   sagaInsert: true,
//
//   request: true,
//   success: true,
//   failure: true,
//
//   api: true,
//   apiCode: `return this.api('fetch').fetch('https://api.imgur.com/3/image', {
//         method: 'POST',
//         headers: {
//           Authorization: 'Client-ID ' + payload.clientID,
//           Accept: 'application/json'
//         },
//         body: payload.imageBase64
//       }).then(function (response) {
//         return response.json();
//       }).then(function (json) {
//         if (json.success && json.status == 200) {
//           return { imageURL: json['data']['link'] };
//         } else {
//           throw new Error(json.error);
//         }
//       })`,
// }
//
// factoryActions.do.insert(action1)
//
// const action2 = { _id: cuid(), serviceID: service1._id,
//   name: 'removeDocsOverMax',
//
//   saga: true,
//   sagaType: 'INSERT',
//
//   api: true,
//   apiCode: `
//       var apiConfig = this.api('config')
//       var docsMax = apiConfig ? apiConfig.get({ name: 'imgur.docsMax' }) || 2 : 2
//       var index = this.getState().docs.length - docsMax
//       while (index-- > 0) {
//         var _id = this.getState().docs[0]._id
//         this.do.remove({ _id: _id })
//       }
//     `
// }
//
// factoryActions.do.insert(action2)
//
// const component1 = { _id: cuid(), name: 'ImgurUploader', serviceID: service1._id, }
// factoryComponent.do.insert(component1)
//
// const component1Prop1 = { _id: cuid(), componentID: component1._id, name: 'onUpload', type: 'func', }
// factoryProp.do.insert(component1Prop1)
//
// const component1Code1 = { _id: cuid(), componentID: component1._id, name: `onLoad`, value: `
//     var result = payload.target.result
//     var imageBase64 = result.replace(/^data:image\\/[^]+base64,/, '')
//   `}
// factoryCode.do.insert(component1Code1)
//
// const element1 = { _id: cuid(), name: 'Root', tag: 'Paper', componentID: component1._id, }
// factoryElement.do.insert(element1)
//
// factoryStyle.do.insert({ elementID: element1._id, name: `backgroundColor`, value: `#eeee01` })
// factoryStyle.do.insert({ elementID: element1._id, name: `minHeight`, value: `10vh` })
// factoryStyle.do.insert({ elementID: element1._id, name: `position`, value: `relative` })
// factoryStyle.do.insert({ elementID: element1._id, name: `textAlign`, value: `center` })
// factoryStyle.do.insert({ elementID: element1._id, name: `width`, value: `auto` })
// factoryStyle.do.insert({ elementID: element1._id, name: `height`, value: `auto` })
//
// const element1Code1 = { _id: cuid(), elementID: element1._id, name: `onTouchTap`, value: `
//     this.props.onUpload('BAU WAU')
//   `}
// factoryCode.do.insert(element1Code1)
//
// const element2 = { _id: cuid(), name: 'ImageInput', tag: 'input', type: `file`, componentID: component1._id, parentID: element1._id, }
// factoryElement.do.insert(element2)
//
// const element2Code2 = { _id: cuid(), elementID: element2._id, name: `onChange`, value: `
//     var reader = new FileReader()
//     reader.onload = this.onLoad
//     reader.readAsDataURL(payload.currentTarget.files[0])
//   `}
// factoryCode.do.insert(element2Code2)
//
// factoryStyle.do.insert({ elementID: element2._id, name: `display`, value: `none` })
//
// const element3 = { _id: cuid(), name: 'ImageContainer', tag: 'div', componentID: component1._id, parentID: element1._id, }
// factoryElement.do.insert(element3)
//
// const element4 = { _id: cuid(), name: 'ImageView', tag: 'img', componentID: component1._id, parentID: element3._id, }
// factoryElement.do.insert(element4)
//
// // const resultConfig = require('babel-core').transform(factory.api.doConfig('imgur'), { presets: ["es2015"] })
// // const config = eval(resultConfig.code)
// // console.log(config)
// //
// // const resultActions = require('babel-core').transform(factory.api.doActions(config), { presets: ["es2015"] })
// // const actions = eval(resultActions.code)
// // console.log(actions)
//
// /*
//  services.api.importAlias('redux-imgur/imgur', (...args) =>
//  factory.api.doIndex({ serviceName: 'imgur' }).configService(...args))*/
//
// services.api.config({
//   config:   { priority: 10,   from: 'redux-services/servicesConfig' },
//   security: { priority: 11,   from: 'redux-services/security', },
//   journal:  { priority: 12,   from: 'redux-services/journal', },
//   logger:   { priority: 13,   from: 'redux-services/logger', },
//   fetch:    { priority: 14,   from: 'redux-services/fetch', },
//   imgur:    { priority: 100,  from: 'redux-imgur/imgur', },
//   uiWeb:    { priority: 1000, from: 'redux-services/uiWeb', }
// })
//
//
//   .run().then((api) => {
//   const imgur = api.get('imgur')
//   const config = api.get('config')
//   const uiWeb = api.get('uiWeb')
//
//   console.log('examples/uiWeb/src/client.js', imgur)
//
//   config.api.set({ name: 'imgur.docsMax', value: 1 })
//
//   uiWeb.api.set({ name: 'title', value: 'redux-service title' })
//   uiWeb.api.run({ store: api.getStore(), Root: imgur.components[0].reactClass })
// })
