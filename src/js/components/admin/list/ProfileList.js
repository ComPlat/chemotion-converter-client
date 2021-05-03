import React, { Component } from "react"

import ListItem from './ListItem'

class ProfileList extends Component {

  constructor(props) {
    super(props)
  }

  render () {
    return (
      <ul className="list-group">
        {
          this.props.profiles.map((profile, i) => {
            return <ListItem
              key={i}
              title={profile.title}
              description={profile.description}
              identifier={profile.id}
              index={i}
              deleteProfile={this.props.deleteProfile}
              editProfile={this.props.editProfile} />
            }
          )
        }
      </ul>
    )
  }

}

export default ProfileList
