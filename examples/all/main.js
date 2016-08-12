import { error, write }     from 'redux-journal'
import { services }         from 'redux-services'
//
// services().config({
//   journal:  { from: 'redux-services/journal'  },
//   logger:   { from: 'redux-services/logger'   },
//   security: { from: 'redux-services/security' }
// }).run().then((api) => {
//   const security = api.get('security')
//   security.api.check(12345)
// }).catch((e) => {
//   error(e)
//   if (e.stack) write(e.stack)
// })
