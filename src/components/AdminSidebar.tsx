import { NavLink } from 'react-router-dom';
import travelMithraLogo from '../assets/travel-mithra-sidebar-transparent.png';

type AdminSidebarProps = { onLogout: () => void };

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  return (
    <aside className="sidebar admin-sidebar">
      <header className="brand sidebar-brand-header">
        <img src={travelMithraLogo} alt="Travel Mithra" className="sidebar-top-logo" width={220} height={90} />
      </header>
      <nav aria-label="Admin navigation">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/bookings">Bookings</NavLink>
        <NavLink to="/reports">Reports</NavLink>
        <NavLink to="/rewards">Rewards</NavLink>
        <NavLink to="/agents">Agents</NavLink>
        <NavLink to="/">Customer Site</NavLink>
      </nav>
      <button type="button" className="secondary-btn logout-btn" onClick={onLogout}>Logout</button>
    </aside>
  );
}
