import { types }            from './actions'

const initial = {
  config: {
    docsMax: 2,
    docsMaxOverRemove: true
  },
  docs: [],
  status: { value: '', error: '' }
}

export const reducer = (state = initial, action) => {
  const { payload, __ns__ } = action
  const { config, status, docs } = state

  const doStatus  = (value)         => Object.assign({}, { config, docs }, { status: { value }})
  const doFail    = (value, error)  => Object.assign({}, { config, docs }, { status: { value, error }})
  const doDocs    = (docs)          => Object.assign({}, { config, status }, { docs })

  switch (action.type) {
    case types.UPLOAD_REQUEST: return doStatus(types.UPLOAD_REQUEST)
    case types.UPLOAD_SUCCESS: return doStatus(types.UPLOAD_SUCCESS)
    case types.UPLOAD_FAILURE: return doFail(types.UPLOAD_FAILURE, payload.error)

    case types.INSERT: return doDocs([ { ...payload, ns: __ns__, _id: payload._id }, ...state.docs ])
    case types.UPDATE: return doDocs(state.docs.map((doc) => doc._id === payload._id ? { ...doc, ...payload } :  doc))
    case types.REMOVE: return doDocs(state.docs.filter(doc => doc._id !== payload._id))

    default: return state
  }
}
