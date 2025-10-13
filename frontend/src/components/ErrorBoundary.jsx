import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Something went wrong
                  </h5>
                </div>
                <div className="card-body">
                  <p className="card-text">
                    We apologize for the inconvenience. An unexpected error has occurred.
                  </p>
                  {this.state.error && (
                    <div className="alert alert-light small" role="alert">
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                  )}
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={this.handleReload}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reload Page
                    </button>
                    <a 
                      href="/" 
                      className="btn btn-outline-secondary"
                    >
                      <i className="bi bi-house me-2"></i>
                      Go to Home
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
