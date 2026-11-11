import { useEffect, useMemo, useState } from 'react';
import { teamLeadAPI, type TeamLeadCredentials } from '../api/client';

type Agent = { id: number; name: string; email: string; phone?: string; role: string; salesExecutive?: string; createdAt?: string };
type Customer = { id: number; name: string; email: string; phone: string; trips: number; joined: string; active: boolean };
type Booking = { id: string; customer: string; route: string; date: string; amount: number; received: number; previous: number; adults: number; kids: number; executive: string; active: boolean; paymentMode: string; remarks: string };
type Reward = { id: number; agent: string; traveler: string; bookingId?: string; amount: number; note: string; status: string; createdAt: string };

export default function TeamLeadDashboard({ credentials }: { credentials: TeamLeadCredentials }) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('All agents');
  const [error, setError] = useState('');

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
  const reportBookings = bookings.filter((booking) => agentKeys.has(booking.executive.toLowerCase().trim()) && (selectedAgent === 'All agents' || booking.executive.toLowerCase().trim() === selectedAgent.toLowerCase().trim()));
  const teamRewards = rewards.filter((reward) => selectedAgent === 'All agents' || reward.agent.toLowerCase().trim() === selectedAgent.toLowerCase().trim());
  const totalSales = reportBookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);
  const totalReceived = reportBookings.reduce((sum, booking) => sum + Number(booking.received || 0), 0);
  const assignedBookings = bookings.filter((booking) => agentKeys.has(booking.executive.toLowerCase().trim()));

  return <section className="crm-page">
    <div className="crm-topbar"><div><p className="section-kicker">Team Lead workspace</p><h2>Team Lead Dashboard</h2><p className="crm-subtitle">View your agents, their reports and rewards, plus all customer trip and payment details.</p></div><div className="crm-user"><span className="crm-avatar">TL</span><span><strong>Team Lead</strong><small>Read-only operations</small></span></div></div>
    {error && <div className="error-message">{error}</div>}
    <div id="team-lead-agents" className="report-stats">
      <div><span>Team agents</span><strong>{agents.length}</strong></div>
      <div><span>Agent bookings</span><strong>{assignedBookings.length}</strong></div>
      <div><span>Total sales</span><strong>₹{totalSales.toLocaleString('en-IN')}</strong></div>
      <div><span>Received payments</span><strong>₹{totalReceived.toLocaleString('en-IN')}</strong></div>
    </div>

    <div id="team-lead-reports" className="crm-toolbar"><div><h3>Agent sales reports</h3><p>Filter bookings and rewards for the selected agent.</p></div><select value={selectedAgent} onChange={(event) => setSelectedAgent(event.target.value)}><option>All agents</option>{agents.map((agent) => <option key={agent.id} value={agent.email}>{agent.name} ({agent.email})</option>)}</select></div>
    <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Agent</th><th>Customer</th><th>Destination</th><th>Trip date</th><th>Payment</th><th>Travelers</th><th>Status</th></tr></thead><tbody>{reportBookings.map((booking) => <tr key={booking.id}><td>{booking.executive}</td><td><strong>{booking.customer}</strong></td><td>{booking.route}</td><td>{String(booking.date).slice(0, 10)}</td><td>₹{Number(booking.amount || 0).toLocaleString('en-IN')}<small className="table-sub">Received: ₹{Number(booking.received || 0).toLocaleString('en-IN')}</small></td><td>{booking.adults} adult{booking.adults === 1 ? '' : 's'}{booking.kids ? `, ${booking.kids} child${booking.kids === 1 ? '' : 'ren'}` : ''}</td><td>{booking.active ? 'Confirmed' : 'Inactive'}</td></tr>)}</tbody></table>{!reportBookings.length && <p className="empty-state">No agent bookings found.</p>}</div>

    <h3 id="team-lead-rewards">Agent reward details</h3><div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Agent</th><th>Traveler</th><th>Booking</th><th>Reward</th><th>Note</th><th>Date</th></tr></thead><tbody>{teamRewards.map((reward) => <tr key={reward.id}><td>{reward.agent}</td><td>{reward.traveler}</td><td>{reward.bookingId || '—'}</td><td>₹{Number(reward.amount || 0).toLocaleString('en-IN')}</td><td>{reward.note || '—'}</td><td>{String(reward.createdAt).slice(0, 10)}</td></tr>)}</tbody></table>{!teamRewards.length && <p className="empty-state">No reward details found for this selection.</p>}</div>

    <h3 id="team-lead-customers">All customer trip and payment details</h3><div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Trips</th><th>Joined</th><th>Status</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer.id}><td><strong>{customer.name}</strong></td><td>{customer.email}</td><td>{customer.phone}</td><td>{customer.trips}</td><td>{customer.joined}</td><td>{customer.active ? 'Active' : 'Inactive'}</td></tr>)}</tbody></table>{!customers.length && <p className="empty-state">No customers found.</p>}</div>
    <div id="team-lead-bookings" className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Customer</th><th>Agent</th><th>Destination</th><th>Trip date</th><th>Total payment</th><th>Received</th><th>Previous</th><th>Status</th></tr></thead><tbody>{bookings.map((booking) => <tr key={`all-${booking.id}`}><td>{booking.customer}</td><td>{booking.executive}</td><td>{booking.route}</td><td>{String(booking.date).slice(0, 10)}</td><td>₹{Number(booking.amount || 0).toLocaleString('en-IN')}</td><td>₹{Number(booking.received || 0).toLocaleString('en-IN')}</td><td>₹{Number(booking.previous || 0).toLocaleString('en-IN')}</td><td>{booking.active ? 'Confirmed' : 'Inactive'}</td></tr>)}</tbody></table>{!bookings.length && <p className="empty-state">No trip or payment details found.</p>}</div>
  </section>;
}
