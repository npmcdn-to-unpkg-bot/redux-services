import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryActions = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    links: {
      journal: { from: 'redux-services/journal' },
      factoryServices: { from: 'redux-services/factoryServices', },
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const write = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  const prepareFuncText = (s) => s.slice(s.indexOf('{') + 1, -1)

  api.doActions = ({ serviceName }) => {
    const serviceDoc = api('factoryServices').getByName({ name: serviceName })
    const docs = getState().docs.filter(doc => doc.serviceID == serviceDoc._id)

    let module = {
      api: [],
      actions: {
        regular: [],
        request: [],
        success: [],
        failure: [],
        saga: {},
      },
    }

    docs.map(doc => {
      const action = doc.name
      const type = action.toUpperCase()
      module.actions.regular.push({ action, type })
      if (doc.request) module.actions.request.push({ action: `${action}Request`, type: `${type}_REQUEST`})
      if (doc.success) module.actions.success.push({ action: `${action}Success`, type: `${type}_SUCCESS` })
      if (doc.failure) module.actions.failure.push({ action: `${action}Failure`, type: `${type}_FAILURE` })
      if (doc.saga) {
        module.actions.saga[action] = { type: doc.sagaType, request: doc.request, success: doc.success, failure: doc.failure }
      }
      if (doc.api == true) {
        module.api.push({ name: action, code: doc.apiCode })
      }
    })

    return module
  }

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
