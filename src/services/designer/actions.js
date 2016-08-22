import cuid                 from 'cuid'
import { PREFIX }           from './config'

export const types = {
  INSERT: `${PREFIX}/INSERT`,
  REMOVE: `${PREFIX}/REMOVE`,
  UPDATE: `${PREFIX}/UPDATE`
}

const actionID  = (type) => (payload) => ({ type, payload: { ...payload, _id: payload._id ? payload._id : cuid() }})
const action    = (type) => (payload) => ({ type, payload })

export const actions = {
  insert: actionID(types.INSERT),
  remove: action(types.REMOVE),
  update: action(types.UPDATE)
}
