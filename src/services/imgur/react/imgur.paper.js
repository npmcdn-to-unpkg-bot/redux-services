import React, { PropTypes } from 'react'
import { write }            from 'redux-journal'
import { manager }          from 'redux-manager'

import IconButton           from 'material-ui/IconButton'
import Paper                from 'material-ui/Paper'
import RemoveCircle         from 'material-ui/svg-icons/content/remove-circle-outline'

import { actions }          from '../actions'
import { TAGS, SERVICE }    from '../config'
import { select }           from '../select'

const tags = `${TAGS}.react.imgur.paper`

class ImgurPaper extends React.Component {
  constructor(props, context) {
    super(props, context)
    const { style = styles.rootPaper } = props

    this.state = {
      service: {
        clientID: 'adcf840e0bf408c',
      },

      controlsDiv: {
        style: styles.controlsDiv,
      },
      controlsPaper: {
        style: styles.controlsPaper,
        zDepth: 2,
      },
      imageDiv: {
        style: styles.imageDiv,
      },
      imageImg: {
        style: styles.imageImg,
      },
      imageInput: {
        style: styles.imageInput,
        type: 'file',
      },
      rootPaper: {
        style,
        zDepth: 2,
      },
    }
  }

  onLoad = (e) => {
    const result = e.target.result
    const { service: { clientID }, serviceName } = this.state
    const imageBase64 = result.replace(/^data:image\/[^]+base64,/, '')
    if (this.props.onUpload) this.props.onUpload({ clientID, imageBase64 })
  }

  onChange = (e) => {
    const reader = new FileReader()
    reader.onload = this.onLoad
    reader.readAsDataURL(e.currentTarget.files[0])
  }

  onTouchTap = (e) => {
    write(``, `${tags}.onTouchTap`)
    e.preventDefault()
    e.stopPropagation()
    this.refs.image.click()
  }

  onRemove = (e) => {
    write(``, `${tags}.onRemove`)
    e.preventDefault()
    e.stopPropagation()
    if (this.props.onRemove) this.props.onRemove()
  }

  render() {
    const { imgurDoc = {} } = this.props
    const {
      controlsDiv, controlsPaper, imageDiv, imageImg, imageInput, rootPaper,
    } = this.state

    const showImage = () => imgurDoc.image ? (
      <div>
        <div { ...imageDiv }>
          <img { ...imageImg } src={ imgurDoc.image }/>
        </div>
        <div { ...controlsDiv }>
          <Paper { ...controlsPaper }>
            <IconButton onTouchTap={ this.onRemove }>
              <RemoveCircle/>
            </IconButton>
          </Paper>
        </div>
      </div>
    ) : this.props.children

    return <Paper { ...rootPaper } onTouchTap={ this.onTouchTap }>
      { showImage() }
      <input ref='image' { ...imageInput } onChange={ this.onChange } />
    </Paper>
  }
}

ImgurPaper.propTypes = {
  imgurDoc: PropTypes.object.isRequired,
  onRemove: PropTypes.func,
  onUpload: PropTypes.func,
}

import {
  cyan100, cyan400
} from 'material-ui/styles/colors'

const styles = {
  controlsDiv: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    zIndex: '10',
  },
  controlsPaper: {
    backgroundColor: cyan100,
    borderRadius: '50%',
  },
  imageDiv: {
    display:  'inline-block',
    overflow: 'hidden',
  },
  imageImg: {
    width: '100%',
    height: '100%',
  },
  imageInput: {
    display: 'none',
  },
  rootPaper: {
    backgroundColor: cyan400,
    minHeight: '10vh',
    position: 'relative',
    textAlign: 'center',
    width: 'auto', height: 'auto',
  },
}

export default ImgurPaper
