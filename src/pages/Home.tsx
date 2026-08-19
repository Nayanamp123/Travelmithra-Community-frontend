import { Link } from 'react-router-dom';
import travelMithraLogo from '../assets/travel-mithra-sidebar-transparent.png';

const destinations = [
  { name: 'Santorini, Greece', type: 'Island escapes', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=900&q=85' },
  { name: 'Bali, Indonesia', type: 'Tropical adventures', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85' },
  { name: 'Swiss Alps', type: 'Mountain journeys', image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=85' },
];

export default function Home() {
  return (
    <>
      <style>{`
        .home-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 24px;
          padding: 16px 40px;
          background: #F6F3ED;
        }

        .home-logo {
          height: 100px;
          flex-shrink: 0;
        }

        .home-nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          flex: 1;
          justify-content: center;
        }

        .home-nav-links a {
          color: #121d38;
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          
        }


        .home-nav-links a:hover {
          color: #121d38;
        }

        .nav-login-separate {
          flex-shrink: 0;
          font-color: #121d38;
          color: #070e1e;
          background: #F4813F;
          padding: 8px 20px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }
        .section-kicker{
          font-size: 14px;
          font-weight: 500;
          color: #F4813F;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        } 
        .text-link{
          color: #F4813F;
          text-decoration: none;
          font-weight: 600;
          }   

        .nav-login-separate:hover {
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .home-nav {
            padding: 12px 16px;
            gap: 12px;
          }
          .home-nav-links {
            gap: 16px;
          }
        }
      `}</style>

      <header className="home-nav">
        <img src={travelMithraLogo} alt="Travelmithra" className="home-logo" />
        <nav className="home-nav-links">
          <a href="#destinations">Destinations</a>
          </nav>
       <nav className="home-nav-links">
          <a href="#why-travelmithra">Why us</a>
        </nav>
        <Link to="/login" className="nav-login-separate">Log in</Link>
      </header>

      <section className="hero home-hero" id="landing">
        <div className="hero-overlay" />
        <div className="hero-copy">
          <span className="eyebrow">Your next story starts here</span>
          <h2>Travelmithra<br /><em>Travelers Club</em></h2>
          <p>Discover beautiful places, meet curious travelers, and turn every journey into a memory worth sharing.</p>
          <div className="hero-actions">
            <Link to="/login" className="primary-btn">
              Start exploring
            </Link>
            <Link to="/register" className="secondary-btn">
              Join the community
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section" id="destinations">
        <div className="home-section-heading">
          <div>
            <p className="section-kicker">Find your feeling</p>
            <h3>Places that stay with you</h3>
          </div>
          <span>Curated inspiration for your next escape →</span>
        </div>
        <div className="destination-grid">
          {destinations.map((destination) => (
            <article
              className="destination-card"
              key={destination.name}
              style={{ backgroundImage: `url(${destination.image})` }}
            >
              <div>
                <small>{destination.type}</small>
                <h4>{destination.name}</h4>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-benefit" id="why-travelmithra">
        <div>
          <p className="section-kicker">Travel with meaning</p>
          <h3>A community for the<br />wildly curious.</h3>
        </div>
        <p>Travelmithra brings destination inspiration and real traveler wisdom together, so you can plan with confidence and travel with an open heart.</p>
        <Link to="/register" className="text-link">Become a member <span>↗</span></Link>
      </section>
    </>
  );
}