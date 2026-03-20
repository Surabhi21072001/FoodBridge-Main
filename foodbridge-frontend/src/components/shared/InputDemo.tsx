import React, { useState } from 'react';
import Input from './Input';

const InputDemo: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
    } else if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else {
      setPasswordError('');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Input Component Demo</h1>

        <div className="space-y-6">
          {/* Normal Input */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Normal Input</h2>
            <Input
              label="Username"
              placeholder="Enter your username"
              helperText="Your username must be unique"
            />
          </div>

          {/* Input with Error */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Input with Error</h2>
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              error={emailError}
              required
            />
          </div>

          {/* Input with Password */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Password Input</h2>
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              error={passwordError}
              required
            />
          </div>

          {/* Disabled Input */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Disabled Input</h2>
            <Input
              label="Disabled Field"
              placeholder="This field is disabled"
              disabled
              value="Cannot edit this"
            />
          </div>

          {/* Input with Helper Text */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Input with Helper Text</h2>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(123) 456-7890"
              helperText="Format: (123) 456-7890"
            />
          </div>

          {/* Required Input */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Required Input</h2>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputDemo;
