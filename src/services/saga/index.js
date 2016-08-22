import { write }            from 'redux-journal'

const tags = `redux-services.saga`

export const saga = ({ dispatch, getState }) => {
  write(``, `${tags}.init`)
  return {
    middleware: require('redux-saga').default()
  }
}
