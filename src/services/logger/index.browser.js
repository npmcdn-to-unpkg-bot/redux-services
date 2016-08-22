import { write }            from 'redux-journal'

const tags = `redux-service.logger.service.local`

const middlewareFilter = (middleware) => ({ getState }) => (next) => (action) => {
  if (action.__ns__ == 'journal') return next(action)
  return middleware({ getState })(next)(action)
}

export const logger = ({ dispatch, getState, services }) => {
  write(``, `${tags}.configServiceLocal`)
  return {
    middleware: middlewareFilter(require('redux-logger')())
  }
}
