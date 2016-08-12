import { types }            from './actions'

const initial = {
  enabled: true,
  beforeTime: Date.now(),
  docs: [],
}

export const reducer = (state = initial, action) => {
  const { payload = {} } = action
  const { time, timeDiff, text, tags } = payload
  const { enabled, beforeTime, docs } = state

  const doEnabled = (enabled)           => Object.assign({}, { enabled, beforeTime, docs })
  const doDocs    = (docs, beforeTime)  => Object.assign({}, { enabled, beforeTime, docs })

  switch (action.type) {
    case types.ENABLE:  return doEnabled(true)
    case types.DISABLE: return doEnabled(false)

    case types.ERROR:   return doDocs([ ...docs, { timeDiff, text, tags, type: 'error', }], time)
    case types.WRITE:   return doDocs([ ...docs, { timeDiff, text, tags, type: 'write', }], time)
    case types.WARNING: return doDocs([ ...docs, { timeDiff, text, tags, type: 'warning', }], time)

    default: return state
  }
}
