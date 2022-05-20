import React, { Component } from "react"

import ProfileListItem from './ProfileListItem'

class ProfileList extends Component {

  render () {
    const { profiles, updateProfile, deleteProfile, downloadProfile } = this.props

    return (
      <ul className="list-group mb-20">
        {
          profiles.map((profile, index) => {
            return (
              <ProfileListItem
                key={index}
                id={profile.id}
                title={profile.title}
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

export default ProfileList
