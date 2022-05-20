import React, { Component } from "react"

class ProfileListItem extends Component {

  render () {
    const { id, title, description, updateProfile, deleteProfile, downloadProfile } = this.props

    return (
      <li className="list-group-item">
        <div className="row">
          <div className="col-md-6">
            <div>
              <strong>{title}</strong>
            </div>
            {description}
          </div>
          <div className="col-md-6 text-right">
            <code className="mr-10">{id}</code>
            <span className="btn btn-success btn-sm mr-10" onClick={downloadProfile}>Download</span>
            <span className="btn btn-primary btn-sm mr-10" onClick={updateProfile}>Edit</span>
            <span className="btn btn-danger btn-sm" onClick={deleteProfile}>Delete</span>
          </div>
        </div>
      </li>
    )
  }

}

export default ProfileListItem
