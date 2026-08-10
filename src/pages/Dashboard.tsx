import { Link } from 'react-router-dom';

const destinationData = [
  { label: 'Europe', value: 40 },
  { label: 'Asia', value: 30 },
  { label: 'Americas', value: 20 },
  { label: 'Africa', value: 10 },
];

type DashboardProps = {
  profileName: string;
};

export default function Dashboard({ profileName }: DashboardProps) {
  return (
    <section className="dashboard" id="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="badge">
            Welcome back, <strong>{profileName}</strong>
          </span>
          <h2>Community Dashboard</h2>
        </div>
        <div className="stats-panels">
          <div className="stat-panel">
            <span className="stat-number">1,250</span>
            <span className="stat-label">Community members</span>
          </div>
          <div className="stat-panel">
            <span className="stat-number">72%</span>
            <span className="stat-label">International travel plans</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card ratio-card">
          <h3>Destination ratio</h3>
          {destinationData.map((item) => (
            <div key={item.label} className="ratio-row">
              <span>{item.label}</span>
              <div className="ratio-bar">
                <div style={{ width: `${item.value}%` }} />
              </div>
              <strong>{item.value}%</strong>
            </div>
          ))}
        </div>

        <div className="card quick-info">
          <h3>Quick insights</h3>
          <p>Our travel community is growing quickly with members sharing tips, journeys, and exclusive holiday plans.</p>
          <ul>
            <li>250+ new members this month</li>
            <li>Community rating: 4.9/5</li>
            <li>Featured international destinations</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
