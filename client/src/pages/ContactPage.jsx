import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', department: 'General Inquiry', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', department: 'General Inquiry', message: '' });
    }, 4000);
  };

  return (
    <div style={{ padding: '3.5rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Get in Touch
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.375rem', letterSpacing: '-0.025em' }}>
            Contact & Emergency Services
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Reach our administrative front desk, patient liaison, or submit an inquiry to our medical clinical coordination department.
          </p>
        </div>

        {/* Fictional Demonstration Alert Banner */}
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '2.5rem'
        }}>
          <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5 }}>
            <strong>Demonstration Notice:</strong> All contact details, addresses, and telephone numbers displayed are fictional demonstration placeholders for this academic project. For real-life medical emergencies, please dial your local emergency services (e.g. 911 / 112 / 108).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Contact Details Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
              Hospital Contact Directory
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.5rem', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={20} color="#0d9488" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Medical Campus Address</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    ApexCare Healthcare Center, Sector 4, Metro Medical Enclave, Visakhapatnam.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.5rem', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={20} color="#0284c7" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Telephone Inquiries</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Appointments: +1-555-0100 (Ext 1)<br />
                    Emergency Trauma Desk: +1-555-0199 (24/7)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.5rem', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} color="#d97706" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Electronic Correspondence</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    contact@hospital.demo<br />
                    admissions@hospital.demo
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} color="#475569" />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Clinical Operating Hours</h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Outpatient Consultations: Mon - Sat: 08:30 - 17:00<br />
                    Emergency Unit: Open 24 Hours, 365 Days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Enquiry Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Send an Online Inquiry
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Leave a message for our patient support and appointment coordination team.
            </p>

            {submitted ? (
              <div style={{
                backgroundColor: '#d1fae5',
                color: '#065f46',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <CheckCircle size={36} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Inquiry Received!</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Thank you for testing the contact form. Our administrative support simulator has recorded your request.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="eleanor@example.com"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                      Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1-555-0144"
                      style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="General Inquiry">General Inquiries</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Billing">Billing & Insurance</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please specify your query or consultation requirement..."
                    style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                  <Send size={16} />
                  <span>Transmit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
