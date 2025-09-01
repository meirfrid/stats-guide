
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="analysis-card border border-destructive/30 bg-destructive/5">
          <h3 className="text-destructive font-semibold mb-2">אירעה שגיאה בעת הצגת התוצאות</h3>
          <p className="text-sm text-muted-foreground mb-3">
            אפשר להמשיך לעבוד מצד שמאל (העלאה ותצוגת נתונים). נסה לנתח שוב או לרענן את הדף.
          </p>
          <button
            onClick={this.handleRetry}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm"
          >
            נסה שוב
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
