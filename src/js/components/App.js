import React, {useState} from 'react'
import {Alert, Button, Col, Container, Form, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';

import ConverterApi from '../api/ConverterApi'


function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('jcampzip');

  const onFileChangeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    setError(false);
    setErrorMessage('');
  };

  const onFormatChangeHandler = (event) => {
    setFormat(event.target.value);
  };

  const onSubmitFileHandler = () => {
    setIsLoading(true);

    ConverterApi.fetchConversion(selectedFile, format)
      .then(message => {
        if (message === 'success') {
          setIsLoading(false);
        }
      })
      .catch(error => {
        if (error.status === 413) {
          setError(true);
          setErrorMessage('The uploaded file is too large.');
          setIsLoading(false);
        } else {
          error.text().then(errorMessage => {
            setError(true);
            setErrorMessage(JSON.parse(errorMessage).error);
            setIsLoading(false);
          })
        }
      })
  };

  return (
    <Container>
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <h1 className="text-center p-5">Chemotion file converter</h1>
        </Col>
      </Row>
      <Row>
        <Col md={{ span: 4, offset: 4 }}>
          <p className="text-center">Please upload a file.</p>
          <Form>
            <Form.Group className="mb-2">
              <Form.Control type="file" id="fileUpload" onChange={onFileChangeHandler}/>
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="primary" size="lg" onClick={onSubmitFileHandler}>Upload</Button>
            </div>
            <p className="text-center">For testing and advanced functions (like ontologies), you could also use the following command:
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="curl-ontology-tooltip">
                      The URL could be different, if front- and backend are running in productive env, eg. <code>IP:Port/api/v1/conversions</code> <br />
                      <code>username:password</code> are ignored in dev environment. <br />
                      Replace <code>obo:id</code> with a valid CHMO OBO ID, e.g. <code>CHMO:0001007</code> for
                      &quot;thin-layer chromatography&quot;. The plain term name is not resolved &ndash; use the ID.
                    </Tooltip>
                  }
                >
                  <code style={{cursor: 'help'}}> curl -X POST http://localhost:5000/conversions   -u username:password   -F "file=@/path/to/your/file.xyz"   -F "format=jcampzip" -F "ontology=obo:id" -o output.zip</code>
                </OverlayTrigger>!
              </p>
              <Form.Group controlId="format-select" className="mt-3">
              <Form.Label column="sm">Conversion format</Form.Label>
              <Form.Select value={format} onChange={onFormatChangeHandler}>
                <option value="jcampzip">Zip file containing JCAMP files</option>
                <option value="jcamp">Single JCAMP file</option>
                <option value="rdf">The Resource Description Framework (.ttl)</option>
                <option value="metajson">Meta JSON (.json)</option>
              </Form.Select>
            </Form.Group>
          </Form>
          {error && (
            <Alert variant="danger" className="mt-3">{errorMessage}</Alert>
          )}
          {isLoading && (
            <div className="text-primary text-center" role="status">
              <span>Loading...</span>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  )
}

export default App
