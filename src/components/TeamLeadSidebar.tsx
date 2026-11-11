import { NavLink } from 'react-router-dom';
import travelMithraLogo from '../assets/travel-mithra-sidebar-transparent.png';

export default function TeamLeadSidebar({ onLogout }: { onLogout: () => void }) {
  return <aside className="sidebar admin-sidebar"><header className="brand sidebar-brand-header"><img src={travelMithraLogo} alt="Travel Mithra" className="sidebar-top-logo" width={220} height={90} /></header><nav aria-label="Team Lead navigation"><NavLink to="/team-lead">Team Lead Dashboard</NavLink><a href="/team-lead#team-lead-agents">Agents</a><a href="/team-lead#team-lead-customers">Customers</a><a href="/team-lead#team-lead-bookings">Bookings &amp; payments</a><a href="/team-lead#team-lead-rewards">Rewards</a><a href="/team-lead#team-lead-reports">Reports</a><NavLink to="/">Customer Site</NavLink></nav><button type="button" className="secondary-btn logout-btn" onClick={onLogout}>Logout</button></aside>;
}
