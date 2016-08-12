import { write }              from 'redux-journal'
import { TAGS, SERVICE }      from '../config'
import { prepareStore }       from '../store'
import { configAPILocal }     from '../api/api.local'

const tags = `${TAGS}.service.local`

export const configServiceLocal = (
  { manager, serviceName = SERVICE, fetch = require('isomorphic-fetch') } =
  { manager, serviceName:  SERVICE, fetch:  require('isomorphic-fetch') }
) => {
  write(`({ serviceName = '${serviceName}' })`, `${tags}.configServiceLocal`)
  prepareStore({ manager, serviceName })
  return manager.api.set(serviceName, configAPILocal({ fetch }))
}
