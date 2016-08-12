import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryLinks = ({ dispatch, getState }) => {
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

  api.doLinks = ({ serviceName}) => {
    const serviceDoc = api('factoryServices').getByName({ name: serviceName })
    const docs = getState().docs.filter(doc => doc.serviceID == serviceDoc._id)

    let module = {}

    docs.map(doc => module[doc.name] = { from: doc.from })

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
