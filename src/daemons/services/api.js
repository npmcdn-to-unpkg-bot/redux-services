import Promise            from 'bluebird'
import _                  from 'lodash'

import { applyMiddleware }  from 'redux'
import { combineReducers }  from 'redux'
import { createStore }      from 'redux'

import { warning, write, error } from 'redux-journal'

import { actions }        from './actions'
import { DAEMON, TAGS }   from './config'
import { select }         from './select'

import { DAEMON as DAEMON_EDGES } from '../edges/config'

const tags = `${TAGS}.api`

const nsReducer = (reducer, __ns__) => (state, action) => (
  action.__ns__ == __ns__ || typeof state === 'undefined' ? reducer(state, action) : state
)

export const configAPI = (
  { manager, daemonName = DAEMON, daemonEdges = DAEMON_EDGES } =
  {          daemonName:  DAEMON, daemonEdges:  DAEMON_EDGES}
) => {
  let store
  let serviceHash = {}

  const api =       () => {}
  const apiEdges =  () => manager.api.get(daemonEdges)

  const state =       () => manager.getStore().getState()[daemonName]
  const stateEdges =  () => manager.getStore().getState()[daemonEdges]

  const createGetState   = (serviceName) => () => store.getState()[serviceName]
  const createDispatch   = (serviceName) => (payload) => store.dispatch({ ...payload, __ns__: serviceName })

  api.get = (serviceName) => {
    const result = serviceHash[serviceName]
    if (result) return result
    const e = `Cannot find service = ${serviceName}`
    warning(e, `${tags}.get`)
    throw new Error(e)
  }

  api.getStore = () => store

  api.switchLink = (sourceServiceName, linkName, destinationServiceName) => {
    write(`(${sourceServiceName}, ${linkName}, ${destinationServiceName})`, `${tags}.switchLink`)
    const sourceService = api.get(sourceServiceName)
    const destinationService = api.get(destinationServiceName)
    const links = sourceService.links || {}
    const currentLink = links[linkName] || {}
    const nextLinks = { ...sourceService.links, [linkName]: { ...currentLink, service: destinationService }}
    sourceService.linksUpdate(nextLinks)
    sourceService.links = nextLinks
  }

  api.config = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.config`)
    _.each(payload, (serviceConfig, serviceName) => {
      api.insert({ name: serviceName, ...serviceConfig })
    })
    return api
  }

  const serviceCreate = (serviceDoc) => {
    try {
      const serviceName = serviceDoc.name
      const [moduleName, submoduleName] = serviceDoc.from.split('/')
      // TODO: WEBPACK FIX WITH DYNAMIC NAMES
      const configService = require('redux-services')[submoduleName]
      if (configService) {
        const serviceInstance = configService({
          dispatch: createDispatch(serviceName),
          getState: createGetState(serviceName)
        })
        return serviceInstance
      } else {
        throw new Error(`Cannot create service ${JSON.stringify(serviceDoc)}`)
      }
    } catch (e) {
      warning(e, `${tags}`)
    }
  }

  const initLinks = (serviceInstance) => {
    const links = serviceInstance.links || {}
    _.each(links, (value, name) => {
      value.service = api.get(name)
    })
  }

  api.run = (payload) => Promise.try(() => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.run`)
    serviceHash = {}

    const servicesSelector = select(state())
    const serviceInstanceList = servicesSelector.docs.sort((s1, s2) => s1.priority > s2.priority)
      .map(serviceDoc => {
        const service = serviceCreate(serviceDoc)
        if (service) {
          service.name = serviceDoc.name
          serviceHash[serviceDoc.name] = service
          return service
        } else {
          warning(`Service '${serviceDoc.name}' return nothing after init`)
        }
      })
      .filter(service => service)

    const createStoreWithMiddleware = applyMiddleware(
      ...serviceInstanceList.filter(serviceInstance => serviceInstance.middleware)
        .map(serviceInstance => serviceInstance.middleware)
    )(createStore)

    const rootReducer = combineReducers(_.fromPairs(
      serviceInstanceList.filter(serviceInstance => serviceInstance.reducer)
        .map(serviceInstance => [serviceInstance.name, nsReducer(serviceInstance.reducer, serviceInstance.name)])
    ))

    serviceInstanceList.map(serviceInstance => initLinks(serviceInstance))

    store = createStoreWithMiddleware(rootReducer)

    return api
  })

  api.insert = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.insert`)
    manager.dispatch(actions.insert(payload), daemonName)
  }

  api.remove = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.remove`)
    manager.dispatch(actions.remove(payload), daemonName)
  }

  api.update = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.update`)
    manager.dispatch(actions.update(payload), daemonName)
  }

  return api
}
