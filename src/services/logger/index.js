import { write }            from 'redux-journal'

const tags = `redux-services.logger`

const middlewareFilter = (middleware) => ({ getState }) => (next) => (action) => {
  if (action.__ns__ == 'journal') return next(action)
  return middleware({ getState })(next)(action)
}

export const logger = ({ dispatch, getState, services }) => {
  write(``, `${tags}.init`)
  return {
    middleware: middlewareFilter(require('redux-node-logger')())
  }
}
