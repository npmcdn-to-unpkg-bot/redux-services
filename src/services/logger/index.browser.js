import { write }            from 'redux-journal'

const tags = `redux-service.logger.service.local`

export const logger = ({ dispatch, getState, services }) => {
  write(``, `${tags}.configServiceLocal`)
  return {
    middleware: require('redux-logger')()
  }
}
