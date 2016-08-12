import { write }              from 'redux-journal'
import { configAPILocal }     from '../api/api.local'
import { TAGS }               from '../config'
import { middleware }         from '../middleware'
import { reducer }            from '../reducer'

export const configServiceLocal = ({ dispatch, getState, getService }) => {
  write(``, `${TAGS}.init`)
  return {
    api: configAPILocal({ dispatch, getState, getService }),
    middleware: middleware(getState),
    reducer,
  }
}
