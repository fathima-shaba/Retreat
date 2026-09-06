import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Download, FileText, PieChart, TrendingUp, DollarSign, RefreshCw, Users, CreditCard, Receipt, BedDouble } from 'lucide-react';
import { API_BASE_URL, authFetch } from '../apiConfig';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const [occupancyData, setOccupancyData] = useState({
    total_rooms: 0,
    total_beds: 0,
    occupied_beds: 0,
    available_beds: 0,
    occupancy_rate: 0
  });

  const [financialData, setFinancialData] = useState({
    total_revenue: 0,
    total_pending: 0,
    total_expenses: 0,
    net_income: 0
  });

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [occRes, finRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/reports/occupancy`),
        authFetch(`${API_BASE_URL}/reports/financials`)
      ]);

      if (occRes && occRes.ok) setOccupancyData(await occRes.json());
      if (finRes && finRes.ok) setFinancialData(await finRes.json());
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    const handleFocus = () => fetchReports();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Helper function to safely escape CSV cells
  const escapeCSVCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (/^[=+\-@]/.test(str)) str = "'" + str;
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  };

  // Client-side CSV Download Handler
  const handleDownloadCSV = async (type) => {
    setDownloading(`${type}_csv`);
    try {
      let csvContent = "";
      const filename = `report_${type}_${new Date().toISOString().split('T')[0]}.csv`;

      if (type === 'members') {
        const res = await authFetch(`${API_BASE_URL}/members`);
        const data = res && res.ok ? await res.json() : [];
        const membersList = Array.isArray(data) ? data : [];

        csvContent = "ID,Name,Email,Phone,Aadhar/Govt ID,Guardian Name,Guardian Phone,Sharing Type,Monthly Rent (INR),Joined Date,Resident Type\n";
        membersList.forEach(m => {
          csvContent += `${escapeCSVCell(m.id)},${escapeCSVCell(m.name)},${escapeCSVCell(m.email)},${escapeCSVCell(m.phone || 'N/A')},${escapeCSVCell(m.aadhar_number || 'N/A')},${escapeCSVCell(m.guardian_name || 'N/A')},${escapeCSVCell(m.guardian_phone || 'N/A')},${escapeCSVCell(m.sharing_type ? `${m.sharing_type} Share` : 'N/A')},${escapeCSVCell(m.rent_fee || 0)},${escapeCSVCell(m.joined_date ? m.joined_date.split('T')[0] : 'N/A')},${escapeCSVCell(m.member_type || 'Student')}\n`;
        });
      } else if (type === 'payments') {
        const res = await authFetch(`${API_BASE_URL}/payments`);
        const data = res && res.ok ? await res.json() : [];
        const paymentsList = Array.isArray(data) ? data : [];

        csvContent = "Receipt No,Resident Name,Amount (INR),Status,Payment Mode,Payment Date,Remarks\n";
        paymentsList.forEach(p => {
          const name = p.members ? p.members.name : (p.resident_name || 'N/A');
          csvContent += `${escapeCSVCell(p.receipt_no || 'N/A')},${escapeCSVCell(name)},${escapeCSVCell(p.amount)},${escapeCSVCell(p.status)},${escapeCSVCell(p.payment_mode || 'Cash')},${escapeCSVCell(p.payment_date ? p.payment_date.split('T')[0] : 'N/A')},${escapeCSVCell(p.remarks || '')}\n`;
        });
      } else if (type === 'expenses') {
        const res = await authFetch(`${API_BASE_URL}/expenses`);
        const data = res && res.ok ? await res.json() : [];
        const expensesList = Array.isArray(data) ? data : [];

        csvContent = "ID,Category,Amount (INR),Description,Payment Method,Expense Date\n";
        expensesList.forEach(e => {
          csvContent += `${escapeCSVCell(e.id)},${escapeCSVCell(e.category)},${escapeCSVCell(e.amount)},${escapeCSVCell(e.description || 'N/A')},${escapeCSVCell(e.payment_method || 'Cash')},${escapeCSVCell(e.expense_date ? e.expense_date.split('T')[0] : 'N/A')}\n`;
        });
      } else if (type === 'rooms') {
        const res = await authFetch(`${API_BASE_URL}/rooms`);
        const data = res && res.ok ? await res.json() : [];
        const roomsList = Array.isArray(data) ? data : [];

        csvContent = "ID,Room Number,Floor,Total Capacity,Status\n";
        roomsList.forEach(r => {
          csvContent += `${escapeCSVCell(r.id)},${escapeCSVCell(r.room_number)},${escapeCSVCell(r.floor ? `Floor ${r.floor}` : 'N/A')},${escapeCSVCell(r.capacity || 1)},${escapeCSVCell(r.status || 'Available')}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV Download Failed", err);
    } finally {
      setDownloading('');
    }
  };

  // Client-side PDF Download Handler using jsPDF
  const handleDownloadPDF = async (type) => {
    setDownloading(type);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 210, 4, 'F');

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("HOSTEL MANAGEMENT SYSTEM — OFFICIAL REPORT", 14, 10);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");

      if (type === 'members') {
        const res = await authFetch(`${API_BASE_URL}/members`);
        const data = res && res.ok ? await res.json() : [];
        const membersList = Array.isArray(data) ? data : [];

        doc.text("Resident Directory & Profiles Report", 14, 26);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${timestamp} | Total Residents Registered: ${membersList.length}`, 14, 33);

        const tableColumn = ["ID", "Name", "Email", "Phone", "Aadhar / ID", "Sharing", "Rent (INR)", "Joined"];
        const tableRows = membersList.map(m => [
          m.id,
          m.name,
          m.email,
          m.phone || 'N/A',
          m.aadhar_number || 'N/A',
          m.sharing_type ? `${m.sharing_type} Share` : 'N/A',
          m.rent_fee ? `Rs. ${m.rent_fee}` : 'Rs. 0',
          m.joined_date ? m.joined_date.split('T')[0] : 'N/A'
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 38,
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8, cellPadding: 3 }
        });

      } else if (type === 'payments') {
        const res = await authFetch(`${API_BASE_URL}/payments`);
        const data = res && res.ok ? await res.json() : [];
        const paymentsList = Array.isArray(data) ? data : [];

        doc.text("Fee & Payment Ledger Report", 14, 26);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${timestamp} | Total Transactions Logged: ${paymentsList.length}`, 14, 33);

        const tableColumn = ["Receipt #", "Resident Name", "Amount (INR)", "Status", "Mode", "Date"];
        const tableRows = paymentsList.map(p => [
          p.receipt_no || 'N/A',
          p.members ? p.members.name : (p.resident_name || 'N/A'),
          `Rs. ${p.amount}`,
          p.status,
          p.payment_mode || 'Cash',
          p.payment_date ? p.payment_date.split('T')[0] : 'N/A'
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 38,
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8.5, cellPadding: 3 }
        });

      } else if (type === 'expenses') {
        const res = await authFetch(`${API_BASE_URL}/expenses`);
        const data = res && res.ok ? await res.json() : [];
        const expensesList = Array.isArray(data) ? data : [];

        doc.text("Operational Expenses Log Report", 14, 26);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${timestamp} | Total Expense Entries: ${expensesList.length}`, 14, 33);

        const tableColumn = ["ID", "Category", "Amount (INR)", "Description", "Method", "Date"];
        const tableRows = expensesList.map(e => [
          e.id,
          e.category,
          `Rs. ${e.amount}`,
          e.description || 'N/A',
          e.payment_method || 'Cash',
          e.expense_date ? e.expense_date.split('T')[0] : 'N/A'
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 38,
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8.5, cellPadding: 3 }
        });

      } else if (type === 'rooms') {
        const res = await authFetch(`${API_BASE_URL}/rooms`);
        const data = res && res.ok ? await res.json() : [];
        const roomsList = Array.isArray(data) ? data : [];

        doc.text("Room Inventory & Capacity Report", 14, 26);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${timestamp} | Total Rooms Configured: ${roomsList.length}`, 14, 33);

        const tableColumn = ["ID", "Room Number", "Floor", "Total Beds / Capacity", "Status"];
        const tableRows = roomsList.map(r => [
          r.id,
          r.room_number,
          r.floor ? `Floor ${r.floor}` : 'N/A',
          `${r.capacity || 1} Beds`,
          r.status || 'Available'
        ]);

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 38,
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 8.5, cellPadding: 3 }
        });
      }

      doc.save(`report_${type}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF report.");
    } finally {
      setDownloading('');
    }
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="page-content" style={{ paddingBottom: '6rem' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">Reports & Analytics</h1>
              <p className="page-subtitle">Operational summaries, financial metrics, CSV & PDF export center</p>
            </div>
            <button className="btn-secondary" onClick={fetchReports} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
            </button>
          </div>

          {/* Stat Overview Cards */}
          <div className="stat-grid-4" style={{ marginBottom: '1.5rem' }}>
            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    <PieChart size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Occupancy Rate</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#3b82f6' }}>
                {occupancyData.occupancy_rate}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {occupancyData.occupied_beds} / {occupancyData.total_beds} beds occupied
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    <TrendingUp size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Revenue</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#10b981' }}>
                ₹{Number(financialData?.total_revenue || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Paid resident fees
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <DollarSign size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Total Expenses</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: '#ef4444' }}>
                ₹{Number(financialData?.total_expenses || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Mess, maintenance & bills
              </div>
            </div>

            <div className="glass-panel stat-card">
              <div className="stat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="stat-icon" style={{ width: '2rem', height: '2rem', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                    <FileText size={16} />
                  </div>
                  <span style={{ fontSize: '0.875rem' }}>Net Operating Profit</span>
                </div>
              </div>
              <div className="stat-value" style={{ marginTop: '0.5rem', fontSize: '1.75rem', color: (financialData?.net_income || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{Number(financialData?.net_income || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Revenue minus expenses
              </div>
            </div>
          </div>

          {/* Export Center Cards */}
          <div className="dashboard-grid-2">
            <div className="glass-panel section-card">
              <h3 className="section-title" style={{ marginBottom: '0.5rem' }}>Operational & Financial Export Center</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Export comprehensive system spreadsheets (CSV) or structured PDF documents for accounting, audits, and management review.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* 1. Resident Directory & Profiles Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <Users size={16} style={{ color: '#10b981' }} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>Resident Directory & Profiles</h4>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Full resident roster, contact details, guardian details, Aadhar/Govt ID proof, assigned rooms, and monthly rent fees.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-primary" 
                      disabled={downloading === 'members_csv'}
                      onClick={() => handleDownloadCSV('members')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Download size={14} /> {downloading === 'members_csv' ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      disabled={downloading === 'members_pdf'}
                      onClick={() => handleDownloadPDF('members')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <FileText size={14} /> {downloading === 'members_pdf' ? 'Generating...' : 'Export PDF'}
                    </button>
                  </div>
                </div>

                {/* 2. Fee & Payment Ledger Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <CreditCard size={16} style={{ color: '#3b82f6' }} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>Fee & Payment Ledger</h4>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Complete financial transaction log, receipt numbers, status, payment modes, amounts, and reference remarks.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-primary" 
                      disabled={downloading === 'payments_csv'}
                      onClick={() => handleDownloadCSV('payments')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Download size={14} /> {downloading === 'payments_csv' ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      disabled={downloading === 'payments_pdf'}
                      onClick={() => handleDownloadPDF('payments')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <FileText size={14} /> {downloading === 'payments_pdf' ? 'Generating...' : 'Export PDF'}
                    </button>
                  </div>
                </div>

                {/* 3. Detailed Expense Logs Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <Receipt size={16} style={{ color: '#ef4444' }} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>Detailed Operational Expense Logs</h4>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Detailed record of mess, maintenance, labor salaries, utility bills, payment methods, and dates.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-primary" 
                      disabled={downloading === 'expenses_csv'}
                      onClick={() => handleDownloadCSV('expenses')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Download size={14} /> {downloading === 'expenses_csv' ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      disabled={downloading === 'expenses_pdf'}
                      onClick={() => handleDownloadPDF('expenses')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <FileText size={14} /> {downloading === 'expenses_pdf' ? 'Generating...' : 'Export PDF'}
                    </button>
                  </div>
                </div>

                {/* 4. Room Occupancy & Capacity Report Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <BedDouble size={16} style={{ color: '#a855f7' }} />
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>Room Inventory & Capacity Report</h4>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Complete room breakdown, floor locations, total bed capacities, and current occupancy status.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-primary" 
                      disabled={downloading === 'rooms_csv'}
                      onClick={() => handleDownloadCSV('rooms')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <Download size={14} /> {downloading === 'rooms_csv' ? 'Exporting...' : 'Export CSV'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      disabled={downloading === 'rooms_pdf'}
                      onClick={() => handleDownloadPDF('rooms')}
                      style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                    >
                      <FileText size={14} /> {downloading === 'rooms_pdf' ? 'Generating...' : 'Export PDF'}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Breakdown Summary */}
            <div className="glass-panel section-card">
              <h3 className="section-title" style={{ marginBottom: '1rem' }}>Room Occupancy Breakdown</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span>Occupied Capacity</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{occupancyData.occupied_beds} Beds</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${occupancyData.occupancy_rate}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span>Vacant Beds Available</span>
                    <span style={{ fontWeight: '600', color: '#3b82f6' }}>{occupancyData.available_beds} Beds</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${100 - occupancyData.occupancy_rate}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.05)', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: '600', color: '#f59e0b', marginBottom: '0.25rem' }}>Pending Dues Alert</div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    ₹{Number(financialData?.total_pending || 0).toLocaleString('en-IN')} in unpaid resident dues requires collection follow-up.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
