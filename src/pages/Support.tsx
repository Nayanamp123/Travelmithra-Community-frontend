import { Link } from 'react-router-dom';

const previousTrips = [
 

  {
    title: 'Bali Beach Retreat',
    location: 'Indonesia',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
  },
];

export default function Support() {
  return (
    <section className="page-section" id="support">
      <div className="page-header">
        <h2>Support</h2>
        <p>We're here to help you have the best experience</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>FAQ</h3>
          <p>Find answers to frequently asked questions about using Travelmithra.</p>
          <button className="primary-btn">View FAQs</button>
        </div>

        <div className="card">
          <h3>Contact Us</h3>
          <p>Get in touch with our support team for any issues or questions.</p>
          <Link className="primary-btn" to="/contact-us">
            Contact Support
          </Link>
        </div>

        <div className="card">
          <h3>User Guide</h3>
          <p>Learn how to use all the features and maximize your Travelmithra experience.</p>
          <button className="primary-btn">Read Guide</button>
        </div>

        <div className="card">
          <h3>Report Issue</h3>
          <p>Found a bug or have a suggestion? Report it and help us improve.</p>
          <button className="primary-btn">Report</button>
        </div>
      </div>

      <section className="previous-trips-section">
        <div className="section-heading">
          <h3>Previous Trip Pictures</h3>
          <p>Memorable journeys planned with Travelmithra.</p>
        </div>

        <div className="trip-gallery">
          {previousTrips.map((trip) => (
            <article className="trip-photo-card" key={trip.title}>
              <img src={trip.image} alt={`${trip.title} in ${trip.location}`} />
              <div>
                <h4>{trip.title}</h4>
                <p>{trip.location}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="contact-section">
        <h3>Direct Support</h3>
        <p>Email: support@travelmithra.com</p>
        <p>Phone: +1-800-TRAVEL-1</p>
        <p>Hours: Monday - Friday, 9AM - 6PM UTC</p>
      </div>
    </section>
  );
}
