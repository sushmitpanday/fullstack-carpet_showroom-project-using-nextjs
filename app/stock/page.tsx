"use client";

import React, { useState, useRef, useEffect } from 'react';

// Prisma model ke hisaab se type ko update kiya
type Order = {
  id: number;
  jobName: string;
  description: string;
  quantity: string;
  status: string;
  createdAt: string;
  imageUrl?: string;
  notes?: string;
};

type TabName = 'Manufacturers' | 'Ranges' | 'Action Required' | 'Order Requests' | 'Current Orders' | 'Order Archive' | 'Allocations' | 'Stock' | 'History' | 'Stocktake';

export default function InventorySystem() {
  const [activeTab, setActiveTab] = useState<TabName>('Stock');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({ job: '', desc: '', qty: '', details: '' });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- DATABASE SE DATA LOAD KARNA ---
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (!data.error) setOrders(data);
    } catch (err) { console.error("Fetch Error"); }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Image handling (Base64 for simplicity, for large apps use S3)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- DATABASE MEIN DATA BHEJNA ---
  const handleCommit = async () => {
    if (!formData.job || !formData.desc) {
      alert("Job Name and Description are required!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobName: formData.job,
          description: formData.desc,
          quantity: formData.qty || "0",
          notes: formData.details,
          imageUrl: selectedImage // Base64 string sent to DB
        }),
      });

      if (response.ok) {
        setFormData({ job: '', desc: '', qty: '', details: '' });
        setSelectedImage(null);
        await fetchOrders(); // Refresh list
        alert("Saved to Database!");
        setActiveTab('Current Orders');
      } else {
        alert("Server Error: Could not save.");
      }
    } catch (err) {
      alert("Network Error: Check Connection");
    } finally {
      setLoading(false);
    }
  };

  const tabs: TabName[] = ['Manufacturers', 'Ranges', 'Action Required', 'Order Requests', 'Current Orders', 'Order Archive', 'Allocations', 'Stock', 'History', 'Stocktake'];

  const renderTabContent = () => {
    if (activeTab === 'Stock') {
      return (
        <div className="animate-in fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px' }}>
          <div>
            <h1 style={{ color: '#f39c12', fontSize: '18px', marginBottom: '15px' }}>STOCK DATA ENTRY {loading && " - SAVING..."}</h1>
            <div style={{ display: 'grid', gap: '10px', backgroundColor: '#111', padding: '20px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Job Name/No</label>
                  <input style={inputStyle} value={formData.job} onChange={e => setFormData({...formData, job: e.target.value})} placeholder="e.g. 42958 Liz" />
                </div>
                <div style={{ width: '100px' }}>
                  <label style={labelStyle}>Quantity</label>
                  <input style={inputStyle} value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} placeholder="0.0" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Product Description</label>
                <input style={inputStyle} value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} placeholder="Product Details..." />
              </div>
              <div>
                <label style={labelStyle}>Additional Notes</label>
                <textarea style={{...inputStyle, height: '60px'}} value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} />
              </div>
              <div>
                <label style={labelStyle}>Upload Image</label>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} accept="image/*" />
                <div onClick={() => fileInputRef.current?.click()} style={imageUploadBox}>
                  {selectedImage ? <img src={selectedImage} style={{ height: '100%', objectFit: 'contain' }} alt="preview" /> : "Click to upload image"}
                </div>
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: '#0a0a0a', padding: '10px', borderLeft: '1px solid #333' }}>
             <label style={labelStyle}>Instructions</label>
             <p style={{ fontSize: '11px', color: '#666' }}>Fill details and click 'Commit Data' in the blue button below.</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'Current Orders') {
      return (
        <div className="animate-in fade-in">
          <h2 style={{ color: '#fff', marginBottom: '10px' }}>Database Records (Double click to view)</h2>
          <table style={tableStyle}>
            <thead style={{ backgroundColor: '#222' }}>
              <tr>
                <th style={thStyle}>Job Name</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} onDoubleClick={() => setViewingOrder(o)} style={{ cursor: 'pointer', borderBottom: '1px solid #222' }} className="hover-row">
                  <td style={tdStyle}>{o.jobName}</td>
                  <td style={tdStyle}>{o.description}</td>
                  <td style={tdStyle}>{o.quantity}</td>
                  <td style={tdStyle}><span style={{ color: '#2ecc71' }}>{o.status}</span></td>
                  <td style={tdStyle}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed #444' }}>Empty Section</div>;
  };

  return (
    <div style={{ backgroundColor: '#000', color: '#ccc', minHeight: '100vh', fontFamily: 'Arial' }}>
      <header style={{ display: 'flex', backgroundColor: '#2c3e50', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as TabName)} style={{ padding: '12px 20px', backgroundColor: activeTab === tab ? '#000' : 'transparent', color: '#fff', border: 'none', borderRight: '1px solid #3d4f5f', cursor: 'pointer', fontSize: '11px' }}>{tab}</button>
        ))}
      </header>

      <main style={{ padding: '20px', paddingBottom: '80px' }}>{renderTabContent()}</main>

      {/* VIEW MODAL */}
      {viewingOrder && (
        <div style={modalOverlay} onClick={() => setViewingOrder(null)}>
          <div style={modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#f39c12', marginBottom: '15px' }}>Database Detail View</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p><strong>Job:</strong> {viewingOrder.jobName}</p>
                <p><strong>Desc:</strong> {viewingOrder.description}</p>
                <p><strong>Notes:</strong> {viewingOrder.notes || "N/A"}</p>
              </div>
              <div style={{ background: '#000', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
                {viewingOrder.imageUrl ? <img src={viewingOrder.imageUrl} style={{ maxWidth: '100%', maxHeight: '100%' }} alt="stock" /> : "No Photo"}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ position: 'fixed', bottom: 0, width: '100%', backgroundColor: '#1a1a1a', padding: '12px 20px', display: 'flex', gap: '10px', borderTop: '1px solid #333' }}>
        <button style={fBtn}>Menu</button>
        <button onClick={handleCommit} disabled={loading} style={{ ...fBtn, backgroundColor: '#005a9e', color: '#fff' }}>
          {loading ? "Syncing..." : "Commit Data"}
        </button>
      </footer>
    </div>
  );
}

// Styles (unchanged from your previous good styles)
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '10px', color: '#888', marginBottom: '5px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px', backgroundColor: '#000', border: '1px solid #444', color: '#fff' };
const imageUploadBox: React.CSSProperties = { height: '100px', width: '100%', border: '1px dashed #555', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = { padding: '10px', border: '1px solid #333', textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: '10px', border: '1px solid #222' };
const fBtn: React.CSSProperties = { padding: '6px 20px', backgroundColor: '#333', border: '1px solid #444', color: '#fff', cursor: 'pointer' };
const modalOverlay: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalContent: React.CSSProperties = { background: '#111', padding: '20px', width: '500px', border: '1px solid #444' };