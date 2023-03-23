import React, { Component } from "react"
import PropTypes from 'prop-types';

class ProfileListItem extends Component {

  render () {
    const { id, title, description, updateProfile, deleteProfile, downloadProfile, isAdmin } = this.props

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
            <span className="btn btn-success btn-sm mr-10" disabled={!isAdmin} onClick={isAdmin ? downloadProfile : () => {}}>Download</span>
            <span className="btn btn-primary btn-sm mr-10" disabled={!isAdmin} onClick={isAdmin ? updateProfile : () => {}}>Edit</span>
            <span className="btn btn-danger btn-sm"  disabled={!isAdmin} onClick={isAdmin ? deleteProfile : () => {}}>Delete</span>
          </div>
        </div>
      </li>
    )
  }

}

ProfileListItem.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  updateProfile: PropTypes.func,
  deleteProfile: PropTypes.func,
  downloadProfile: PropTypes.func,
  isAdmin: PropTypes.bool
}

ProfileListItem.defaultProps = {
  isAdmin: false
};

export default ProfileListItem
