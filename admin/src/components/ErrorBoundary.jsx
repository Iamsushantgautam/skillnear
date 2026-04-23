import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff5f5', borderRadius: '12px', border: '1px solid #feb2b2', margin: '20px' }}>
                    <h2 style={{ color: '#c53030', marginBottom: '16px' }}>Something went wrong.</h2>
                    <p style={{ color: '#742a2a', marginBottom: '24px' }}>The component crashed due to an unexpected error. This usually happens when data is missing or improperly formatted.</p>
                    <pre style={{ textAlign: 'left', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.8rem', color: '#4a5568' }}>
                        {this.state.error?.toString()}
                    </pre>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '24px', padding: '10px 20px', backgroundColor: '#c53030', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
