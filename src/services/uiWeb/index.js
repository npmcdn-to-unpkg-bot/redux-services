require('react-tap-event-plugin')()

import Prefixer             from 'inline-style-prefixer'

import React                from 'react'
import ReactDOM             from 'react-dom'
typeof window !== 'undefined' && (window.React = React)

import AppBar               from 'material-ui/AppBar'
import MuiThemeProvider     from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme          from 'material-ui/styles/getMuiTheme'

import {
  amber400, blue400, cyan400, green400, red400, yellow400,
} from 'material-ui/styles/colors'

import { Provider }         from 'react-redux'

const muiTheme = getMuiTheme({ palette: { accent1Color: require('material-ui/styles/colors').deepOrange500 }})

import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const uiWeb = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    dispatch,
    do: {},
    getState,
    links: {
      journal: { from: 'redux-services/journal' },
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const write = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  api.get = function(payload) {
    write(`(${JSON.stringify(payload)})`, 'api.get')
    const { name } = payload
    const docs = getState().docs
    let index = docs.length
    while (index--) {
      const current = docs[index]
      if (current.name == name) return current.value
    }
  }.bind(service)

  api.set = function(payload) {
    write(`(${JSON.stringify(payload)})`, 'api.set')
    const { name, value } = payload
    const docs = getState().docs
    let index = docs.length
    while (index--) {
      const current = docs[index]
      if (current.name == name) return this.do.update({ ...current, value })
    }
    return this.do.insert({ name, value })
  }.bind(service)

  api.run = function(payload = {}) {
    const title = api.get({ name: 'title' })

    const appbar = {
      title: title || 'Title',
    }

    const {
      Root,
      RootFixed,
      RootLeft,
      RootTop,
      RootBottom,
      RootRight,
    } = payload

    const prefixer = new Prefixer()

    const styles = prefixer.prefix({
      containerBottom: {
        backgroundColor: red400,
        float: 'left',
      },
      containerCenter: {
        backgroundColor: amber400,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: '1',
        float: 'left',
      },
      containerLeft: {
        backgroundColor: blue400,
        float: 'left',
      },
      containerRight: {
        backgroundColor: green400,
        float: 'left',
      },
      containerTop: {
        minHeight: '60px',
        backgroundColor: yellow400,
        float: 'left',
      },
      content: {
        backgroundColor: cyan400,
        height: '500px', // HACK to open Leaflet
        flexGrow: '1',
        float: 'left',
      },
      rootDiv: {
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
      },
    })

    const render = () => ReactDOM.render(
      <MuiThemeProvider muiTheme={ muiTheme }>

        <div style={ styles.rootDiv }>
          { RootFixed ||
            <div/>
          }
          <div style={ styles.containerLeft }>
            { RootLeft ||
              <div/>
            }
          </div>
          <div style={ styles.containerCenter }>
            <div style={ styles.containerTop }>
              { RootTop ||
                <AppBar { ...appbar }
                      iconElementLeft={ <div/> }
                      iconElementRight={ <div/> }
                />
              }
            </div>
            <div style={ styles.content }>
              { Root ||
                <div/>
              }
            </div>
            <div style={ styles.containerBottom }>
            </div>
          </div>
          <div style={ styles.containerRight }>
          </div>
        </div>

      </MuiThemeProvider>,
      document.getElementById('app')
    )

    render()
  }.bind(service)

  service.do.insert = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `do.insert`)
    dispatch(actions.insert(payload))
  }

  service.do.remove = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `do.remove`)
    dispatch(actions.remove(payload))
  }

  service.do.update = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `do.update`)
    dispatch(actions.update(payload))
  }

  return service
}
