import { write }              from 'redux-journal'
import { TAGS, DAEMON }       from './config'
import { configAPI }          from './api'
import { reducer }            from './reducer'

const tags = `${TAGS}.daemon`

export const configDaemon = (
  { manager, daemonName = DAEMON } =
  {          daemonName:  DAEMON }
) => {
  write(`({ daemonName = '${daemonName}' })`, `${tags}.configServiceLocal`)
  manager.reducer.set(daemonName, reducer, true)
  return manager.api.set(daemonName, configAPI({ manager, daemonName }))
}
