import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import Features from './pages/Features';
import Support from './pages/Support';
import ContactUs from './pages/ContactUs';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminManagement from './pages/AdminManagement';
import travelMithraLogo from './assets/travel-mithra-sidebar-transparent.png';
import type { AdminCredentials } from './api/client';
import AdminSidebar from './components/AdminSidebar';

type CurrentUser = {
  id?: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  referralCode?: string;
  referredBy?: number;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileName, setProfileName] = useState('Traveler');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);

  const handleAuthSuccess = (user: CurrentUser) => {
    setProfileName(user.name);
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogin = (user: CurrentUser) => {
    handleAuthSuccess(user);
  };

  const handleRegister = (user: CurrentUser) => {
    handleAuthSuccess(user);
  };

  const handleAdminLogin = (credentials: AdminCredentials) => {
    const adminUser: CurrentUser = {
      name: 'Admin',
      email: 'admin@travelmithra.local',
      role: 'superadmin',
    };

    setAdminCredentials(credentials);
    setIsAuthenticated(true);
    setProfileName(adminUser.name);
    setCurrentUser(adminUser);
  };

  const handleUpdateProfile = (name: string, email: string, avatar?: string) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, name, email, avatar };
      setProfileName(name);
      setCurrentUser(updatedUser);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setProfileName('Traveler');
    setCurrentUser(null);
    setAdminCredentials(null);
  };

  return (
    <BrowserRouter>
      <AppLayout
        isAuthenticated={isAuthenticated}
        profileName={profileName}
        currentUser={currentUser}
        adminCredentials={adminCredentials}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onAdminLogin={handleAdminLogin}
        onRegister={handleRegister}
        onUpdateProfile={handleUpdateProfile}
      />
    </BrowserRouter>
  );
}

type AppLayoutProps = {
  isAuthenticated: boolean;
  profileName: string;
  currentUser: CurrentUser | null;
  adminCredentials: AdminCredentials | null;
  onLogout: () => void;
  onLogin: (user: CurrentUser) => void;
  onAdminLogin: (credentials: AdminCredentials) => void;
  onRegister: (user: CurrentUser) => void;
  onUpdateProfile: (name: string, email: string, avatar?: string) => void;
};

function AppLayout({
  isAuthenticated,
  profileName,
  currentUser,
  adminCredentials,
  onLogout,
  onLogin,
  onAdminLogin,
  onRegister,
  onUpdateProfile,
}: AppLayoutProps) {
  const isAdminAuthenticated = Boolean(adminCredentials);
  const canAccessUserPages = isAuthenticated || isAdminAuthenticated;

  const routes = (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login onLogin={onLogin} onAdminLogin={onAdminLogin} />} />
      <Route path="/register" element={<Register onRegister={onRegister} />} />
      <Route
        path="/admin-management"
        element={
          adminCredentials ? (
            <AdminManagement credentials={adminCredentials} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/bookings" element={adminCredentials ? <AdminManagement credentials={adminCredentials} /> : <Navigate to="/login" replace />} />
      <Route path="/customers" element={adminCredentials ? <AdminManagement credentials={adminCredentials} /> : <Navigate to="/login" replace />} />
      <Route path="/reports" element={adminCredentials ? <AdminManagement credentials={adminCredentials} /> : <Navigate to="/login" replace />} />
      <Route path="/rewards" element={adminCredentials ? <AdminManagement credentials={adminCredentials} /> : <Navigate to="/login" replace />} />
      <Route path="/agents" element={adminCredentials ? <AdminManagement credentials={adminCredentials} /> : <Navigate to="/login" replace />} />
      <Route
        path="/dashboard"
        element={
          canAccessUserPages ? (
            <Dashboard profileName={profileName} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/community"
        element={
          canAccessUserPages ? (
            <Community currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/features"
        element={
          canAccessUserPages ? (
            <Features />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/support"
        element={
          canAccessUserPages ? (
            <Support />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/contact-us"
        element={
          canAccessUserPages ? (
            <ContactUs />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          canAccessUserPages && currentUser ? (
            <Profile currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/edit-profile"
        element={
          canAccessUserPages && currentUser ? (
            <EditProfile currentUser={currentUser} onUpdateProfile={onUpdateProfile} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  return (
    <div className={`page-layout${canAccessUserPages ? ' authenticated' : ''}`}>
      {isAdminAuthenticated ? <AdminSidebar onLogout={onLogout} /> : canAccessUserPages && (
        <aside className="sidebar">
          <header className="brand sidebar-brand-header">
            <img
              src={travelMithraLogo}
              alt="Travel Mithra"
              className="sidebar-top-logo"
              width={220}
              height={90}
            />
          </header>

          <nav>
            {isAdminAuthenticated ? <>
              <NavLink to="/dashboard">📊 Dashboard</NavLink>
              <NavLink to="/customers">👥 Customers</NavLink>
              <NavLink to="/bookings">Bookings</NavLink>
              <NavLink to="/reports">Reports</NavLink>
              <NavLink to="/rewards">Rewards</NavLink>
              <NavLink to="/">🌐 Customer Site</NavLink>
            </> : <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/community">Community</NavLink>
              <NavLink to="/features">Features</NavLink>
              <NavLink to="/support">Support</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>}
          </nav>

          <button type="button" className="secondary-btn logout-btn" onClick={onLogout}>
            Logout
          </button>
        </aside>
      )}

      {!canAccessUserPages ? (
        <div className="guest-layout">
          <main className="main-content">{routes}</main>
        </div>
      ) : (
        <main className="main-content">{routes}</main>
      )}
    </div>
  );
}

export default App;
