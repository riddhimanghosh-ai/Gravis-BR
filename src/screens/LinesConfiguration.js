import React, { useState } from 'react';
import { LINE_CONFIGS } from '../data/realisticSampleData';
import '../styles/LinesConfiguration.css';

const ALL_SKUS = ['Vanilla', 'Caramel', 'Mint', 'Chocolate'];
const SHIFT_OPTIONS = ['8h × 1 shift', '8h × 2 shifts', '12h × 1 shift', '24/7'];

const emptyForm = {
  id: '',
  name: '',
  capacityPerDay: '',
  supportedSkus: [],
  shiftPattern: '8h × 1 shift',
  operator: '',
  installedDate: '',
  status: 'active',
};

const LinesConfiguration = () => {
  const [lines, setLines] = useState(LINE_CONFIGS);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // line id or null
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, id: `line-${Date.now()}`, installedDate: new Date().toISOString().split('T')[0] });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = line => {
    setEditing(line.id);
    setForm({
      ...line,
      capacityPerDay: String(line.capacityPerDay),
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  const toggleSku = sku => {
    setForm(f => ({
      ...f,
      supportedSkus: f.supportedSkus.includes(sku)
        ? f.supportedSkus.filter(s => s !== sku)
        : [...f.supportedSkus, sku],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    const cap = parseFloat(form.capacityPerDay);
    if (!cap || cap <= 0) e.capacityPerDay = 'Capacity must be greater than 0.';
    if (form.supportedSkus.length === 0) e.supportedSkus = 'Select at least 1 SKU.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;
    const saved = {
      ...form,
      capacityPerDay: parseFloat(form.capacityPerDay),
    };
    if (editing) {
      setLines(prev => prev.map(l => l.id === editing ? saved : l));
    } else {
      setLines(prev => [...prev, saved]);
    }
    closeModal();
  };

  const onRetire = id => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, status: l.status === 'active' ? 'retired' : 'active' } : l));
  };

  return (
    <div className="lines-cfg-container">
      <header className="screen-header">
        <div>
          <h1>⚙️ Production Lines — Configuration</h1>
          <p>Add, edit, or retire production lines. Changes are local to this demo session.</p>
        </div>
        <button className="add-btn" onClick={openAdd}>+ Add New Line</button>
      </header>

      <div className="table-section">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Line Name</th>
                <th className="number">Capacity (L/day)</th>
                <th>Supported SKUs</th>
                <th>Shift Pattern</th>
                <th>Operator</th>
                <th>Status</th>
                <th>Installed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.id} className={l.status === 'retired' ? 'row-retired' : ''}>
                  <td className="highlight">{l.name}</td>
                  <td className="number bold">{l.capacityPerDay}</td>
                  <td>
                    {l.supportedSkus.map(s => <span key={s} className="sku-chip">{s}</span>)}
                  </td>
                  <td>{l.shiftPattern}</td>
                  <td>{l.operator}</td>
                  <td>
                    <span className={`status-pill st-${l.status}`}>{l.status}</span>
                  </td>
                  <td>{l.installedDate}</td>
                  <td className="actions-cell">
                    <button className="link-btn" onClick={() => openEdit(l)}>Edit</button>
                    <button className="link-btn link-btn-warn" onClick={() => onRetire(l.id)}>
                      {l.status === 'active' ? 'Retire' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr><td colSpan={8} className="empty-row">No lines configured. Click “+ Add New Line”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer-note">
        Changes in demo mode are local to this session.
      </div>

      {/* ── MODAL ─────────────────────────────────────── */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Line' : 'Add New Line'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              <label>
                <span>Line Name *</span>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Line 4"
                />
                {errors.name && <span className="err">{errors.name}</span>}
              </label>

              <label>
                <span>Capacity per day (L) *</span>
                <input
                  type="number" min="1"
                  value={form.capacityPerDay}
                  onChange={e => setForm(f => ({ ...f, capacityPerDay: e.target.value }))}
                  placeholder="e.g. 25"
                />
                {errors.capacityPerDay && <span className="err">{errors.capacityPerDay}</span>}
              </label>

              <label>
                <span>Supported SKUs *</span>
                <div className="sku-checkboxes">
                  {ALL_SKUS.map(s => (
                    <label key={s} className="sku-check">
                      <input
                        type="checkbox"
                        checked={form.supportedSkus.includes(s)}
                        onChange={() => toggleSku(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
                {errors.supportedSkus && <span className="err">{errors.supportedSkus}</span>}
              </label>

              <label>
                <span>Shift Pattern</span>
                <select
                  value={form.shiftPattern}
                  onChange={e => setForm(f => ({ ...f, shiftPattern: e.target.value }))}
                >
                  {SHIFT_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </label>

              <label>
                <span>Operator</span>
                <input
                  value={form.operator}
                  onChange={e => setForm(f => ({ ...f, operator: e.target.value }))}
                  placeholder="e.g. A. Kumar"
                />
              </label>

              <label>
                <span>Installed Date</span>
                <input
                  type="date"
                  value={form.installedDate}
                  onChange={e => setForm(f => ({ ...f, installedDate: e.target.value }))}
                />
              </label>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={onSave}>
                {editing ? 'Save Changes' : 'Add Line'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinesConfiguration;
