import { write, error } from 'redux-journal'
import { TAGS }         from '../config'

const tags = `${TAGS}.api.local`

export const configAPILocal = ({ fetch }) => {
  const upload = ({ clientID, imageBase64 }) => {
    write(`({ clientID = ${clientID}, imageBase64 = ${typeof imageBase64})`, `${tags}.upload`)
    return fetch(
      'https://api.imgur.com/3/image',
      {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${clientID}`,
          Accept: 'application/json'
        },
        body: imageBase64
      }
    ).then((response) => {
      return response.json()
    }).then((json) => {
      if (json.success && json.status == 200) {
        return json['data']['link']
      } else {
        throw new Error(`${json.error} json.success = ${json.success} && json.status = ${json.status}`)
      }
    })
  }

  return { upload }
}
