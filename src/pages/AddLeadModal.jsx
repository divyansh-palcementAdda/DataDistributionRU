import { useState } from 'react';
import CustomInput from '../component/reusable/CustomInput';
import CustomButton from '../component/reusable/CustomButton';
import { useAppContext } from '../AppContext';

const AddLeadModal = () => {
  const { isAddLeadModalOpen, closeAddLeadModal, showToast } = useAppContext();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('Full Stack Development');
  const [source, setSource] = useState('Google Ads');
  const [city, setCity] = useState('');
  const [counselor, setCounselor] = useState('Rahul Singh');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = () => {
    // In a real app, you'd send this data to a backend
    console.log('New Lead Data:', { firstName, lastName, phone, email, course, source, city, counselor, remarks });
    showToast('Lead added successfully!');
    closeAddLeadModal();
    // Reset form fields
    setFirstName(''); setLastName(''); setPhone(''); setEmail('');
    setCourse('Full Stack Development'); setSource('Google Ads'); setCity('');
    setCounselor('Rahul Singh'); setRemarks('');
  };

  if (!isAddLeadModalOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Add New Lead</div>
          <CustomButton variant="ghost" className="btn-icon" onClick={closeAddLeadModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </CustomButton>
        </div>
        <div className="modal-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CustomInput label="First Name" placeholder="Priya" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <CustomInput label="Last Name" placeholder="Kumar" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <CustomInput label="Phone" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <CustomInput label="Email" placeholder="priya@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div>
              <label className="form-label">Course Interested</label>
              <select className="form-control" value={course} onChange={(e) => setCourse(e.target.value)}>
                <option>Full Stack Development</option><option>Data Science & ML</option><option>UI/UX Design</option><option>DevOps & Cloud</option><option>Cybersecurity</option>
              </select>
            </div>
            <div>
              <label className="form-label">Lead Source</label>
              <select className="form-control" value={source} onChange={(e) => setSource(e.target.value)}>
                <option>Google Ads</option><option>Facebook</option><option>Instagram</option><option>Referral</option><option>Website</option><option>Walk-in</option>
              </select>
            </div>
            <CustomInput label="City" placeholder="Bangalore" value={city} onChange={(e) => setCity(e.target.value)} />
            <div>
              <label className="form-label">Assign to Counselor</label>
              <select className="form-control" value={counselor} onChange={(e) => setCounselor(e.target.value)}>
                <option>Rahul Singh</option><option>Neha Joshi</option><option>Priya Patel</option><option>Vikram Das</option>
              </select>
            </div>
          </div>
          <div className="form-group mt-3">
            <label className="form-label">Remarks</label>
            <textarea className="form-control" rows="2" placeholder="Initial remarks…" value={remarks} onChange={(e) => setRemarks(e.target.value)}></textarea>
          </div>
        </div>
        <div className="modal-footer">
          <CustomButton variant="secondary" onClick={closeAddLeadModal}>Cancel</CustomButton>
          <CustomButton variant="primary" onClick={handleSubmit}>Add Lead</CustomButton>
        </div>
      </div>
    </div>
  );
};

export default AddLeadModal;