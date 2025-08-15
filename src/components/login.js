import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Container, 
  Grid, 
  Box, 
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import loginImage from './images/loginImage.jpg';
import axiosInstance from '../axios/axiosInstance';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const response = await axios.post('http://localhost:5000/api/login', {
            username,
            password,
        });

        // Debug: Log the entire response
        console.log('Login response:', response.data);

        if (!response.data.token || !response.data.role) {
            throw new Error('Invalid server response - missing token or role');
        }

        // Verify token structure
        if (typeof response.data.token !== 'string') {
            throw new Error('Invalid token format received');
        }

        // Store tokens and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
            id: response.data.id || response.data.student_id,
            role: response.data.role,
            name: response.data.name
        }));

        // Verify storage worked
        const storedToken = localStorage.getItem('token');
        if (!storedToken || storedToken !== response.data.token) {
            throw new Error('Failed to persist authentication token');
        }

        // Manually set header for next request
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Debug: Verify axios instance header
        console.log('Axios headers after login:', axiosInstance.defaults.headers);

        // Redirect
        navigate(response.data.role === 'student' 
            ? '/student/dashboard' 
            : '/admin/dashboard');

    } catch (err) {
        console.error('Login error:', err);
        setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        
        // Clean up any partial authentication state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axiosInstance.defaults.headers.common['Authorization'];
    } finally {
        setIsLoading(false);
    }
};

    return (
        <Container component="main" maxWidth="xs">
            <Paper elevation={3} sx={{ 
                p: 3, 
                mt: 8, 
                borderRadius: 2,
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.3s ease'
            }}>
                <Box sx={{ 
                    textAlign: 'center', 
                    mb: 2,
                    position: 'relative'
                }}>
                    <img
                        src={loginImage}
                        alt="School Logo"
                        style={{ 
                            width: '80%', 
                            borderRadius: 8, 
                            marginBottom: 20,
                            filter: isLoading ? 'blur(1px)' : 'none'
                        }}
                    />
                    {isLoading && (
                        <CircularProgress 
                            size={60}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-30px',
                                marginLeft: '-30px',
                                zIndex: 1
                            }}
                        />
                    )}
                </Box>
                
                <Typography component="h1" variant="h5" align="center" gutterBottom>
                    Sign In
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <form onSubmit={handleLogin}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                label="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isLoading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                variant="outlined"
                                required
                                fullWidth
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ 
                                    mt: 1, 
                                    py: 1.5,
                                    position: 'relative'
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <CircularProgress 
                                            size={24}
                                            sx={{
                                                color: 'inherit',
                                                position: 'absolute',
                                                left: '50%',
                                                marginLeft: '-12px'
                                            }}
                                        />
                                        <span style={{ opacity: 0 }}>Sign In</span>
                                    </>
                                ) : 'Sign In'}
                            </Button>
                        </Grid>
                        <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link 
                                    to="/register" 
                                    style={{ 
                                        color: '#1976d2',
                                        pointerEvents: isLoading ? 'none' : 'auto',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    Register
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default Login;