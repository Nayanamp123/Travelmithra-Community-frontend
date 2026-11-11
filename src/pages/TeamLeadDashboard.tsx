import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { teamLeadAPI, type TeamLeadCredentials } from '../api/client';

type Agent = { id: number; name: string; email: string; phone?: string; role: string; salesExecutive?: string; createdAt?: string };
type Customer = { id: number; name: string; email: string; phone: string; trips: number; joined: string; active: boolean };
type Booking = { id: string; customer: string; route: string; date: string; amount: number; received: number; previous: number; adults: number; kids: number; executive: string; active: boolean; paymentMode: string; remarks: string };
type Reward = { id: number; agent: string; traveler: string; bookingId?: string; amount: number; note: string; status: string; createdAt: string };
type TeamLeadView = 'overview' | 'agents' | 'bookings' | 'rewards' | 'customers';

const money = (value: number) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
const dateOnly = (value: string) => String(value || '').slice(0, 10) || '—';

export default function TeamLeadDashboard({ credentials }: { credentials: TeamLeadCredentials }) {
  const { pathname } = useLocation();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('All agents');
  const [selectedDestination, setSelectedDestination] = useState('All destinations');
  const [error, setError] = useState('');

  const view: TeamLeadView = pathname.endsWith('/agents')
    ? 'agents'
    : pathname.endsWith('/bookings') || pathname.endsWith('/reports')
      ? 'bookings'
      : pathname.endsWith('/rewards')
        ? 'rewards'
        : pathname.endsWith('/customers')
          ? 'customers'
          : 'overview';

  useEffect(() => {
    Promise.all([
      teamLeadAPI.getAgents(credentials),
      teamLeadAPI.getCustomers(credentials),
      teamLeadAPI.getBookings(credentials),
      teamLeadAPI.getRewards(credentials),
    ]).then(([agentData, customerData, bookingData, rewardData]) => {
      setAgents(agentData.agents || []);
      setCustomers(customerData.customers || []);
      setBookings(bookingData.bookings || []);
      setRewards(rewardData.rewards || []);
      setError('');
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Failed to load Team Lead data'));
  }, [credentials]);

  const agentKeys = useMemo(() => new Set(
    agents.flatMap((agent) => [agent.name, agent.email].filter(Boolean).map((value) => value.toLowerCase().trim()))
  ), [agents]);
  const assignedBookings = bookings.filter((booking) => agentKeys.has(booking.executive.toLowerCase().trim()));
  const destinationOptions = useMemo(() => Array.from(new Set(
    assignedBookings.map((booking) => String(booking.route || '').trim()).filter(Boolean)
  )).sort((left, right) => left.localeCompare(right)), [assignedBookings]);
  const reportBookings = assignedBookings.filter((booking) => {
    const matchesAgent = selectedAgent === 'All agents' || booking.executive.toLowerCase().trim() === selectedAgent.toLowerCase().trim();
    const matchesDestination = selectedDestination === 'All destinations' || booking.route.toLowerCase().includes(selectedDestination.toLowerCase().trim());
    return matchesAgent && matchesDestination;
  });
  const teamRewards = rewards.filter((reward) => selectedAgent === 'All agents' || reward.agent.toLowerCase().trim() === selectedAgent.toLowerCase().trim());
  const totalSales = reportBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
  const totalReceived = reportBookings.reduce((sum, booking) => sum + Number(booking.received || 0), 0);

  const pageTitles: Record<TeamLeadView, string> = {
    overview: 'Team Lead Dashboard',
    agents: 'My Agents',
    bookings: 'Bookings & Reports',
    rewards: 'Agent Rewards',
    customers: 'Customers & Trips',
  };
  const pageSubtitles: Record<TeamLeadView, string> = {
    overview: 'A quick view of your team activity and customer operations.',
    agents: 'View the agents assigned to your team.',
    bookings: 'Review agent sales, booking payments and trip details.',
    rewards: 'Review reward details issued to your agents.',
    customers: 'View customer records and their trip and payment details.',
  };

  const renderStats = () => <div className="report-stats">
    <div><span>Team agents</span><strong>{agents.length}</strong></div>
    <div><span>Agent bookings</span><strong>{assignedBookings.length}</strong></div>
    <div><span>Total sales</span><strong>{money(totalSales)}</strong></div>
    <div><span>Received payments</span><strong>{money(totalReceived)}</strong></div>
  </div>;

  const renderBookingTable = (rows: Booking[]) => <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Agent</th><th>Customer</th><th>Destination</th><th>Trip date</th><th>Payment</th><th>Travelers</th><th>Status</th></tr></thead><tbody>{rows.map((booking) => <tr key={booking.id}><td>{booking.executive}</td><td><strong>{booking.customer}</strong></td><td>{booking.route}</td><td>{dateOnly(booking.date)}</td><td>{money(Number(booking.amount || 0))}<small className="table-sub">Received: {money(Number(booking.received || 0))}</small><small className="table-sub">Previous: {money(Number(booking.previous || 0))}</small></td><td>{booking.adults} adult{booking.adults === 1 ? '' : 's'}{booking.kids ? `, ${booking.kids} child${booking.kids === 1 ? '' : 'ren'}` : ''}</td><td>{booking.active ? 'Confirmed' : 'Inactive'}</td></tr>)}</tbody></table>{!rows.length && <p className="empty-state">No booking or payment details found.</p>}</div>;

  return <section className="crm-page">
    <div className="crm-topbar"><div><p className="section-kicker">Team Lead workspace</p><h2>{pageTitles[view]}</h2><p className="crm-subtitle">{pageSubtitles[view]}</p></div><div className="crm-user"><span className="crm-avatar">TL</span><span><strong>Team Lead</strong><small>Read-only operations</small></span></div></div>
    {error && <div className="error-message">{error}</div>}

    {view === 'overview' && <>
      {renderStats()}
      <div className="crm-card"><h3>Team Lead access</h3><p>You can view your agents, sales reports, reward details, customer records, trip details and payment information from the separate pages in the sidebar.</p></div>
    </>}

    {view === 'agents' && <>
      <div className="crm-toolbar"><div><h3>Assigned sales executives</h3><p>Only agents assigned to your Team Lead account are shown here.</p></div></div>
      <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Team Lead</th></tr></thead><tbody>{agents.map((agent) => <tr key={agent.id}><td><strong>{agent.name}</strong></td><td>{agent.email}</td><td>{agent.phone || '—'}</td><td>{agent.role}</td><td>{agent.salesExecutive || '—'}</td></tr>)}</tbody></table>{!agents.length && <p className="empty-state">No agents found.</p>}</div>
    </>}

    {view === 'bookings' && <>
      {renderStats()}
      <div className="crm-toolbar"><div><h3>Agent sales reports</h3><p>Filter bookings, customers and payments by agent or destination.</p></div><select aria-label="Filter by agent" value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value)}><option>All agents</option>{agents.map((agent) => <option key={agent.id} value={agent.email}>{agent.name} ({agent.email})</option>)}</select><select aria-label="Filter by destination" value={selectedDestination} onChange={(event) => setSelectedDestination(event.target.value)}><option>All destinations</option>{destinationOptions.map((destination) => <option key={destination} value={destination}>{destination}</option>)}</select></div>
      {renderBookingTable(reportBookings)}
    </>}

    {view === 'rewards' && <>
      <div className="crm-toolbar"><div><h3>Reward details</h3><p>Review rewards for the selected sales executive.</p></div><select value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value)}><option>All agents</option>{agents.map((agent) => <option key={agent.id} value={agent.email}>{agent.name} ({agent.email})</option>)}</select></div>
      <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Agent</th><th>Traveler</th><th>Booking</th><th>Reward</th><th>Note</th><th>Date</th></tr></thead><tbody>{teamRewards.map((reward) => <tr key={reward.id}><td>{reward.agent}</td><td>{reward.traveler}</td><td>{reward.bookingId || '—'}</td><td>{money(Number(reward.amount || 0))}</td><td>{reward.note || '—'}</td><td>{dateOnly(reward.createdAt)}</td></tr>)}</tbody></table>{!teamRewards.length && <p className="empty-state">No reward details found for this selection.</p>}</div>
    </>}

    {view === 'customers' && <>
      <div className="crm-toolbar"><div><h3>All customers</h3><p>Customer records are view-only for Team Leads.</p></div></div>
      <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Trips</th><th>Joined</th><th>Status</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{customer.phone}</td><td>{customer.trips}</td><td>{customer.joined}</td><td>{customer.active ? 'Active' : 'Inactive'}</td></tr>)}</tbody></table>{!customers.length && <p className="empty-state">No customers found.</p>}</div>
      <h3>Customer trip and payment details</h3>
      {renderBookingTable(bookings)}
    </>}
  </section>;
}
