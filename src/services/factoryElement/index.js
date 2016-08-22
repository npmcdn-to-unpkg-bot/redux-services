import { actions }          from './actions'
import { TAGS }             from './config'

const tags = `${TAGS}`

export const factoryElement = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${tags}.init`)

  let service = {
    do: {},
    links: {
      journal: { from: 'redux-services/journal' }
    },
    reducer: require('./reducer').reducer
  }

  let api = service.api = (name) => service.links[name].service.api

  const warning = (payload, name) => api('journal').warning(payload, `${tags}.${name}`)
  const write   = (payload, name) => api('journal').write(payload, `${tags}.${name}`)

  /**
   * @param componentDoc factoryComponentDoc
   * @returns factoryElementDoc[]
   */
  api.filterByComponent = (componentDoc) => {
    write(`(payload = ${JSON.stringify(componentDoc)})`, `api.filterByComponent`)
    return getState().docs.filter(doc => doc.componentID == componentDoc._id)
  }

  /**
   * @param elementDocList factoryElementDoc[]
   * @returns factoryElementDoc[]
   */
  api.withoutChildren = (elementDocList) => {
    let childrenHash = {}
    elementDocList.map(elementDoc => {
      const { parentID } = elementDoc
      if (parentID) childrenHash[parentID] = childrenHash[parentID] + 1 || 1
    })
    return elementDocList.filter(elementDoc => !childrenHash[elementDoc._id])
  }

  api.createChildrenHash = (elementDocList) => {
    let hash = {}
    elementDocList.map(elementDoc => {
      const { parentID } = elementDoc
      if (parentID) {
        hash[parentID] = [ ...(hash[parentID] || []), elementDoc ]
      }
    })
    return hash
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

  return service
}
