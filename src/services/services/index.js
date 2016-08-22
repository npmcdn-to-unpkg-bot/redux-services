import Promise              from 'bluebird'
import { applyMiddleware }  from 'redux'
import { combineReducers }  from 'redux'
import { createStore }      from 'redux'

import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

const nsReducer = (reducer, __ns__) => (state, action) => (
  action.__ns__ == __ns__ || typeof state === 'undefined' ? reducer(state, action) : state
)

const decodeFrom = (from) => from.split('/')

const createService = (serviceDoc, importModule, dispatch, getState) => {
  const configService = importModule(serviceDoc.from)
  if (configService) {
    return configService({ dispatch, getState })
  }
  throw new Error(`Cannot create service ${JSON.stringify(serviceDoc)}`)
}

export const services = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let aliasMap = {}
  let serviceHash = {}

  let service = {
    links: {
      journal: { from: 'redux-services/journal' }
    },
    reducer: require('./reducer').reducer,
    store: {}
  }

  const createGetState  = (serviceName) => () => service.store.getState()[serviceName]
  const createDispatch  = (serviceName) => (payload) => service.store.dispatch({ ...payload, __ns__: serviceName })

  let api = service.api = (name) => service.links[name].service.api

  const write   = (payload, name) => api('journal').write(payload, `${tags}.${name}`)
  const warning = (payload, name) => api('journal').warning(payload, `${tags}.${name}`)

  api.get = (serviceName) => {
    const service = serviceHash[serviceName]
    if (service) return service
    throw new Error(`Cannot find service ${serviceName}`)
  }

  api.getStore = () => service.store

  api.importAlias = (from, serviceConfig) => {
    aliasMap[from] = serviceConfig
  }

  const initLinks = (service) => {
    const keys = Object.keys(service.links || {})
    let index = keys.length
    while (index--) {
      const name = keys[index]
      service.links[name].service = api.get(name)
    }
  }

  const importModule = (from) => {
    if (aliasMap[from]) return aliasMap[from]
    const [fromModule, fromSub] = decodeFrom(from)
    // TODO: WEBPACK FIX WITH DYNAMIC NAMES
    return require('redux-services')[fromSub]
  }

  api.config = (payload) => {
    write(`(${JSON.stringify(payload)})`, `config`)
    const keys = Object.keys(payload)
    let index = keys.length
    while (index--) {
      const name = keys[index]
      const current = payload[name]
      api.insert({ name, ...current })
    }
    return api
  }

  const reducerHash = () => {
    let hash = {}
    const keys = Object.keys(serviceHash)
    let index = keys.length
    while (index--) {
      const name = keys[index]
      const service = serviceHash[name]
      if (service.reducer) hash[name] = service.reducer
    }
    return hash
  }

  api.run = (payload) => Promise.try(() => {
    write(`(payload = ${JSON.stringify(payload)})`, `run`)

    let sagaMiddleware

    api.insert({ name: 'saga', priority: 0, from: 'redux-services/saga' })

    const serviceList = getState().docs.sort((s1Doc, s2Doc) => s1Doc.priority > s2Doc.priority)
      .map(serviceDoc => {
        const service = createService(serviceDoc, importModule,
          createDispatch(serviceDoc.name),
          createGetState(serviceDoc.name)
        )
        if (serviceDoc.name == 'saga') sagaMiddleware = service.middleware
        if (service) return serviceHash[serviceDoc.name] = service
        warning(`Service '${serviceDoc.name}' return nothing`)
      }).filter(service => service)

    const createStoreWithMiddleware = applyMiddleware(
      ...serviceList.map(s => s.middleware).filter(m => m)
    )(createStore)

    const rootReducer = combineReducers(reducerHash())

    serviceList.map(service => initLinks(service))

    service.store = createStoreWithMiddleware(rootReducer)

    serviceList.map(service => {
      if (service.saga) sagaMiddleware.run(service.saga.root)
    })

    return api
  })

  api.insert = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `insert`)
    dispatch(actions.insert(payload))
  }

  api.remove = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `remove`)
    dispatch(actions.remove(payload))
  }

  api.update = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `update`)
    dispatch(actions.update(payload))
  }

  return service
}
