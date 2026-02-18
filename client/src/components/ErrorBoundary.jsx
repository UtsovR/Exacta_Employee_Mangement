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
        console.error("CRITICAL UI ERROR:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-brand-gray-light p-6">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold">!</span>
                        </div>
                        <h2 className="text-xl font-bold text-brand-dark mb-2">Something went wrong</h2>
                        <p className="text-brand-gray-text text-sm mb-6">
                            The application encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-brand-blue-DEFAULT text-white py-2 rounded-lg font-semibold hover:bg-brand-blue-dark transition-colors"
                        >
                            Refresh Page
                        </button>
                        <details className="mt-4 text-left text-xs text-red-500 overflow-auto max-h-40">
                            <summary className="cursor-pointer font-semibold underline">Error Details</summary>
                            <pre className="mt-2 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
                        </details>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
