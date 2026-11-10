import { NavLink } from 'react-router-dom';
import travelMithraLogo from '../assets/travel-mithra-sidebar-transparent.png';

export default function AgentSidebar({ onLogout }: { onLogout: () => void }) {
  return <aside className="sidebar admin-sidebar"><header className="brand sidebar-brand-header"><img src={travelMithraLogo} alt="Travel Mithra" className="sidebar-top-logo" width={220} height={90} /></header><nav aria-label="Agent navigation"><NavLink to="/dashboard">Dashboard</NavLink><NavLink to="/agent-sales">My customers' sales</NavLink><NavLink to="/agent-rewards">Agent Reward Session</NavLink><NavLink to="/profile">Profile</NavLink><NavLink to="/">Customer Site</NavLink></nav><button type="button" className="secondary-btn logout-btn" onClick={onLogout}>Logout</button></aside>;
}
