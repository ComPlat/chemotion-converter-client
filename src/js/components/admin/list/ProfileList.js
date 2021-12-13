import React, { Component } from "react"

import ListItem from './ListItem'

class ProfileList extends Component {

  constructor(props) {
    super(props)
  }

  render () {
    return (
      <ul className="list-group mb-5">
        {
          this.props.profiles.map((profile, i) => {
            return <ListItem
              key={i}
              id={profile.id}
              title={profile.title}
              description={profile.description}
              identifier={profile.id}
              index={i}
              deleteProfile={this.props.deleteProfile}
              editProfile={this.props.editProfile}
              downloadProfile={this.props.downloadProfile} />
            }
          )
        }
      </ul>
    )
  }

}

export default ProfileList
