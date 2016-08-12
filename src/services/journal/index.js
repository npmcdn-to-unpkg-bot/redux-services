import { configAPILocal }     from './api/api.local'
import { configServiceLocal } from './service/service.local'

import { types, actions }     from './actions'
import * as config            from './config'
import { reducer }            from './reducer'
import { select }             from './select'

export {
  actions               as journalActions,
  config                as journalConfig,
  configAPILocal        as journalConfigAPILocal,
  configServiceLocal    as journal,
  reducer               as journalReducer,
  select                as journalSelect,
  types                 as journalTypes
}
