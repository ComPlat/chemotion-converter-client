import React, { Component } from "react"

class ProfileListItem extends Component {

  render () {
    const { id, title, description, deleteProfile, editProfile, downloadProfile } = this.props

    return (
      <li className="list-group-item">
        <div className="row">
          <div className="col-lg-6">
            <div className="font-weight-bold">{title}</div>
            {description}
          </div>
          <div className="col-lg-6">
            <code className="mr-2">{id}</code>
            <span className="btn btn-success btn-sm mr-2" onClick={downloadProfile}>Download</span>
            <span className="btn btn-primary btn-sm mr-2" onClick={editProfile}>Edit</span>
            <span className="btn btn-danger btn-sm" onClick={deleteProfile}>Delete</span>
          </div>
        </div>
      </li>
    )
  }

}

export default ProfileListItem
