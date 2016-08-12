import cuid                 from 'cuid'

const tags = `factory`

export const factory = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)
  let service = { links: {
    journal:          { from: 'redux-services/journal', },
    factoryActions:   { from: 'redux-services/factoryActions', },
    factoryLinks:     { from: 'redux-services/factoryLinks', },
  }}

  let api = service.api = (name) => service.links[name].service.api

  const warning = (payload, name) => api('journal').warning(payload, `${tags}.${name}`)
  const write   = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  api.doActions = ({ moduleConfig, moduleActionsGen }) => {
    const { PREFIX } = moduleConfig

    let module = {}
    let actions = module.actions = {}
    let types = module.types = {}

    types.INSERT = `${PREFIX}/INSERT`
    types.REMOVE = `${PREFIX}/REMOVE`
    types.UPDATE = `${PREFIX}/UPDATE`

    const actionID = (type) => (payload) => ({ type, payload: { ...payload, _id: payload._id ? payload._id : cuid() }})
    const action = (type) => (payload) => ({ type, payload })

    actions.insert = actionID(types.INSERT)
    actions.remove = action(types.REMOVE)
    actions.update = action(types.UPDATE)

    moduleActionsGen.actions.regular.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(doc.type)
    })

    moduleActionsGen.actions.request.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(doc.type)
    })
    moduleActionsGen.actions.success.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(doc.type)
    })

    moduleActionsGen.actions.failure.map(doc => {
      types[doc.type] = `${PREFIX}/${doc.type}`
      actions[doc.action] = action(doc.type)
    })

    return module
  }

  api.doConfig = ({ serviceName }) => {
    const SERVICE  = serviceName
    const PREFIX   = `@@${SERVICE}`
    const TAGS     = `${SERVICE}`

    return { SERVICE, PREFIX, TAGS }
  }

  api.doIndex = ({ serviceName }) => {
    const moduleConfig = api.doConfig({ serviceName })

    const moduleActionsGen = api('factoryActions').doActions({ serviceName, moduleConfig })
    const moduleActions = api.doActions({ moduleConfig, moduleActionsGen })

    const moduleReducer = api.doReducer({ moduleActions, moduleActionsGen })

    const { actions } = moduleActions
    const { TAGS } = moduleConfig
    const { reducer } = moduleReducer

    const moduleLinks = api('factoryLinks').doLinks({ serviceName })

    let module = {}

    const tags = `${TAGS}`

    module.configService = ({ dispatch, getState }) => {
      require('redux-journal').write(``, `${tags}.init`)

      let service = {
        moduleActions,
        moduleConfig,
        links: {
          ...moduleLinks,
          journal: { from: 'redux-services/journal' }
        },
        reducer: reducer,
      }

      let api = service.api = (name) => service.links[name].service.api

      const write = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

      api.insert = (payload) => {
        write(`(${JSON.stringify(payload)})`, `insert`)
        dispatch(actions.insert(payload))
      }

      api.remove = (payload) => {
        write(`(${JSON.stringify(payload)})`, `remove`)
        dispatch(actions.remove(payload))
      }

      api.update = (payload) => {
        write(`(${JSON.stringify(payload)})`, `update`)
        dispatch(actions.update(payload))
      }

      moduleActionsGen.api.map(doc => {
        try {
          api[doc.name] = new Function('payload', doc.code).bind(service)
        } catch (e) {
          warning(`Cannot create api.${doc.name}`, 'doIndex')
        }
      })

      moduleActionsGen.actions.request.map(doc => {
        api[doc.action] = (payload) => {
          write(`(${JSON.stringify(payload)})`, doc.action)
          dispatch(actions[doc.action](payload))
        }
      })

      moduleActionsGen.actions.success.map(doc => {
        api[doc.action] = (payload) => {
          write(`(${JSON.stringify(payload)})`, doc.action)
          dispatch(actions[doc.action](payload))
        }
      })

      moduleActionsGen.actions.failure.map(doc => {
        api[doc.action] = (payload) => {
          warning(`(${JSON.stringify(payload)})`, doc.action)
          dispatch(actions[doc.action](payload))
        }
      })

      return service
    }

    return module
  }

  api.doReducer = ({ moduleActions, moduleActionsGen }) => {
    let module = {}

    const { types } = moduleActions

    module.initial = {
      config: {},
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

