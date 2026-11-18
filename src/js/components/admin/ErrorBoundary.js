import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ProfileEditor error boundary caught:', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <Alert variant="danger" className="mt-3">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>{error.message || 'An unexpected error occurred while rendering the profile editor.'}</p>
          {this.props.onReset && (
            <Button variant="outline-danger" onClick={() => { this.setState({ error: null }); this.props.onReset(); }}>
              Back to profiles list
            </Button>
          )}
        </Alert>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
};

ErrorBoundary.defaultProps = {
  onReset: null,
};

export default ErrorBoundary;
