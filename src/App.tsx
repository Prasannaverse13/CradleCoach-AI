import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/Landing/LandingPage';
import { SignUp } from './components/Auth/SignUp';
import { SignIn } from './components/Auth/SignIn';
import { ResetPassword } from './components/Auth/ResetPassword';
import { ChildProfile } from './components/Onboarding/ChildProfile';
import { GoalsSelection } from './components/Onboarding/GoalsSelection';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ChatPage } from './components/Chat/ChatPage';
import { MilestonesPage } from './components/Milestones/MilestonesPage';
import { ResourcesPage } from './components/Resources/ResourcesPage';
import { ProfileSettings } from './components/Profile/ProfileSettings';
import { StoriesPage } from './components/Stories/StoriesPage';

function AppContent() {
  const { user, activeChild, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('');
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');

  useEffect(() => {
    if (loading) return;

    const path = window.location.pathname;

    if (path === '/chat') {
      setCurrentPage('chat');
    } else if (path === '/milestones') {
      setCurrentPage('milestones');
    } else if (path === '/resources') {
      setCurrentPage('resources');
    } else if (path === '/stories') {
      setCurrentPage('stories');
    } else if (path === '/profile') {
      setCurrentPage('profile');
    } else if (path === '/reset-password') {
      setCurrentPage('reset-password');
    } else if (path === '/' || path === '') {
      if (user && activeChild) {
        setCurrentPage('dashboard');
      } else if (user && !activeChild) {
        setCurrentPage('onboarding-child');
      } else {
        setCurrentPage('landing');
      }
    }
  }, [user, activeChild, loading]);

  useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      const path = window.location.pathname;
      if (path === '/chat') {
        setCurrentPage('chat');
      } else if (path === '/milestones') {
        setCurrentPage('milestones');
      } else if (path === '/resources') {
        setCurrentPage('resources');
      } else if (path === '/stories') {
        setCurrentPage('stories');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/reset-password') {
        setCurrentPage('reset-password');
      } else {
        setCurrentPage('dashboard');
      }
    };

    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      const path = args[2] as string;
      if (path === '/chat') {
        setCurrentPage('chat');
      } else if (path === '/milestones') {
        setCurrentPage('milestones');
      } else if (path === '/resources') {
        setCurrentPage('resources');
      } else if (path === '/stories') {
        setCurrentPage('stories');
      } else if (path === '/profile') {
        setCurrentPage('profile');
      } else if (path === '/reset-password') {
        setCurrentPage('reset-password');
      } else {
        setCurrentPage('dashboard');
      }
    };

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const href = link.getAttribute('href')!;
        window.history.pushState({}, '', href);
        if (href === '/chat') {
          setCurrentPage('chat');
        } else if (href === '/milestones') {
          setCurrentPage('milestones');
        } else if (href === '/resources') {
          setCurrentPage('resources');
        } else if (href === '/stories') {
          setCurrentPage('stories');
        } else if (href === '/profile') {
          setCurrentPage('profile');
        } else if (href === '/reset-password') {
          setCurrentPage('reset-password');
        } else {
          setCurrentPage('dashboard');
        }
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (currentPage === 'reset-password') {
    return <ResetPassword />;
  }

  if (!user) {
    if (currentPage === 'auth') {
      if (authMode === 'signup') {
        return (
          <SignUp
            onSuccess={() => setCurrentPage('onboarding-child')}
            onSwitchToSignIn={() => setAuthMode('signin')}
          />
        );
      } else {
        return (
          <SignIn
            onSwitchToSignUp={() => setAuthMode('signup')}
          />
        );
      }
    }

    return <LandingPage onGetStarted={() => setCurrentPage('auth')} />;
  }

  if (!activeChild) {
    if (currentPage === 'onboarding-goals') {
      return <GoalsSelection onComplete={() => {
        setCurrentPage('dashboard');
        window.history.pushState({}, '', '/');
      }} />;
    }
    return <ChildProfile onComplete={() => setCurrentPage('onboarding-goals')} />;
  }

  if (currentPage === 'chat') {
    return <ChatPage />;
  }

  if (currentPage === 'milestones') {
    return <MilestonesPage />;
  }

  if (currentPage === 'resources') {
    return <ResourcesPage />;
  }

  if (currentPage === 'stories') {
    return <StoriesPage />;
  }

  if (currentPage === 'profile') {
    return <ProfileSettings />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
