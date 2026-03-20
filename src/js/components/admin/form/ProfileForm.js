import React, {useState} from "react"
import PropTypes from 'prop-types';
import {
	Button,
	Col,
	Row,
	Alert, ButtonGroup, Modal
} from 'react-bootstrap';

import InputTables from "./common/InputTables";
import FormNavigatorCol from "./controllComponents/FormNavigator";
import FileUploadForm from "../upload/FileUploadForm";

const profileShape = PropTypes.shape({
	data: PropTypes.shape({
		metadata: PropTypes.object,
		tables: PropTypes.array
	}),
	tables: PropTypes.arrayOf(PropTypes.shape({
		table: PropTypes.object,
		loopType: PropTypes.string
	})).isRequired
});

function ProfileForm({
											 status,
											 profile,
											 options,
											 datasets,
											 updateProfile,
											 storeProfile,
											 error,
											 errorMessage,
											 onFileChangeHandler,
											 onSubmitFileHandler,
											 isLoading
										 }) {

	const [activeTabKey, setActiveTabKey] = useState("basics");
	const [showFileUpload, setShowFileUpload] = useState(false);

	const onSubmit = (event) => {
		event.preventDefault();
		const errors = [];

		check_loop_fields(profile, errors);

		if (errors.length > 0) {
			alert(errors.join("\n"));
			return;
		}

		storeProfile();
	}

	const check_loop_fields = (profile, errors) => {
		profile.tables.forEach((t, tableIndex) => {
			t.table['loop_header']?.forEach((lh, lhIndex) => {
				if (lh.column?.columnIndex == null) {
					errors.push(`In Output Table ${tableIndex}: no column header selected for loop condition ${lhIndex}`);
				}
			});
			t.table['loop_theader']?.forEach((lh, lhIndex) => {
				if (lh.line === "" || lh.regex === "") {
					errors.push(`In Output Table ${tableIndex}: no line or regex selected for loop condition ${lhIndex}`);
				}
			});
			t.table['loop_metadata']?.forEach((lh, lhIndex) => {
				if (lh.metadata == null) {
					errors.push(`In Output Table ${tableIndex}: no metadata selected for loop condition ${lhIndex}`);
				}
			});
		});
	}

	const handleShowFileUpload = () => setShowFileUpload(true);
	const handleCloseFileUpload = () => setShowFileUpload(false);
	const submitFileHandler = async () => {
		const res = await onSubmitFileHandler();
		if (res) {
			handleCloseFileUpload();
		}
	}


	if (!profile?.data) return null;

	profile.tables.map((table) => table.loopType = table.loopType ?? "all")

	return (
		<div>
			<Modal show={showFileUpload} onHide={handleCloseFileUpload}>
				<Modal.Header closeButton>
					<Modal.Title>Replace File</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<FileUploadForm
						onFileChangeHandler={onFileChangeHandler}
						onSubmitFileHandler={submitFileHandler}
						errorMessage={errorMessage}
						error={error}
						isLoading={isLoading}
						disabled={false}
					/>
				</Modal.Body>
			</Modal>
			<ButtonGroup style={{
				position: "fixed",
				top: '10px',
				right: '10px',
			}}>
				<Button variant="warning" onClick={handleShowFileUpload}>
					Replace input File
				</Button>
				<Button
					variant="primary" onClick={onSubmit}>
					{status === 'create' && 'Create profile'}
					{status === 'update' && 'Update profile'}
				</Button>
			</ButtonGroup>
			<Row>
				{error && (
					<div className="fixed-alert-container">
						<Alert variant="danger" dismissible>{errorMessage}</Alert>
					</div>
				)}
				<InputTables setActiveTabKey={setActiveTabKey} profile={profile} setProfile={updateProfile}/>
				<FormNavigatorCol
					profile={profile}
					datasets={datasets}
					options={options}
					setProfile={updateProfile}
					activeTabKey={activeTabKey}
					setActiveTabKey={setActiveTabKey}
				/>

			</Row>

		</div>
	)
}

ProfileForm.propTypes = {
	status: PropTypes.string,
	profile: profileShape,
	options: PropTypes.object,
	datasets: PropTypes.array,
	updateProfile: PropTypes.func,
	storeProfile: PropTypes.func,
	error: PropTypes.bool,
	errorMessage: PropTypes.string,
	onFileChangeHandler: PropTypes.func,
	onSubmitFileHandler: PropTypes.func,
	isLoading: PropTypes.bool,
}

export default ProfileForm
