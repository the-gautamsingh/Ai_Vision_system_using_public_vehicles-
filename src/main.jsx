import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught An Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', fontFamily: 'monospace', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
          <h1 style={{ color: '#f43f5e', fontSize: '20px', fontWeight: 'bold' }}>⚠️ URBAN INTELLIGENCE — Application Rendering Error</h1>
          <p style={{ color: '#cbd5e1', marginTop: '10px' }}>An unexpected error occurred while mounting the application component tree:</p>
          <pre style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', overflowX: 'auto', color: '#fb7185', marginTop: '15px', border: '1px solid #334155' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <pre style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', overflowX: 'auto', color: '#94a3b8', marginTop: '15px', border: '1px solid #334155', fontSize: '11px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0f766e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
