const TAGS = 'redux-services.security'

export const security = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${TAGS}.init`)
  let service = {}

  service.links = {
    journal: { from: 'redux-services/journal' }
  }

  let api = service.api = (name) => service.links[name].service.api

  api.check = (payload) => {
    api('journal').write(`(${JSON.stringify(payload)})`, `${TAGS}.check`)
    return true
  }

  service.linksUpdate = (nextLinks) => {
    api('journal').write(``, `${TAGS}.linksUpdate`)
  }

  return service
}
