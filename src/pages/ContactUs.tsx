import { Link } from 'react-router-dom';

const customerCareNumbers = [
  {
    label: 'Booking Support',
    number: '+91 98765 43210',
    note: 'New bookings and package details',
  },
  {
    label: 'Trip Assistance',
    number: '+91 98765 43211',
    note: 'Help during an active trip',
  },
  {
    label: 'General Customer Care',
    number: '+91 98765 43212',
    note: 'Account, payment, and service questions',
  },
];

export default function ContactUs() {
  return (
    <section className="page-section" id="contact-us">
      <div className="page-header">
        <h2>Contact Us</h2>
        <p>Reach our customer-care team for quick travel support.</p>
      </div>

      <div className="contact-care-grid">
        {customerCareNumbers.map((contact) => (
          <article className="card contact-care-card" key={contact.number}>
            <span>{contact.label}</span>
            <a href={`tel:${contact.number.replace(/\s/g, '')}`}>{contact.number}</a>
            <p>{contact.note}</p>
          </article>
        ))}
      </div>

      <div className="contact-section">
        <h3>Support Hours</h3>
        <p>Monday - Friday, 9AM - 6PM UTC</p>
        <p>Email: support@travelmithra.com</p>
        <Link className="secondary-btn" to="/support">
          Back to Support
        </Link>
      </div>
    </section>
  );
}
