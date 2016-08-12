import { PREFIX }           from './config'

export const types = {
  DISABLE:  `${PREFIX}/DISABLE`,
  ENABLE:   `${PREFIX}/ENABLE`,

  ERROR:    `${PREFIX}/ERROR`,
  WARNING:  `${PREFIX}/WARNING`,
  WRITE:    `${PREFIX}/WRITE`,
}

const action = (type) => (payload) => ({ type, payload })

export const actions = {
  disable:  action(types.DISABLE),
  enable:   action(types.ENABLE),

  error:    action(types.ERROR),
  warning:  action(types.WARNING),
  write:    action(types.WRITE)
}
