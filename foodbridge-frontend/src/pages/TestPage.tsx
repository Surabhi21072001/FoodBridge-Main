import React from 'react';
import ChatWidget from '../components/chat/ChatWidget';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <h1>FoodBridge - Welcome</h1>
      <p>If you see this, the app is working correctly!</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Navigation:</h2>
        <ul>
          <li>
            <a href="/login" style={{ color: 'blue', textDecoration: 'underline', marginRight: '10px' }}>
              Login
            </a>
          </li>
          <li>
            <a href="/register" style={{ color: 'blue', textDecoration: 'underline', marginRight: '10px' }}>
              Register
            </a>
          </li>
          <li>
            <a href="/dashboard" style={{ color: 'blue', textDecoration: 'underline', marginRight: '10px' }}>
              Dashboard (Protected)
            </a>
          </li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e0e0e0', borderRadius: '4px' }}>
        <p><strong>Note:</strong> The dashboard is protected and requires authentication.</p>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
};

export default TestPage;
