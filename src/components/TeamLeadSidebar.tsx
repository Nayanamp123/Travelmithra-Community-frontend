import { NavLink } from 'react-router-dom';
import travelMithraLogo from '../assets/travel-mithra-sidebar-transparent.png';

export default function TeamLeadSidebar({ onLogout }: { onLogout: () => void }) {
  return <aside className="sidebar admin-sidebar"><header className="brand sidebar-brand-header"><img src={travelMithraLogo} alt="Travel Mithra" className="sidebar-top-logo" width={220} height={90} /></header><nav aria-label="Team Lead navigation"><NavLink to="/team-lead">Team Lead Dashboard</NavLink><NavLink to="/team-lead/agents">Agents</NavLink><NavLink to="/team-lead/bookings">Bookings &amp; Reports</NavLink><NavLink to="/team-lead/rewards">Rewards</NavLink><NavLink to="/team-lead/customers">Customers &amp; Trips</NavLink><NavLink to="/">Customer Site</NavLink></nav><button type="button" className="secondary-btn logout-btn" onClick={onLogout}>Logout</button></aside>;
}
