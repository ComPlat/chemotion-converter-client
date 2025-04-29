import React, {Component} from "react"
import PropTypes from 'prop-types';
import {Button, ListGroup} from 'react-bootstrap';

class ProfileListItem extends Component {

    render() {
        const {
            id,
            title,
            description,
            updateProfile,
            deleteProfile,
            downloadProfile,
            isAdmin,
            toggleDisableProfile,
            isDisabled
        } = this.props

        const disabledButton = function () {
            if (isDisabled) {
                return <Button variant="danger" size="sm" disabled={!isAdmin}
                                onClick={toggleDisableProfile}> Enable < /Button>;
            }
            return <Button variant="success" size="sm" disabled={!isAdmin}
                           onClick={toggleDisableProfile}> Disable < /Button>;
        }

        return (
            <ListGroup.Item>
                <div className="d-flex justify-content-between">
                    <div>
                        <div className="fw-bold">
                            {title}
                        </div>
                        {description}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <code>{id}</code>
                        {disabledButton()}
                        <Button variant="success" size="sm" disabled={!isAdmin}
                                onClick={downloadProfile}>Download</Button>
                        <Button variant="primary" size="sm" disabled={!isAdmin} onClick={updateProfile}>Edit</Button>
                        <Button variant="danger" size="sm" disabled={!isAdmin} onClick={deleteProfile}>Delete</Button>
                    </div>
                </div>
            </ListGroup.Item>
        )
    }

}

ProfileListItem.propTypes = {
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    isDisabled: PropTypes.bool,
    toggleDisableProfile: PropTypes.func,
    updateProfile: PropTypes.func,
    deleteProfile: PropTypes.func,
    downloadProfile: PropTypes.func,
    isAdmin: PropTypes.bool
}

ProfileListItem.defaultProps = {
    isAdmin: false
};

export default ProfileListItem
