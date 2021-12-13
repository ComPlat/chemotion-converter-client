import React, { Component } from "react"

class ListItem extends Component {

  constructor(props) {
    super(props)
    this.state = {}
    this.deleteProfile = this.deleteProfile.bind(this)
    this.editProfile = this.editProfile.bind(this)
    this.downloadProfile = this.downloadProfile.bind(this)
  }

  deleteProfile () {
    this.props.deleteProfile(this.props.index, this.props.identifier)
  }

  editProfile () {
    this.props.editProfile(this.props.index, this.props.identifier)
  }

  downloadProfile () {
    this.props.downloadProfile(this.props.index, this.props.identifier)
  }

  render () {
    return (
      <li className="list-group-item d-flex justify-content-between align-items-center">
        <div className="ms-2 me-auto">
          <div className="font-weight-bold">{this.props.title}</div>
          {this.props.description}
        </div>
        <div>
          <span className="btn btn-success btn-sm mr-2" onClick={this.downloadProfile}>Download</span>
          <span className="btn btn-primary btn-sm mr-2" onClick={this.editProfile}>Edit</span>
          <span className="btn btn-danger btn-sm" onClick={this.deleteProfile}>Delete</span>
        </div>
      </li>
    )
  }

}

export default ListItem
