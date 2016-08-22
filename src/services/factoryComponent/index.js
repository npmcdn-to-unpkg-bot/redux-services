import Prefixer             from 'inline-style-prefixer'
import React                from 'react'

import Paper                from 'material-ui/Paper'


import { actions }          from './actions'
import { TAGS, SERVICE }    from './config'

const tags = `${TAGS}`

export const factoryComponent = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let componentHash = {}

  const prefixer = new Prefixer()

  const propsList = ['type']

  let service = {
    do: {},
    links: {
      journal:        { from: 'redux-services/journal' },
      factoryCode:    { from: 'redux-services/factoryCode', },
      factoryElement: { from: 'redux-services/factoryElement', },
      factoryProp:    { from: 'redux-services/factoryProp', },
      factoryStyle:   { from: 'redux-services/factoryStyle', },
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const warning = (payload, name) => {
    try { api('journal').warning(payload, `${tags}.${name}`) }
    catch (e) { console.warn(`${tags}.${name} - ${payload}`) }
  }
  const write   = (payload, name) => {
    try { api('journal').write(payload, `${tags}.${name}`) }
    catch (e) { console.log(`${tags}.${name} - ${payload}`) }
  }

  const siblingsReady = (siblings, reactElements) => {
    let index = siblings.length
    while (index--) {
      const current = siblings[index]
      if (!reactElements[current._id]) return false
    }
    return true
  }

  const createElement = (payload) => {
    const { context, elementDoc, siblings, reactElements } = payload
    write(`({ elementDoc = ${JSON.stringify(elementDoc)}, siblings = ${JSON.stringify(siblings)} })`, 'support.createElement')
    const apiStyle = api('factoryStyle')
    const style = prefixer.prefix(apiStyle.toStyles({
      styleDocList: apiStyle.filterByElement({ elementDoc })
    }))

    const apiCode = api('factoryCode')
    let codeHash = {}
    const codeList = apiCode.toCompiledList({
      codeDocList: apiCode.filterByElement({ elementDoc }),
    }).map(compiledDoc => {
      codeHash[compiledDoc.name] = (...args) => compiledDoc.func.apply(context, args)
    })

    let props = { key: elementDoc._id, ref: elementDoc.name, style, ...codeHash }
    propsList.map(name => { if (elementDoc[name]) props[name] = elementDoc[name] })

    const tag = elementDoc.tag
    const isCustom = tag[0] == tag[0].toUpperCase()
    let component = isCustom ? componentHash[tag] : null
    if (isCustom && !component) warning(`Custom component ${tag} not registered`, `support.createElement`)
    const childs = siblings.map(doc => reactElements[doc._id])

    return React.createElement(component || tag, props, childs.length ? childs : null)
  }

  /**
   * @param payload factoryComponentDoc
   * @returns {*|Function}
   */
  api.generate = (componentDoc) => {
    write(`(payload = ${JSON.stringify(componentDoc)})`, `api.generate`)
    const { name } = componentDoc

    const apiProp = api('factoryProp')
    const reactPropHash = apiProp.toReactHash({
      propDocList: apiProp.filterByComponent({componentDoc})
    })

    return componentHash[name] = React.createClass({
      ...reactPropHash,
      displayName: name,
      getInitialState: function() {
        let state = {}

        const apiCode = api('factoryCode')
        let codeHash = {}
        const codeList = apiCode.toCompiledList({
          codeDocList: apiCode.filterByComponent({ componentDoc }),
        }).map(compiledDoc => {
          this[compiledDoc.name] = (...args) => compiledDoc.func.apply(this, args)
        })

        api('factoryElement').filterByComponent(componentDoc).map(elementDoc => state[elementDoc.name] = {})
        return state
      },

      render: function() {
        write(`(payload = ${JSON.stringify(componentDoc)})`, `api.generate.render`)

        let reactElements = {}

        let elementDocList = api('factoryElement').filterByComponent(componentDoc)
        let childrenHash = api('factoryElement').createChildrenHash(elementDocList)
        let topElementDocList = api('factoryElement').withoutChildren(elementDocList)
        let stopIndex = 0

        while (topElementDocList.length && stopIndex < 10) {
          let index = topElementDocList.length
          while (index--) {
            stopIndex++
            const current = topElementDocList[index]
            const siblings = childrenHash[current._id] || []
            if (siblingsReady(siblings, reactElements)) {
              const reactElement = createElement({ context: this, elementDoc: current, siblings, reactElements })
              reactElements[current._id] = reactElement
              topElementDocList.splice(index, 1)
              if (!current.parentID) return reactElement
              topElementDocList = [...elementDocList.filter(doc => doc._id == current.parentID), ...topElementDocList]
              break
            }
          }
        }

        warning(`stopIndex > 100`, `api.generate`)
        return <div>factoryComponents/index.js - api.generate - stopIndex > 100</div>
      }
    })
  }

  /**
   * @param payload { serviceDoc }
   * @returns {*}
   */
  api.generateAll = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `api.generateAll`)
    const { serviceDoc } = payload
    const list = getState().docs.filter(doc => doc.serviceID == serviceDoc._id).map(doc => {
      return { name: doc.name, reactClass: api.generate(doc) }
    })
    //console.log('factoryComponent/index.js', list)
    return list
  }

  api.getByName = (payload) => {
    write(`(payload = ${JSON.stringify(payload)})`, `api.getByName`)
    const { name } = payload
    const doc = getState().docs.find(doc => doc.name == name)
    if (doc) return doc
    warning(`Cannot find ${SERVICE} with name == ${name}`, `api.getByName`)
  }

  api.register = (payload) => {
    const { name, reactComponent } = payload
    write(`(${JSON.stringify(payload)})`, `api.register`)
    componentHash[name] = reactComponent
  }

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

  api.register({ name: 'Paper', reactComponent: Paper })

  return service
}
