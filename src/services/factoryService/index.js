import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryService = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    do: {},
    links: {
      journal: { from: 'redux-services/journal' }
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const warning = (payload, name) => api('journal').warning(payload, `${tags}.${name}`)
  const write   = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  api.getByName = ({ name }) => {
    const doc = getState().docs.find(doc => doc.name == name)
    if (doc) return doc
    warning(`Cannot find serviceName == ${name}`, `api.getByName`)
  }

  service.do.insert = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `do.insert`)
    dispatch(actions.insert(payload))
  }

  service.do.remove = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `do.remove`)
    dispatch(actions.remove(payload))
  }

  service.do.update = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `do.update`)
    dispatch(actions.update(payload))
  }

  return service
}
