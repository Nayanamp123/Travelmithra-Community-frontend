import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero" id="landing">
        <div className="hero-overlay" />
        <div className="hero-copy">
          <span className="eyebrow">Explore international destinations</span>
          <h2>Welcome to Travelmithra Holidays</h2>
          <p>Login or register to join our travel community and discover curated journeys across the world.</p>
          <div className="hero-actions">
            <Link to="/login" className="primary-btn">
              Login
            </Link>
            <Link to="/register" className="secondary-btn">
              Register
            </Link>
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="card quick-info">
          <h3>Join a global travel community</h3>
          <p>Travelmithra helps you discover new destinations, connect with fellow travelers, and build unforgettable holiday plans.</p>
          <ul>
            <li>International destinations gallery</li>
            <li>Community-driven tips</li>
            <li>Secure login and registration</li>
          </ul>
        </div>
      </section>
    </>
  );
}
