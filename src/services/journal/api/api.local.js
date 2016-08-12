import Promise            from 'bluebird'
import { write }          from 'redux-journal'
import { actions }        from '../actions'
import { TAGS }           from '../config'
import { select }         from '../select'

const tags = `${TAGS}.api.local`


export const configAPILocal = ({ dispatch, getState, services }) => {
  const api = () => {}

  const diff = () => {
    const time = Date.now()
    return { time, timeDiff: time - getState().beforeTime }
  }

  api.enable  = () => dispatch(actions.enable())
  api.disable = () => dispatch(actions.disable())

  api.error   = (text, tags) => dispatch(actions.error({ ...diff(), text, tags }))
  api.warning = (text, tags) => dispatch(actions.warning({ ...diff(), text, tags }))
  api.write   = (text, tags) => dispatch(actions.write({ ...diff(), text, tags }))

  return api
}
