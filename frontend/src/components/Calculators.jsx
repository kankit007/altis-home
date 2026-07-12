import React, { useState } from 'react';

const Calculators = ({ isOpen, onClose }) => {
  const [loanAmount, setLoanAmount] = useState(5000000); // 50 Lakhs
  const [interestRate, setInterestRate] = useState(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState(20); // 20 Years
  const [stampDutyState, setStampDutyState] = useState('Jharkhand');
  const [stampDutyPropValue, setStampDutyPropValue] = useState(5000000);
  const [stampDutyBuyerProfile, setStampDutyBuyerProfile] = useState('Male'); // Male, Female, Joint

  if (!isOpen) return null;

  // EMI calculations
  const calculateEMI = () => {
    const P = loanAmount;
    const r = (interestRate / 12) / 100;
    const n = tenureYears * 12;
    if (r === 0) return P / n;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const monthlyEMI = calculateEMI();
  const totalAmountPayable = monthlyEMI * tenureYears * 12;
  const totalInterestPayable = totalAmountPayable - loanAmount;
  const interestPercentage = Math.round((totalInterestPayable / totalAmountPayable) * 100) || 0;
  const principalPercentage = 100 - interestPercentage;

  // Stamp duty calculations
  const calculateStampDuty = () => {
    let rate = 5;
    if (stampDutyBuyerProfile === 'Female') rate = 4;
    else if (stampDutyBuyerProfile === 'Joint') rate = 4.5;
    const duty = (stampDutyPropValue * rate) / 100;
    const regFee = stampDutyPropValue * 0.01;
    return { duty, regFee };
  };

  const { duty: calculatedStampDuty, regFee: calculatedRegFee } = calculateStampDuty();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2 style={{ color: 'var(--primary)', marginBottom: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          📊 Financial Estimators Dashboard
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* EMI Calculator */}
          <div style={{ borderRight: '1px solid var(--border-glass)', paddingRight: '20px' }}>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '16px' }}>
              Interactive Loan EMI Calculator
            </h3>

            <div className="form-group">
              <label className="form-label">Principal Loan Amount (₹): {loanAmount.toLocaleString('en-IN')}</label>
              <input 
                type="range" 
                min="1000000" 
                max="100000000" 
                step="100000" 
                value={loanAmount} 
                onChange={(e) => setLoanAmount(Number(e.target.value))} 
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>10 Lakhs</span>
                <span>10 Crores</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Annual Interest Rate (%): {interestRate}%</label>
              <input 
                type="range" 
                min="5" 
                max="15" 
                step="0.1" 
                value={interestRate} 
                onChange={(e) => setInterestRate(Number(e.target.value))} 
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>5%</span>
                <span>15%</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amortization Period (Years): {tenureYears} Years</label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1" 
                value={tenureYears} 
                onChange={(e) => setTenureYears(Number(e.target.value))} 
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>1 Year</span>
                <span>30 Years</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', background: '#f8fafc', marginTop: '20px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monthly Amortization (EMI):</span>
                <strong style={{ color: 'var(--primary)', fontSize: '18px' }}>₹{monthlyEMI.toLocaleString('en-IN')}/mo</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span>Total Principal:</span>
                <span>₹{loanAmount.toLocaleString('en-IN')} ({principalPercentage}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' }}>
                <span>Total Interest:</span>
                <span>₹{totalInterestPayable.toLocaleString('en-IN')} ({interestPercentage}%)</span>
              </div>
              
              <div className="chart-container">
                <svg width="120" height="120" className="chart-circle">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="rgba(0,0,0,0.05)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#2563eb" strokeWidth="12" 
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${(2 * Math.PI * 50) * (interestPercentage / 100)}`} />
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#dc2626" strokeWidth="12" 
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${(2 * Math.PI * 50) * ((interestPercentage + principalPercentage) / 100)}`} />
                </svg>
                <div style={{ marginLeft: '16px', fontSize: '12px', textAlign: 'left' }}>
                  <div><span style={{ color: '#dc2626' }}>■</span> Principal Amount</div>
                  <div><span style={{ color: '#2563eb' }}>■</span> Total Interest Payable</div>
                </div>
              </div>
            </div>

          </div>

          {/* Stamp Duty Calculator */}
          <div>
            <h3 style={{ fontSize: '18px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '8px', marginBottom: '16px' }}>
              Regional Stamp Duty Calculator
            </h3>

            <div className="form-group">
              <label className="form-label">State / Region</label>
              <select className="form-select" value={stampDutyState} onChange={(e) => setStampDutyState(e.target.value)}>
                <option value="Jharkhand">Jharkhand (Jamshedpur)</option>
                <option value="Other">Other States</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Intended Valuation (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={stampDutyPropValue} 
                onChange={(e) => setStampDutyPropValue(Number(e.target.value))} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Buyer Gender / Profile</label>
              <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="gender" checked={stampDutyBuyerProfile === 'Male'} onChange={() => setStampDutyBuyerProfile('Male')} /> Male (5%)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="gender" checked={stampDutyBuyerProfile === 'Female'} onChange={() => setStampDutyBuyerProfile('Female')} /> Female (4%)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="radio" name="gender" checked={stampDutyBuyerProfile === 'Joint'} onChange={() => setStampDutyBuyerProfile('Joint')} /> Joint (4.5%)
                </label>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', background: '#f8fafc', marginTop: '40px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>Estimated Stamp Duty fee:</span>
                <strong>₹{calculatedStampDuty.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
                <span>Legal Registration Charge (1%):</span>
                <strong>₹{calculatedRegFee.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '10px', fontSize: '15px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Aggregate Government Fees:</span>
                <strong style={{ color: 'var(--primary)' }}>₹{(calculatedStampDuty + calculatedRegFee).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Calculators;
