import React, { PropTypes } from 'react'

import {
  yellow200
} from 'material-ui/styles/colors'

export default class ServiceTableCell extends React.Component {
  static propTypes = {
    apiService: PropTypes.func,
    selected: PropTypes.object,
    serviceDoc: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context)

    const {
      serviceDoc,
    } = props

    this.state = {
      root: {
        ref: 'Root',
        style: {
          ...styles.row,
        },
      },
      InputID: {
        ref: 'InputID',
        style: {
          ...styles.cell,
          backgroundColor: '#555',
        },
        value: serviceDoc._id,
      },
      InputName: {
        ref: 'InputName',
        style: {
          ...styles.cell,
        },
        value: serviceDoc.name,
      }
    }
  }

  updateElement = (name, payload) => this.setState({ [name]: { ...this.state[name], ...payload }})

  render() {
    const {
      selected = {},
      serviceDoc,
    } = this.props

    let Root      = { ...this.state.Root }
    let InputID   = { ...this.state.InputID }
    let InputName = { ...this.state.InputName }

    if (selected.selectedID == serviceDoc._id){
      if (selected.field == '_id') InputID.style = { ...InputID.style, backgroundColor: yellow200, color: '#000', }
      if (selected.field == 'name') InputName.style = { ...InputName.style, backgroundColor: yellow200, color: '#000', }
    }

    return <div { ...Root }>
      <div { ...InputID }>{ InputID.value }</div>
      <div { ...InputName }>{ InputName.value }</div>
    </div>
  }
}

const styles = {
  row: {
    display: 'table-row',
  },
  cell: {
    display: 'table-cell',
    border: '1px dotted white',
  },
}
