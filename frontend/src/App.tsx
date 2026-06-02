import { Component, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layout/DashboardLayout';
import { Dashboard } from './components/Dashboard';
import { Insights } from './components/Insights';
import { Strategy } from './components/Strategy';
import { Landing } from './components/Landing';
import { Whitepaper } from './components/Whitepaper';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
          <p className="text-[10px] font-bold tracking-widest text-text-muted">
            Something went wrong loading this page.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="btn-secondary py-2 px-5 text-[10px] tracking-widest"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/whitepaper" element={<Whitepaper />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
          <Route path="/insights" element={<ErrorBoundary><Insights /></ErrorBoundary>} />
          <Route path="/strategy" element={<ErrorBoundary><Strategy /></ErrorBoundary>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;