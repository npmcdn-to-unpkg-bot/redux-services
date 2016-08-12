import Promise                from 'bluebird'
import { error, write }       from 'redux-journal'
import { TAGS, DAEMON }       from './config'
import { configAPI }          from './api'
import { reducer }            from './reducer'

import { edges }              from '../edges/index'

const tags = `${TAGS}.daemon`

Promise.onPossiblyUnhandledRejection((e, promise) => {
  error(e)
  if (e.stack) write(e.stack)
})

export const configDaemon = (
  { manager, daemonName = DAEMON } =
  {          daemonName:  DAEMON }
) => {
  if (!manager) {
    require('redux-journal').enable()
    manager = require('redux-manager').manager
    manager.enableLogger(require('redux-node-logger')())
  }
  write(`({ daemonName = '${daemonName}' })`, `${tags}.configServiceLocal`)
  edges({ manager })
  manager.reducer.set(daemonName, reducer, true)
  const api = manager.api.set(daemonName, configAPI({ manager, daemonName }))
  manager.getStore()
  return api
}
