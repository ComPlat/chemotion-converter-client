import React, { Component } from "react"

import ProfileListItem from './ProfileListItem'

class ProfileList extends Component {

  render () {
    const { profiles, deleteProfile, editProfile, downloadProfile } = this.props

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
                deleteProfile={() => deleteProfile(index, profile.id)}
                editProfile={() => editProfile(index, profile.id)}
                downloadProfile={() => downloadProfile(index, profile.id)} />
            )
          })
        }
      </ul>
    )
  }

}

export default ProfileList
