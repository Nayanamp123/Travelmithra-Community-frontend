import { useEffect, useState } from 'react';
import { agentAPI } from '../api/client';

export default function AgentRewards({ username }: { username: string }) {
  const [rewards, setRewards] = useState<Array<Record<string, unknown>>>([]);
  useEffect(() => { agentAPI.getRewards(username).then((data) => setRewards(data.rewards || [])).catch(() => setRewards([])); }, [username]);
  const total = rewards.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const removeReward = async (id: number) => { if (!window.confirm('Remove this reward from your session?')) return; await agentAPI.deleteReward(username, id); setRewards((items) => items.filter((item) => Number(item.id) !== id)); };
  return <section className="dashboard"><div className="dashboard-header"><div><span className="badge">Agent workspace</span><h2>Agent Reward Session</h2><p>Active rewards issued for your customer conversions.</p></div><div className="stat-panel"><span className="stat-number">₹{total.toLocaleString('en-IN')}</span><span className="stat-label">Current session rewards</span></div></div><div className="card"><h3>Current reward session</h3><p>Your reward session shows only rewards assigned to your agent account. Archived rewards are not shown.</p></div><div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Traveler</th><th>Booking</th><th>Amount</th><th>Note</th><th>Date</th><th>Action</th></tr></thead><tbody>{rewards.map((reward) => <tr key={String(reward.id)}><td>{String(reward.traveler || '')}</td><td>{String(reward.bookingId || '—')}</td><td>₹{Number(reward.amount || 0).toLocaleString('en-IN')}</td><td>{String(reward.note || '—')}</td><td>{String(reward.createdAt || '').slice(0, 10)}</td><td><button type="button" className="table-action danger" onClick={() => removeReward(Number(reward.id))}>Delete</button></td></tr>)}</tbody></table>{!rewards.length && <p className="empty-state">No rewards have been issued for this session yet.</p>}</div></section>;
}
