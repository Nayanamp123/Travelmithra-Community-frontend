import { Link } from 'react-router-dom';

const destinationData = [
  { label: 'Europe', value: 40 },
  { label: 'Asia', value: 30 },
  { label: 'Americas', value: 20 },
  { label: 'Africa', value: 10 },
];

const monthlySales = [
  { month: 'Jan', destinations: [{ name: 'Vietnam', value: 82000 }, { name: 'Malaysia', value: 61000 }, { name: 'Thailand', value: 42000 }] },
  { month: 'Feb', destinations: [{ name: 'Vietnam', value: 96000 }, { name: 'Malaysia', value: 73000 }, { name: 'Thailand', value: 51000 }] },
  { month: 'Mar', destinations: [{ name: 'Vietnam', value: 112000 }, { name: 'Malaysia', value: 84000 }, { name: 'Thailand', value: 68000 }] },
  { month: 'Apr', destinations: [{ name: 'Vietnam', value: 105000 }, { name: 'Malaysia', value: 92000 }, { name: 'Thailand', value: 76000 }] },
  { month: 'May', destinations: [{ name: 'Vietnam', value: 128000 }, { name: 'Malaysia', value: 99000 }, { name: 'Thailand', value: 82000 }] },
  { month: 'Jun', destinations: [{ name: 'Vietnam', value: 145000 }, { name: 'Malaysia', value: 118000 }, { name: 'Thailand', value: 91000 }] },
];

const salesTotal = monthlySales.reduce((total, month) => total + month.destinations.reduce((sum, destination) => sum + destination.value, 0), 0);
const salesPeak = Math.max(...monthlySales.flatMap((month) => month.destinations.map((destination) => destination.value)));
const currency = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const destinationTotals = monthlySales[0].destinations.map((destination) => ({ ...destination, value: monthlySales.reduce((sum, month) => sum + (month.destinations.find((item) => item.name === destination.name)?.value || 0), 0) }));
const destinationGrandTotal = destinationTotals.reduce((sum, destination) => sum + destination.value, 0);

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
       <span className="stat-label text-orange-500">Community members</span>
                 </div>
          <div className="stat-panel">
            <span className="stat-number">72%</span>
            <span className="stat-label">International travel plans</span>
          </div>
        </div>
      </div>

      <div className="sales-diagram-intro"><span className="sales-diagram-kicker">Travel performance</span><h3>Monthly destination sales diagram</h3><p>This visual story shows how each destination contributes to our monthly holiday sales and helps us spot the strongest travel demand.</p></div>

      <div className="dashboard-grid">
        <div className="card sales-chart-card">
          <div className="sales-chart-heading"><div><h4>Monthly sales result</h4><p>Total sales recorded each month</p></div><strong>{currency(salesTotal)}</strong></div>
          <div className="sales-legend">{destinationTotals.map((destination, index) => <span key={destination.name}><i className={`sales-dot sales-dot-${index + 1}`} />{destination.name}</span>)}</div>
          <div className="sales-visuals"><div className="sales-donut-wrap" role="img" aria-label="Circle diagram showing total sales by Vietnam, Malaysia and Thailand"><div className="sales-circle" style={{ background: `conic-gradient(#f4813f 0 ${(destinationTotals[0].value / destinationGrandTotal) * 100}%, #1777b9 ${(destinationTotals[0].value / destinationGrandTotal) * 100}% ${((destinationTotals[0].value + destinationTotals[1].value) / destinationGrandTotal) * 100}%, #35a878 ${((destinationTotals[0].value + destinationTotals[1].value) / destinationGrandTotal) * 100}% 100%)` }}><span>Top<br />destinations</span></div></div><div className="sales-chart" role="img" aria-label="Monthly sales bar graph">{monthlySales.map((month) => { const monthTotal = month.destinations.reduce((sum, item) => sum + item.value, 0); return <div className="sales-month" key={month.month}><div className="sales-bars"><div className="sales-bar sales-bar-1" style={{ height: `${(monthTotal / (salesPeak * 3)) * 100}%` }} title={`${month.month}: ${currency(monthTotal)}`} /></div><small>{month.month}</small></div>; })}</div></div>
        </div>
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



