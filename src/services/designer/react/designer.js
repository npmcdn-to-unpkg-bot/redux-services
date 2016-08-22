import Prefixer             from 'inline-style-prefixer'
import React, { PropTypes } from 'react'

import {
  green400, red400,
} from 'material-ui/styles/colors'

import ServiceTable         from './serviceTable'

const tableList = ['serviceTable', 'linkTable', 'actionTable']

export default class Designer extends React.Component {
  static propTypes = {
    api:            PropTypes.func,
    designer:       PropTypes.object,
    factoryAction:  PropTypes.object,
    factoryLink:    PropTypes.object,
    factoryService: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context)

    window.addEventListener('keydown', this.onKeyDown)

    const prefixer = new Prefixer()

    this.state = {
      root: {
        ref: 'root',
        style: prefixer.prefix({
          backgroundColor: '#111',
          color: '#fff',
          opacity: '0.8',
          overflowY: 'scroll',
          position: 'absolute',
          top: '2px',
          left: '2px',
          right: '2px',
          bottom: '2px',
          zIndex: '10000',
        }),
      },

      selectX: 0,

      actionDiv: {
        style: prefixer.prefix({
          float: 'left',
        }),
      },
      actionTable: {
        do: this.props.api.get('factoryAction').do,
        fields: [
          '_id', 'name',
          'api',
          'saga', 'sagaInsert',
          'request', 'success', 'failure'
        ],
        title: `ACTION TABLE`,
      },

      linkDiv: {
        style: prefixer.prefix({
          float: 'left',
        }),
      },
      linkTable: {
        do: this.props.api.get('factoryLink').do,
        fields: ['_id', 'name', 'from'],
        title: `LINK TABLE`,
      },

      serviceID: '',

      serviceDiv: {
        style: prefixer.prefix({
          float: 'left',
        }),
      },
      serviceTable: {
        do: this.props.api.get('factoryService').do,
        fields: ['_id', 'name'],
        title: `SERVICE TABLE`,
        onSelect: this.onServiceTableSelect,
      },

    }
  }

  designerEnable = () => {
    this.updateElement('root', { style: { ...this.state.root.style, display: 'block' }})
  }

  designerDisable = () => {
    this.updateElement('root', { style: { ...this.state.root.style, display: 'none', }})
  }

  designerSwitch = () => {
    if (this.state.root.style.display == 'none') return this.designerEnable()
    return this.designerDisable()
  }

  getSelect = () => {
    return tableList[this.state.selectX]
  }

  goLeft = () => {
    if (this.state.selectX > 0) {
      this.setState({ selectX: this.state.selectX - 1 })
    } else {
      this.setState({ selectX: tableList.length - 1 })
    }
  }

  goRight = () => {
    if (this.state.selectX < tableList.length - 1) {
      this.setState({ selectX: this.state.selectX + 1 })
    } else {
      this.setState({ selectX: 0 })
    }
  }

  onKeyDown = (e) => {
    const keyAlt = 18
    const keyTab = 9
    if (e.keyCode == keyAlt) return this.designerSwitch()
    if (e.keyCode == keyTab) {
      e.preventDefault()
      if (e.shiftKey) return this.goLeft()
      return this.goRight()
    }
  }

  onServiceTableSelect = (payload) => {
    this.setState({ serviceID: payload.doc._id })
  }

  updateElement = (name, payload) => this.setState({ [name]: { ...this.state[name], ...payload }})

  render() {
    let root          = { ...this.state.root }

    let actionDiv     = { ...this.state.actionDiv }
    let actionTable   = { ...this.state.actionTable }

    let linkDiv       = { ...this.state.linkDiv }
    let linkTable     = { ...this.state.linkTable }

    let serviceDiv    = { ...this.state.serviceDiv }
    let serviceTable  = { ...this.state.serviceTable }

    const active = this.getSelect()

    actionTable.active = active == tableList[2]
    actionTable.docs = this.props.factoryAction.docs.filter(doc => doc.serviceID == this.state.serviceID)
    actionTable.defaultDoc = { serviceID: this.state.serviceID }

    linkTable.active = active == tableList[1]
    linkTable.docs = this.props.factoryLink.docs.filter(doc => doc.serviceID == this.state.serviceID)
    linkTable.defaultDoc = { serviceID: this.state.serviceID }

    serviceTable.active = active == tableList[0]
    serviceTable.docs = this.props.factoryService.docs

    return <div { ...root }>
      <div { ...serviceDiv }>
        <ServiceTable { ...serviceTable }/>
      </div>
      <div { ...linkDiv }>
        <ServiceTable { ...linkTable }/>
      </div>
      <div { ...actionDiv }>
        <ServiceTable { ...actionTable }/>
      </div>
    </div>
  }
}
