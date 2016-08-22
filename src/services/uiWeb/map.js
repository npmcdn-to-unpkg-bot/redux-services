import React, { PropTypes } from 'react'
import LYandex              from 'leaflet-plugins/layer/tile/Yandex'

export class MLayer extends React.Component {
  constructor(props, context) {
    super(props, context)
  }

  componentDidMount() {
    const yandex = new window.L.Yandex()
    this.props.map.addLayer(yandex)
  }

  render() {
    return <div/>
  }
}
