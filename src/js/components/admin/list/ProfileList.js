import React from "react"
import PropTypes from 'prop-types';
import {ListGroup} from 'react-bootstrap';

import ProfileListItem from './ProfileListItem'

function ProfileList({
											 profiles,
											 updateProfile,
											 replaceFile,
											 deleteProfile,
											 downloadProfile,
											 isAdmin,
											 toggleDisableProfile
										 }) {
	const sortedProfiles = profiles.sort((a, b) => a.title.localeCompare(b.title))

	return (<ListGroup>
			{sortedProfiles.map((profile) => (
				<ProfileListItem
					key={profile.id}
					id={profile.id}
					title={profile.title}
					isAdmin={isAdmin}
					description={profile.description}
					isDisabled={profile.isDisabled ?? false}
					isDefaultProfile={profile.isDefaultProfile}
					toggleDisableProfile={() => toggleDisableProfile(profile)}
					updateProfile={() => updateProfile(profile)}
					replaceFile={() => replaceFile(profile)}
					deleteProfile={() => deleteProfile(profile)}
					downloadProfile={() => downloadProfile(profile)}/>
			))}
		</ListGroup>
	)
}

ProfileList.propTypes = {
	profiles: PropTypes.array,
	updateProfile: PropTypes.func,
	replaceProfile: PropTypes.func,
	deleteProfile: PropTypes.func,
	downloadProfile: PropTypes.func,
	toggleDisableProfile: PropTypes.func,
	isAdmin: PropTypes.bool
}

ProfileList.defaultProps = {
	isAdmin: false
};

export default ProfileList
