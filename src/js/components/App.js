import React, { Component } from 'react'
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';

import ConverterApi from '../api/ConverterApi'


class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      selectedFile: null,
      error: false,
      errorMessage: '',
      isLoading: false,
      format: 'jcampzip'
    }

    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
    this.onFormatChangeHandler = this.onFormatChangeHandler.bind(this)
  }

  onFileChangeHandler(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
      error: false,
      errorMessage: ''
    })
  }

  onFormatChangeHandler(event) {
    this.setState({
      format: event.target.value
    })
  }

  onSubmitFileHandler() {
    const { selectedFile } = this.state

    this.setState({
      isLoading: true
    })

    ConverterApi.fetchConversion(selectedFile, this.state.format)
      .then(message => {
        if (message === 'success') {
          this.setState({
            isLoading: false
          })
        }
      })
      .catch(error => {
        if (error.status === 413) {
          this.setState({
            error: true,
            errorMessage: 'The uploaded file is too large.',
            isLoading: false
          })
        } else {
          error.text().then( errorMessage => {
            this.setState({
              error:true,
              errorMessage: JSON.parse(errorMessage).error,
              isLoading: false
            })
          })
        }
      })
  }

  render() {
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
                <Form.Control type="file" id="fileUpload" onChange={this.onFileChangeHandler}/>
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="primary" size="lg" onClick={this.onSubmitFileHandler}>Upload</Button>
              </div>
              <p className="text-center">For testing and advanced functions (like ontologies), you could also use the following command:
                <code> curl -X POST http://localhost:5000/conversions   -u username:password   -F "file=@/path/to/your/file.xyz"   -F "format=jcampzip" -F "ontology=???" -o output.zip</code>!
              </p>
              <Form.Group controlId="format-select" className="mt-3">
                <Form.Label>Conversion format</Form.Label>
                <Form.Select value={this.state.format} onChange={this.onFormatChangeHandler}>
                  <option value="jcampzip">Zip file containing JCAMP files</option>
                  <option value="jcamp">Single JCAMP file</option>
                </Form.Select>
              </Form.Group>
            </Form>
            {this.state.error && (
              <Alert variant="danger" className="mt-3">{this.state.errorMessage}</Alert>
            )}
            {this.state.isLoading && (
              <div className="text-primary text-center" role="status">
                <span>Loading...</span>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    )
  }
}

export default App
