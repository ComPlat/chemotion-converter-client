import React, { Component } from "react"

class ListItem extends Component {

    constructor(props) {

        super(props)
        this.state = {}
        this.deleteProfile = this.deleteProfile.bind(this)
    }

    deleteProfile () {
        this.props.deleteProfile(this.props.index, this.props.identifier)
    }

    render () {
        return (
            <li className="list-group-item d-flex justify-content-between align-items-center">
                <div className="ms-2 me-auto">
                    <div className="font-weight-bold">{ this.props.title }</div>
                          { this.props.description }
                    </div>
                <span className="btn btn-danger btn-sm" onClick={this.deleteProfile}>Delete</span>
            </li>
        )
    }
}

export default ListItem