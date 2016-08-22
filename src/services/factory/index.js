import cuid                 from 'cuid'
import { call, fork }       from 'redux-saga/effects'
import { put, take }        from 'redux-saga/effects'

const tags = `factory`

export const factory = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)
  let service = { links: {
    journal:          { from: 'redux-services/journal', },
    factoryAction:   { from: 'redux-services/factoryAction', },
    factoryComponent: { from: 'redux-services/factoryComponents', },
    factoryElement:   { from: 'redux-services/factoryElement', },
    factoryLink:     { from: 'redux-services/factoryLink', },
    factoryService:   { from: 'redux-services/factoryService', },
  }}

  let api = service.api = (name) => service.links[name].service.api

  const warning = service.warning = (payload, name) => api('journal').warning(payload, `${tags}.${name}`)
  const write   = service.write   = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  api.processActions = ({ moduleConfig, moduleActionsGen }) => {
    const { PREFIX } = moduleConfig

    let module = {}
    let actions = module.actions = {}
    let types = module.types = {}
    let sagas = module.sagas = []

    types.INSERT = `${PREFIX}/INSERT`
    types.REMOVE = `${PREFIX}/REMOVE`
    types.UPDATE = `${PREFIX}/UPDATE`

    const actionID =  (type) => (payload) => ({ type, payload: { ...payload, _id: payload._id ? payload._id : cuid() }})
    const action =    (type) => (payload) => ({ type, payload })

    actions.insert = actionID(types.INSERT)
    actions.remove = action(types.REMOVE)
    actions.update = action(types.UPDATE)

    moduleActionsGen.actions.regular.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(types[doc.type])
    })

    moduleActionsGen.actions.request.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(types[doc.type])
    })

    moduleActionsGen.actions.success.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(types[doc.type])
    })

    moduleActionsGen.actions.failure.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(types[doc.type])
    })

    return module
  }

  api.generateConfig = ({ serviceName }) => {
    const SERVICE  = serviceName
    const PREFIX   = `@@${SERVICE}`
    const TAGS     = `${SERVICE}`

    return { SERVICE, PREFIX, TAGS }
  }

  api.doIndex = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `api.doIndex`)
    const { serviceName } = payload

    const apiService = api('factoryService')
    const apiComponent = api('factoryComponent')

    const serviceDoc = apiService.getByName({ name: serviceName })
    if (!serviceDoc) this.warning(`Service not found ${serviceName}`, `api.doIndex`)

    const moduleComponents = apiComponent.generateAll({ serviceDoc })

    const moduleConfig = api.generateConfig({ serviceName })

    const moduleActionsGen = api('factoryAction').generateActions({ serviceName, moduleConfig })
    const moduleActions = api.processActions({ moduleConfig, moduleActionsGen })

    const moduleReducer = api.doReducer({ moduleActions, moduleActionsGen })

    const { actions, types } = moduleActions
    const { TAGS } = moduleConfig
    const { reducer } = moduleReducer

    const moduleLinks = api('factoryLink').doLinks({ serviceName })

    let module = {}

    const tags = `${TAGS}`

    module.configService = ({ dispatch, getState }) => {
      require('redux-journal').write(``, `${tags}.init`)

      let service = {
        components: moduleComponents,
        dispatch,
        do: {},
        getState,
        links: {
          ...moduleLinks,
          journal: { from: 'redux-services/journal' }
        },
        reducer: reducer,
        saga: {}
      }

      const warning = service.warning = (payload, name) => api('journal').warning(payload, `${tags}.${name}`)
      const write   = service.write   = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

      let api = service.api = (name) => {
        if (service.links[name]) return service.links[name].service.api
        warning(`({ "name": "${name}" }) - Cannot find API`, 'api')
      }

      service.do.insert = payload => {
        write(`(${JSON.stringify(payload)})`, 'do.insert')
        return dispatch(actions.insert(payload))
      }

      service.do.remove = payload => {
        write(`(${JSON.stringify(payload)})`, 'do.remove')
        dispatch(actions.remove(payload))
      }

      service.do.update = (payload) => {
        write(`(${JSON.stringify(payload)})`, 'do.update')
        dispatch(actions.update(payload))
      }

      moduleActionsGen.api.map(doc => {
        try {
          const func = new Function('payload', doc.code).bind(service)
          api[doc.name] = (payload) => {
            write(`(${JSON.stringify(payload)})`, `${doc.name}`)
            try {
              return func(payload)
            } catch (e) {
              warning(e, `${doc.name}`)
            }
          }
        } catch (e) {
          warning(`Cannot create api.${doc.name}`, 'doIndex')
        }
      })

      moduleActionsGen.actions.regular.map(doc => {
        service.do[doc.action] = payload => {
          write(`(${JSON.stringify(payload)})`, `do.${doc.action}`)
          dispatch(actions[doc.action](payload))
        }
      })

      moduleActionsGen.actions.request.map(doc => {
        service.do[doc.action] = payload => {
          write(`(${JSON.stringify(payload)})`, `do.${doc.action}`)
          dispatch(actions[doc.action](payload))
        }
      })

      moduleActionsGen.actions.success.map(doc => {
        service.do[doc.action] = payload => {
          write(`(${JSON.stringify(payload)})`, `do.${doc.action}`)
          dispatch(actions[doc.action](payload))
        }
      })

      moduleActionsGen.actions.failure.map(doc => {
        service.do[doc.action] = payload => {
          warning(`(${JSON.stringify(payload)})`, doc.action)
          dispatch(actions[doc.action](payload))
        }
      })

      const doWatchSagaAction = (sagaDoc) => {
        function *sagaAction(action) {
          const { __ns__ } = action
          try {
            if (sagaDoc.request) yield call(service.do[`${sagaDoc.action}Request`])
            const result = yield call(api[sagaDoc.action], action.payload)
            if (sagaDoc.insert) yield call(service.do['insert'], result)
            if (sagaDoc.success) yield call(service.do[`${sagaDoc.action}Success`])
          } catch (error) {
            if (sagaDoc.failure) {
              yield call(service.do[`${sagaDoc.action}Failure`], { error })
            } else {
              console.log(error, error.stack || '')
            }
          }
        }

        function *watchSagaAction() {
          while (true) {
            const type = types[sagaDoc.sagaType || sagaDoc.type]
            // console.log('factory/index.js watchSagaAction', type)
            const action = yield take(type)
            yield fork(sagaAction, action)
          }
        }

        return watchSagaAction
      }

      function *sagaRoot() {
        let index = moduleActionsGen.actions.saga.length
        while (index--) {
          const doc = moduleActionsGen.actions.saga[index]
          yield fork(doWatchSagaAction(doc))
        }
      }

      service.saga.root = sagaRoot

      return service
    }

    return module
  }

  api.doReducer = ({ moduleActions, moduleActionsGen }) => {
    let module = {}

    const { types } = moduleActions

    module.initial = {
      docs: [],
      status: { value: '', error: '' }
    }

    module.reducer = (state = module.initial, action) => {
      const { payload, __ns__ } = action
      const { config, status, docs } = state

      const doStatus  = (value)         => Object.assign({}, { config, docs }, { status: { value, error: '' }})
      const doFail    = (value, error)  => Object.assign({}, { config, docs }, { status: { value, error }})
      const doDocs    = (docs)          => Object.assign({}, { config, status }, { docs })

      const actionsRequest = moduleActionsGen.actions.request
      let index = actionsRequest.length
      while (index--) {
        if (actionsRequest[index].type == action.type) return doStatus(action.type)
      }

      const actionsSuccess = moduleActionsGen.actions.success
      index = actionsSuccess.length
      while (index--) {
        if (actionsSuccess[index].type == action.type) return doStatus(action.type)
      }

      const actionsFailure = moduleActionsGen.actions.failure
      index = actionsFailure.length
      while (index--) {
        if (actionsFailure[index].type == action.type) return doFail(action.type, payload.error)
      }

      switch (action.type) {
        case types.INSERT: return doDocs([ { ...payload, ns: __ns__, _id: payload._id }, ...state.docs ])
        case types.UPDATE: return doDocs(state.docs.map((doc) => doc._id === payload._id ? { ...doc, ...payload } :  doc))
        case types.REMOVE: return doDocs(state.docs.filter(doc => doc._id !== payload._id))

        default: return state
      }
    }

    return module
  }

  return service
}

