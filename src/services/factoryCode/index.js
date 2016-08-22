import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryCode = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    api: (name) => service.links[name].service.api,
    do: {},
    links: {
      journal:        { from: 'redux-services/journal' },
    },
    reducer: require('./reducer').reducer,
    warning: (payload, name) => { try { api('journal').warning(payload, `${tags}.${name}`) } catch (e) { console.warn(`${tags}.${name} - ${payload}`) }},
    write: (payload, name) => { try { api('journal').write(payload, `${tags}.${name}`) } catch (e) { console.log(`${tags}.${name} - ${payload}`) }}
  }

  service.api.compile = function (payload) {
    const { codeDoc } = payload
    this.write(`({ codeDoc = ${JSON.stringify(codeDoc)} })`, `api.compile`)
    try {
      return new Function('payload', codeDoc.value)
    } catch (e) {
      this.warning(`Cannot create function codeDoc = ${JSON.stringify(codeDoc)}`, 'api.compile')
      return () => { console.log(`Cannot create function codeDoc = ${codeDoc}`) }
    }
  }.bind(service)

  service.api.filterByComponent = function (payload) {
    this.write(`(${JSON.stringify(payload)})`, `api.filterByComponent`)
    const { componentDoc } = payload
    return getState().docs.filter(doc => doc.componentID == componentDoc._id)
  }.bind(service)

  service.api.filterByElement = function (payload) {
    this.write(`(${JSON.stringify(payload)})`, `api.filterByElement`)
    const { elementDoc } = payload
    return getState().docs.filter(doc => doc.elementID == elementDoc._id)
  }.bind(service)

  service.api.toCompiledList = function (payload) {
    const { codeDocList = [] } = payload
    this.write(`({ codeDocList.length = ${codeDocList.length}`, `api.toCompiledHash`)
    return codeDocList.map(codeDoc =>
      ({ name: codeDoc.name, func: this.api.compile({ codeDoc }) })
    )
  }.bind(service)

  service.do.insert = function (payload) {
    this.write(`(payload = ${JSON.stringify(payload)})`, `do.insert`)
    dispatch(actions.insert(payload))
  }.bind(service)

  service.do.remove = function (payload) {
    this.write(`(payload = ${JSON.stringify(payload)})`, `do.remove`)
    dispatch(actions.remove(payload))
  }.bind(service)

  service.do.update = function (payload) {
    this.write(`(payload = ${JSON.stringify(payload)})`, `do.update`)
    dispatch(actions.update(payload))
  }.bind(service)

  return service
}
