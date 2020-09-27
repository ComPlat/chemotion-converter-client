import React, { Component } from "react"

class IndentifierInput extends Component {

  constructor(props) {

    super(props)
    this.state = {
      disabled: true
    }

    this.onSelectMetadata = this.onSelectMetadata.bind(this)
    this.onSelectTable = this.onSelectTable.bind(this)
    this.toogleIsRegex = this.toogleIsRegex.bind(this)
    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.updateLinenumber = this.updateLinenumber.bind(this)
    this.updateValue = this.updateValue.bind(this)
  }

  onSelectMetadata(event) {
    let option = event.target.value
    let value = this.props.options[option]
    let data = {
      metadataKey: option,
      value: value,
      isExact: true
    }
    this.props.updateIdentifiers(this.props.id, data)
    this.setState({
      disabled: true
    })
  }

  onSelectTable(event) {
    let option = event.target.value
    let table = this.props.options[option]
    let data = {
      table: table
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  updateLinenumber (event) {
    let linenumber = event.target.value
    let data = {
      linenumber: linenumber
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  updateValue (event) {
    let value = event.target.value
    let data = {
      value: value
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  removeIdentifier() {
    this.props.removeIdentifier(this.props.id)
  }

  toogleIsRegex(event) {
    let data = {}
    if (!this.props.isRegex === this.props.isExact) {
      let isRegex = !this.props.isRegex
      let isExact = !this.props.isExact
      let disabled = !isRegex
      data['isRegex'] = isRegex
      data['isExact'] = isExact
      this.setState({
        disabled: disabled
      })
    } else {
      if (event.target.value == 'regex') {
        let isRegex = !this.props.isRegex
        data['isRegex'] = isRegex
      } else {
        let isExact = !this.props.isExact
        data['isExact'] = isExact
      }
    }
    this.props.updateIdentifiers(this.props.id, data)
  }

  render() {
    return (
      <form>
        <div className="form-row">

          {this.props.type == 'metadata' &&
            <div className="col-auto">
              <label className="sr-only" htmlFor={"metadataKeySelect" + this.props.id}>Metadata</label>
              <select className="form-control form-control-sm" id={"metadataKeySelect" + this.props.id} onChange={this.onSelectMetadata}>
                {
                  Object.keys(this.props.options).map((option, i) =>
                    <option key={i}>{option}</option>
                  )
                }
              </select>
            </div>
          }

          {this.props.type == 'tabledata' &&
            <div className="col">
              <label className="sr-only" htmlFor={"tabledataTableSelect" + this.props.id}>Tabledata</label>
              <select className="form-control form-control-sm" id={"abledataTableSelect" + this.props.id} onChange={this.onSelectTable}>
                {
                  Object.keys(this.props.options).map((option, i) =>
                    <option key={i}>{"Table #" + i + 1}</option>
                  )
                }
              </select>
            </div>
          }

          {this.props.type == 'tabledata' &&
            <div className="col-2">
              <label className="sr-only" htmlFor={"tabledataLineSelect" + this.props.id}>Line</label>
              <input
                onChange={this.updateLinenumber}
                type="text"
                placeholder={'Linenumber'}
                className="form-control form-control-sm"
                id={"tabledataLineSelect" + this.props.id}
                value={this.props.linenumber}
              />
            </div>
          }

          <div className="col-auto">
            <label className="sr-only" htmlFor={"inditifierValue" + this.props.id}>value</label>
            <div className="input-group mb-2">
              <input
                onChange={this.updateValue}
                type="text"
                className="form-control form-control-sm"
                id={"inditifierValue" + this.props.id}
                disabled={this.props.type === 'metadata' && this.state.disabled}
                value={this.props.value}
              />
            </div>
          </div>

          <div className="col">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio" name="inditifierInterpretOptions"
                id={"interpreteExact" + this.props.id}
                disabled={this.props.type === 'metadata' && this.props.value == ''}
                value="exactmatch"
                onChange={this.toogleIsRegex} checked={this.props.isExact}
              />
              <label className="form-check-label" htmlFor={"interpreteExact" + this.props.id}>exact Match</label>
            </div>

            <div className="form-check form-check-inline">
              <input className="form-check-input"
                type="radio" name="inditifierInterpretOptions"
                id={"interpreteReges" + this.props.id}
                disabled={this.props.type === 'metadata' && this.props.value == ''}
                value="regex"
                onChange={this.toogleIsRegex} checked={this.props.isRegex}
              />
              <label className="form-check-label" htmlFor={"interpreteReges" + this.props.id}>regex</label>
            </div>
          </div>

          <div className="col-auto">
            <button type="button" className="btn btn-danger btn-sm" onClick={this.removeIdentifier}><i className="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </form>
    )
  }
}

export default IndentifierInput