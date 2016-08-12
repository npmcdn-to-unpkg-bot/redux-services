import { configAPILocal }         from './api/api.local'
import { configServiceLocal }     from './service/service.local'

import { types, actions }         from './actions'
import * as config                from './config'
import { configPersist }          from './persist'
import { reducer }                from './reducer'
import { saga, configSaga }       from './saga'
import { select }                 from './select'
import { prepareStore }           from './store'

export {
  actions               as imgurActions, actions,
  config                as imgurConfig, config,
  configAPILocal        as imgurConfigAPILocal, configAPILocal,
  configPersist         as imgurPersist, configPersist,
  configServiceLocal    as imgurLocal, configServiceLocal,
  configSaga            as imgurConfigureSaga, configSaga,
  prepareStore          as imgurPrepareStore, prepareStore,
  reducer               as imgurReducer, reducer,
  saga                  as imgurSaga, saga,
  select                as imgurSelect, select,
  types                 as imgurTypes, types,
}
