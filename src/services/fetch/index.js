const TAGS = 'redux-services.fetch'

export const fetch = ({ dispatch, getState }) => {
  require('redux-journal').write(``, `${TAGS}.init`)
  let service = {
    links: {
      journal: { from: 'redux-services/journal' }
    }
  }

  let api = service.api = (name) => service.links[name].service.api

  api.fetch = require('isomorphic-fetch')

  return service
}
