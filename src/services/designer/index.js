import { Provider }         from 'react-redux'
import { connect }          from 'react-redux'

import { actions }          from './actions'
import { TAGS }             from './config'

import Designer             from './react/designer'

const tags = `${TAGS}`

export const designer = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    api: name => service.links[name].service.api,
    do: {},
    links: {
      factoryAction:  { from: 'redux-services/factoryAction', },
      factoryLink:    { from: 'redux-services/factoryLink', },
      factoryService: { from: 'redux-services/factoryService', },
      journal:        { from: 'redux-services/journal', },
      router:         { from: 'redux-services/router', },
      uiWeb:          { from: 'redux-services/uiWeb', },
    },
    reducer: require('./reducer').reducer,
    warning: (payload, name) => { try { api('journal').warning(payload, `${tags}.${name}`) } catch (e) { console.warn(`${tags}.${name} - ${payload}`) }},
    write: (payload, name) => { try { api('journal').write(payload, `${tags}.${name}`) } catch (e) { console.log(`${tags}.${name} - ${payload}`) }}
  }

  service.api.run = function (payload) {
    const { api } = payload

    const apiRouter = this.api('router')

    const DesignerComponent = connect(state => ({
      designer: state.designer,
      factoryAction: state.factoryAction,
      factoryLink: state.factoryLink,
      factoryService: state.factoryService,
    }))(Designer)

    this.warning('HumanInput use DefinePlugin for defining __VERSION__. Check Issues or use precompilled version', 'api.run')

    const Root = apiRouter.createReact()
    const RootFixed = <Provider store={ api.getStore() }>
        <DesignerComponent { ...{ api }}/>
      </Provider>

    this.api('uiWeb').run({ Root, RootFixed })
  }.bind(service)

  service.do.insert = function (payload) {
    this.write(`(payload = ${JSON.stringify(payload)})`, `do.insert`)
    dispatch(actions.insert(payload))
  }.bind(service)

  service.do.remove = function (payload) {
    this.write(`(payload = ${JSON.stringify(payload)})`, `do.remove`)
    dispatch(actions.remove(payload))
  }.bind(service)

  service.do.update = function (payload) {
    this.write(`(payload = ${JSON.stringify(payload)})`, `do.update`)
    dispatch(actions.update(payload))
  }.bind(service)

  return service
}
