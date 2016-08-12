import cuid                 from 'cuid'

const PREFIX = `@@imgur`

export const types = {
  UPLOAD:         `${PREFIX}/UPLOAD`,
  UPLOAD_REQUEST: `${PREFIX}/UPLOAD_REQUEST`,
  UPLOAD_SUCCESS: `${PREFIX}/UPLOAD_SUCCESS`,
  UPLOAD_FAILURE: `${PREFIX}/UPLOAD_FAILURE`,

  INSERT:         `${PREFIX}/INSERT`,
  REMOVE:         `${PREFIX}/REMOVE`,
  UPDATE:         `${PREFIX}/UPDATE`
}

const actionID  = (type) => (payload) => ({ type, payload: { ...payload, _id: payload._id ? payload._id : cuid() }})
const action    = (type) => (payload) => ({ type, payload })

export const actions = {
  upload: action(types.UPLOAD),

  insert: actionID(types.INSERT),
  remove: action(types.REMOVE),
  update: action(types.UPDATE)
}
