import { write, error }   from 'redux-journal'

import { actions }        from './actions'
import { DAEMON, TAGS }   from './config'

const tags = `${TAGS}.api`

export const configAPI = (
  { manager, daemonName = DAEMON } =
  {          daemonName:  DAEMON }
) => {
  const api = () => {}

  api.insert = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.insert`)
    manager.dispatch(actions.insert(payload), daemonName)
  }

  api.remove = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.remove`)
    manager.dispatch(actions.remove(payload), daemonName)
  }

  api.update = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `${tags}.update`)
    manager.dispatch(actions.update(payload), daemonName)
  }

  return api
}
