import React, { Component } from "react"
import PropTypes from 'prop-types';

import ProfileListItem from './ProfileListItem'

class ReaderList extends Component {

  render () {
    const { readers, updateReader, deleteReader, downloadReader } = this.props

    return (
      <ul className="list-group mb-20">
        {
          readers.map((reader, index) => {
            return (
              <ProfileListItem
                key={index}
                id={reader.id}
                title={reader.title}
                description={reader.description}
                updateProfile={() => updateReader(reader)}
                deleteProfile={() => deleteReader(reader)}
                downloadProfile={() => downloadReader(reader)} />
            )
          })
        }
      </ul>
    )
  }

}

ReaderList.propTypes = {
  readers: PropTypes.array,
  updateReader: PropTypes.func,
  deleteReader: PropTypes.func,
  downloadReader: PropTypes.func
}

export default ReaderList
