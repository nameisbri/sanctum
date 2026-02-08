import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-sanctum-950 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-sanctum-200 text-lg font-medium mb-2">Something went wrong.</p>
          <p className="text-sanctum-500 text-sm mb-6">The app hit an unexpected error.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/';
            }}
            className="px-6 py-3 rounded-xl bg-blood-500 text-white font-medium text-sm hover:bg-blood-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
