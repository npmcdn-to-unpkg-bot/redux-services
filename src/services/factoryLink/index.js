import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryLink = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    do: {},
    links: {
      journal: { from: 'redux-services/journal' },
      factoryService: { from: 'redux-service/factoryService', },
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const write = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  api.doLinks = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `api.doLinks`)
    const { serviceName } = payload
    const serviceDoc = api('factoryService').getByName({ name: serviceName })
    const docs = getState().docs.filter(doc => doc.serviceID == serviceDoc._id)

    let module = {}

    docs.map(doc => module[doc.name] = { from: doc.from })

    return module
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
