import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert 
} from '@mui/material';

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        token: credentialResponse.credential,
      });
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (!user.password) {
        setIsSettingPassword(true);
        setEmail(user.email);
      } else {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error(err);
    }
  };

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/set-password', {
        email,
        password,
      });
      setIsSettingPassword(false);

      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError('Failed to set password');
      console.error(err);
    }
  };

  const handleEmailLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 440,
        mx: 'auto',
        mt: 12,
        p: 5,
        borderRadius: 4,
        boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(14px)',
        backgroundColor: 'rgba(25, 25, 45, 0.82)', // semi-dark + transparency
        border: '1px solid rgba(255, 255, 255, 0.18)',
        color: '#ffffff',
      }}
    >
      <Typography 
        variant="h4" 
        align="center" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          mb: 4,
          color: '#ffffff',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)'
        }}
      >
        PE Power Dashboard
      </Typography>

      {!isSettingPassword ? (
        <>
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ mb: 4, color: '#e0e0e0' }}
          >
            Sign in with your work Gmail
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 4,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.08)'
          }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google login failed')}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </Box>

          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              my: 3, 
              color: '#b0b0b0',
              fontStyle: 'italic'
            }}
          >
            — or use email + password —
          </Typography>

          <TextField
            label="Work Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: '#d0d0d0' } }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                '&.Mui-focused fieldset': { borderColor: '#2196f3' },
              },
              '& .MuiInputBase-input': { color: 'white' }
            }}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: '#d0d0d0' } }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                '&.Mui-focused fieldset': { borderColor: '#2196f3' },
              },
              '& .MuiInputBase-input': { color: 'white' }
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ 
              mt: 2, 
              py: 1.6, 
              backgroundColor: '#1976d2',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
            onClick={handleEmailLogin}
          >
            LOGIN WITH EMAIL
          </Button>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </>
      ) : (
        <>
          <Typography 
            variant="h5" 
            align="center" 
            gutterBottom 
            sx={{ color: '#ffffff', fontWeight: 'bold' }}
          >
            Welcome!
          </Typography>

          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              color: '#e0e0e0', 
              mb: 4 
            }}
          >
            You signed in with <strong>{email}</strong>.<br />
            Please create a password for future logins.
          </Typography>

          <TextField
            label="Create Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            InputLabelProps={{ style: { color: '#d0d0d0' } }}
            helperText="Minimum 6 characters"
            FormHelperTextProps={{ style: { color: '#b0b0b0' } }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                '&.Mui-focused fieldset': { borderColor: '#2196f3' },
              },
              '& .MuiInputBase-input': { color: 'white' }
            }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{ 
              mt: 2, 
              py: 1.6, 
              backgroundColor: '#4caf50',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#388e3c' }
            }}
            onClick={handleSetPassword}
          >
            SET PASSWORD & CONTINUE
          </Button>

          {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
        </>
      )}
    </Box>
  );
};

export default LoginPage;