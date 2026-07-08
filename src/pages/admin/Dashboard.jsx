import React from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <AdminLayout showHeader={true}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        fontFamily: 'sans-serif'
      }}>
        {/* Large Logo Area */}
        <div style={{
          width: '320px',
          height: '320px',
          background: '#d97706', // Yellow/Orange background
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Faint circle lines to mimic the logo */}
          <div style={{
            position: 'absolute',
            width: '260px',
            height: '260px',
            border: '1px solid rgba(0,0,0,0.2)',
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            clipPath: 'polygon(0 0, 100% 0, 100% 75%, 0 75%)'
          }}></div>
          <div style={{
            fontFamily: 'serif',
            fontSize: '18px',
            fontStyle: 'italic',
            color: '#1e293b',
            marginBottom: '8px'
          }}>The</div>
          <div style={{
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '8px',
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            AVATAR
          </div>
          <div style={{
            fontSize: '10px',
            letterSpacing: '2px',
            color: '#1e293b'
          }}>
            COFFEE & BAR
          </div>
          <div style={{
            fontSize: '8px',
            letterSpacing: '1px',
            color: '#1e293b',
            marginTop: '8px'
          }}>
            ESTD 2012
          </div>
        </div>

        {/* Text */}
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>iaia</h1>
        <p style={{ fontSize: '16px', color: '#0f172a', marginBottom: '40px' }}>iaia.goimon.shop</p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <button 
            onClick={() => navigate('/admin/tables')}
            style={{
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>🪑</span>
            Các Bàn
          </button>
          
          <button 
            onClick={() => navigate('/admin/orders')}
            style={{
              background: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '20px' }}>🛎️</span>
            Đơn Gọi
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
