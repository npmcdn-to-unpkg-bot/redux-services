import { PropTypes }        from 'react'

import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const router = ({ dispatch, getState }) => {
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

  service.api.createReact = function () {
    return <div>ROUTER</div>
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
