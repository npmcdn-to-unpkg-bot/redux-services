import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const servicesConfig = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    dispatch,
    do: {},
    getState,
    links: {
      journal: { from: 'redux-services/journal' },
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const write = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  api.get = function(payload) {
    write(`(${JSON.stringify(payload)})`, 'api.get')
    const { name } = payload
    const docs = getState().docs
    let index = docs.length
    while (index--) {
      const current = docs[index]
      if (current.name == name) return current.value
    }
  }.bind(service)

  api.set = function(payload) {
    write(`(${JSON.stringify(payload)})`, 'api.set')
    const { name, value } = payload
    const docs = getState().docs
    let index = docs.length
    while (index--) {
      const current = docs[index]
      if (current.name == name) return this.do.update({ ...current, value })
    }
    return this.do.insert({ name, value })
  }.bind(service)

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
