import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryAction = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    do: {},
    links: {
      journal: { from: 'redux-services/journal' },
      factoryService: { from: 'redux-services/factoryService', },
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const write = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  const prepareFuncText = (s) => s.slice(s.indexOf('{') + 1, -1)

  api.generateActions = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `api.generateActions`)
    const { serviceName } = payload
    const serviceDoc = api('factoryService').getByName({ name: serviceName })
    const docs = getState().docs.filter(doc => doc.serviceID == serviceDoc._id)

    let module = {
      api: [],
      actions: {
        regular: [],
        request: [],
        success: [],
        failure: [],
        saga: [],
      }
    }

    docs.map(doc => {
      const action = doc.name
      const type = action.toUpperCase()
      const typeRequest = `${type}_REQUEST`
      const typeSuccess = `${type}_SUCCESS`
      const typeFailure = `${type}_FAILURE`
      module.actions.regular.push({ action, type })
      if (doc.request) module.actions.request.push({ action: `${action}Request`, type: typeRequest })
      if (doc.success) module.actions.success.push({ action: `${action}Success`, type: typeSuccess })
      if (doc.failure) module.actions.failure.push({ action: `${action}Failure`, type: typeFailure })
      if (doc.saga) module.actions.saga.push({
        action,
        insert: doc.sagaInsert,
        sagaType: doc.sagaType,
        type,
        request: doc.request, success: doc.success, failure: doc.failure
      })
      if (doc.api == true) {
        module.api.push({ name: action, code: doc.apiCode })
      }
    })

    return module
  }

  service.do.insert = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `insert`)
    dispatch(actions.insert(payload))
  }

  service.do.remove = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `remove`)
    dispatch(actions.remove(payload))
  }

  service.do.update = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `update`)
    dispatch(actions.update(payload))
  }

  return service
}
