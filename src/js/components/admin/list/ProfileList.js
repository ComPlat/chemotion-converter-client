import React, { Component } from "react"
import PropTypes from 'prop-types';

import ProfileListItem from './ProfileListItem'

class ProfileList extends Component {

  render () {
    const { profiles, updateProfile, deleteProfile, downloadProfile, isAdmin } = this.props

    return (
      <ul className="list-group mb-20">
        {
          profiles.map((profile, index) => {
            return (
              <ProfileListItem
                key={index}
                id={profile.id}
                title={profile.title}
                isAdmin={isAdmin}
                description={profile.description}
                updateProfile={() => updateProfile(profile)}
                deleteProfile={() => deleteProfile(profile)}
                downloadProfile={() => downloadProfile(profile)} />
            )
          })
        }
      </ul>
    )
  }

}

ProfileList.propTypes = {
  profiles: PropTypes.array,
  updateProfile: PropTypes.func,
  deleteProfile: PropTypes.func,
  downloadProfile: PropTypes.func,
  isAdmin: PropTypes.bool
}

ProfileList.defaultProps = {
  isAdmin: false
};

export default ProfileList
