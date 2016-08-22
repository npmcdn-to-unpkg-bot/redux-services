import Prefixer             from 'inline-style-prefixer'

import React, { PropTypes } from 'react'

import Paper                from 'material-ui/Paper'
import TextField            from 'material-ui/TextField'

import {
  black, yellow200, yellow400, grey100, grey800,
} from 'material-ui/styles/colors'

export default class ServiceTable extends React.Component {
  static propTypes = {
    active:         PropTypes.bool,
    defaultDoc:     PropTypes.object,
    do:             PropTypes.object,
    docs:           PropTypes.array.isRequired,
    fields:         PropTypes.array.isRequired,
    onSelect:       PropTypes.func,
    title:          PropTypes.string,
  }

  constructor(props, context) {
    super(props, context)

    window.addEventListener('keydown', this.onKeyDown)

    const prefixer = new Prefixer()

    this.state = {
      root: {
        ref: 'root',
        style: prefixer.prefix({
          color: '#FFFFFF',
          fontFamily: `"Courier New", Courier, monospace`,
          fontSize: '10px',
        }),
      },

      selectX: 0,
      selectY: 0,

      title: {
        style: prefixer.prefix({
          backgroundColor: yellow200,
          color: black,
          fontWeight: 'bold',
          margin: '2px 2px 0px 2px',
          textAlign: 'center',
        }),
        value: this.props.title || 'TITLE',
      },

      table: {
        ref: 'table',
        style: prefixer.prefix(styles.table),
      },

      tableHeader: {
        ref: 'header',
        style: prefixer.prefix({
          ...styles.row,
          backgroundColor: grey100,
          color: black,
          fontWeight: 'bold',
          textAlign: 'center',
        }),
      },

      editDiv: {
        style: prefixer.prefix({
          display: 'none',
          position: 'absolute',
          left: '2px',
          right: '2px',
          top: '30vh',
          zIndex: '10100',
        }),
      },
      editPaper: {
        style: prefixer.prefix({
          margin: '0',
          padding: '0',
          backgroundColor: yellow200,
        }),
      },
      editTextField: {
        ref: 'editTextField',
        fullWidth: true,
        hintText: 'hint',
        floatingLabelText: 'float label',
        multiLine: true,
        rows: 4,
        width: '100%',
        onBlur: this.onEditBlur,
        onChange: this.onEditChange,
        onKeyDown: this.onEditKeyDown,
      },
    }
  }

  componentWillMount() {
    this.processOnSelect()
  }

  getDoc = () => {
    const { selectY } = this.state
    return this.props.docs[selectY]
  }

  getField = () => {
    const { selectX } = this.state
    return this.props.fields[selectX]
  }

  getValue = () => {
    return this.getDoc()[this.getField()]
  }

  goDown = () => {
    if (!this.props.active) return
    const { docs } = this.props
    const { selectY } = this.state
    if (selectY < docs.length - 1) {
      this.setState({ selectY: selectY + 1 })
      this.processOnSelect()
    }
  }

  goLeft = () => {
    if (!this.props.active) return
    const { selectX } = this.state
    if (selectX > 0) {
      this.setState({selectX: selectX - 1})
      this.processOnSelect()
    }
  }

  goRight = () => {
    if (!this.props.active) return
    const { fields } = this.props
    const { selectX } = this.state
    if (selectX < fields.length - 1) {
      this.setState({selectX: selectX + 1})
      this.processOnSelect()
    }
  }

  goUp = () => {
    if (!this.props.active) return
    const { selectY } = this.state
    if (selectY > 0) {
      this.setState({ selectY: selectY - 1 })
      this.processOnSelect()
    }
  }

  onKeyDown = (e) => {
    if (!this.props.active) return
    if (this.state.editDiv.style.display == 'none') {
      const keyDash = 189
      const keyEqualSign = 187

      const stop = () => {
        e.preventDefault()
        e.stopPropagation()
      }

      if (e.keyCode == 13) {
        stop()
        this.editEnable()
      }
      if (e.keyCode == 37) this.goLeft()
      if (e.keyCode == 38) this.goUp()
      if (e.keyCode == 39) this.goRight()
      if (e.keyCode == 40) this.goDown()
      if (e.keyCode == keyDash) this.serviceRemove()
      if (e.keyCode == keyEqualSign) this.serviceAdd()
    }
  }

  onEditChange = (e) => {
    this.elementUpdate(`editTextField`, { value: e.target.value })
  }

  editEnable = () => {
    const name = `editDiv`
    const nameText = `editTextField`
    const value = this.getValue()
    this.elementUpdate(name, { style: { ...this.elementStyle(name), display: 'block' }})
    this.elementUpdate(nameText, {
      floatingLabelText: `${this.getField()} = ${value}`,
      hintText: value,
      value: value,
    })
    this.refs[nameText].focus()
  }

  editAccept = () => {
    const name = 'editDiv'
    const nameText = 'editTextField'
    this.elementUpdate(name, { style: { ...this.elementStyle(name), display: 'none' }})
    this.refs[nameText].blur()

    const { _id } = this.getDoc()
    this.props.do.update({ _id, [this.getField()]: this.state.editTextField.value })
  }

  editCancel = () => {
    const name = 'editDiv'
    const nameText = 'editTextField'
    this.elementUpdate(name, { style: { ...this.elementStyle(name), display: 'none' }})
    this.refs[nameText].blur()
  }

  onEditBlur = (e) => {
    //this.editAccept()
  }

  onEditKeyDown = (e) => {
    e.stopPropagation()
    if (e.keyCode == 13) { this.editAccept() }
    if (e.keyCode == 27) { this.editCancel() }
  }

  serviceAdd = () => {
    const { defaultDoc = {}} = this.props
    this.props.do.insert({ name: 'NEW', ...defaultDoc })
  }

  serviceRemove = () => {
    this.props.do.remove(this.getDoc())
  }

  processOnSelect = () => {
    if (this.props.onSelect) this.props.onSelect({ doc: this.getDoc(), field: this.getField() })
  }

  elementStyle  = (name) => this.state[name].style
  elementUpdate = (name, payload) => this.setState({ [name]: { ...this.state[name], ...payload }})

  renderCol = (doc, indexY) => {
    const { fields = [] } = this.props
    const { selectX, selectY } = this.state

    let indexX = 0

    return fields.map(name => {
      let col = {}
      col.key = name
      col.style = { ...styles.cell }

      if (selectX == indexX) {
        if (selectY == indexY) {
          col.style.backgroundColor = yellow200
          col.style.color = black
        } else {
          col.style.backgroundColor = grey800
          col.style.color = black
        }
      }

      indexX++

      return (
        <div { ...col }>
          { doc[name] }
        </div>
      )
    })
  }

  renderDocs = (docs) => {
    let indexY = 0

    return docs.map(doc => {
      let Col = this.renderCol(doc, indexY++)

      return (
        <div key={ doc._id } style={ styles.row }>
          { Col }
        </div>
      )
    })
  }

  renderHeader = () => {
    const { fields = [] } = this.props
    const { selectX } = this.state

    let indexX = 0

    return fields.map(name => {
      let col = {}
      col.key = name
      col.style = { ...styles.cell }

      if (selectX == indexX) {
        col.style.backgroundColor = yellow200
        col.style.color = black
      }

      indexX++

      return <div { ...col }>
        { name }
      </div>
    })
  }

  render() {
    let root          = { ...this.state.root }

    let title         = { ...this.state.title }

    let table         = { ...this.state.table }
    let tableHeader   = { ...this.state.tableHeader }

    if (this.props.active) { tableHeader.style = { ...tableHeader.style, backgroundColor: yellow400 } }

    let editDiv       = { ...this.state.editDiv }
    let editPaper     = { ...this.state.editPaper }
    let editTextField = { ...this.state.editTextField }

    let Docs = this.renderDocs(this.props.docs)
    let Header = this.renderHeader()

    return <div { ...root }>
      <div { ...title }>
        { title.value }
      </div>
      <div { ...table }>
        <div { ...tableHeader }>
          { Header }
        </div>
        { Docs }
        <div { ...editDiv }>
          <Paper { ...editPaper }>
            <TextField { ...editTextField }/>
          </Paper>
        </div>
      </div>
    </div>
  }
}

const styles = {
  table: {
    display: 'table',
    borderSpacing: '2px',
  },
  row: {
    display: 'table-row',
    backgroundColor: '#110',
  },
  cell: {
    whiteSpace: 'nowrap',
    display: 'table-cell',
    border: '1px dotted white',
  },
}
