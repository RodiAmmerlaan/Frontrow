import { useEffect, useState, useCallback } from 'react';
import EventPage from './EventPage';
import EventDetailsPage from './EventDetailsPage';
import api, { setAccessToken, setTokenUpdateCallback } from '../utils/api';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegistrationPage from './RegistrationPage';
import { CreateEvent } from './CreateEvent';
import { jwtDecode } from 'jwt-decode';
import LoginPage from './LoginPage';
import ReportsPage from './ReportsPage';
import { Navigation } from './Navigation';
import '../styles/App.css';
import { getCookie } from '../utils/cookieUtils';

type JwtPayload = { 
    sub: string, 
    email: string,
    role: string
};

function App() {
  const [accessToken, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');

  function getRole(accessToken: string) {
    try {
      const decodeToken = jwtDecode<JwtPayload>(accessToken);
      return decodeToken.role
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  function getUserInfo(accessToken: string) {
    try {
      const decodeToken = jwtDecode<JwtPayload>(accessToken);
      return {
        email: decodeToken.email,
        role: decodeToken.role,
        id: decodeToken.sub
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  const fetchUserDetails = useCallback(async (token: string) => {
    try {
      setAccessToken(token);
      
      const response = await api.get('/auth/profile');
      const userData = response.data && response.data.success && response.data.data ? response.data.data : null;
      
      if (userData) {
        let displayName = '';
        if (userData.first_name || userData.last_name) {
          displayName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();
        }
        
        if (!displayName) {
          const emailName = userData.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        
        setUserName(displayName);
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
      const userInfo = getUserInfo(token);
      if (userInfo) {
        const emailName = userInfo.email.split('@')[0];
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        setUserName(formattedName);
      }
    }
  }, []);

  useEffect(() => {
    setTokenUpdateCallback((token) => {
      setToken(token);
      setAccessToken(token);
      
      if (token) {
        fetchUserDetails(token);
      } else {
        setUserName('');
      }
    });
    
    const hasRefreshToken = getCookie('refresh_token');
    if (hasRefreshToken) {
      api.post('/auth/refresh', {}, { withCredentials: true })
        .then(res => {
          const accessToken = res.data && res.data.success && res.data.data && res.data.data.access_token 
            ? res.data.data.access_token 
            : null;
          if (accessToken) {
            setToken(accessToken);
            setAccessToken(accessToken);
            fetchUserDetails(accessToken);
          } else {
            setToken(null);
            setAccessToken(null);
          }
        })
        .catch(() => {
          setToken(null);
          setAccessToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [fetchUserDetails])

  if (loading) return <p>Laden...</p>;

  function logout(): void {
    api.post('/auth/logout', {}, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.success) {
          console.log('Logout successful');
        }
      })
      .catch(err => console.error('Logout error:', err))
      .finally(() => {
        setToken(null);
        setAccessToken(null);
      });
  }

  return (
    <div className="app-container">
      <BrowserRouter>
        <Navigation 
          accessToken={accessToken} 
          userName={userName} 
          onLogout={logout} 
          getRole={getRole} 
        />

        <Routes>
          <Route 
            path="/" 
            element={<EventPage accessToken={accessToken} />} 
          />

          <Route 
            path="/event/:eventId" 
            element={<EventDetailsPage accessToken={accessToken} />} 
          />

          <Route 
            path="/createEvent"
            element={
              accessToken && getRole(accessToken) === "Admin" ? (
                <CreateEvent />) : ( null )           
            }
          />

          <Route 
            path="/reports"
            element={
              accessToken && getRole(accessToken) === "Admin" ? (
                <ReportsPage accessToken={accessToken} />) : ( null )           
            }
          />

          {!accessToken ? (
          <Route 
            path="/register" 
            element={
              <RegistrationPage 
                onLogin={
                  (token) => {
                    setToken(token);
                    setAccessToken(token);
                    fetchUserDetails(token);
                  }
                }
              />
            }
          /> ) : (
            null
          ) }

          {!accessToken ? (
          <Route 
            path="/login" 
            element={
              <LoginPage 
                onLogin={
                  (token) => {
                    setToken(token);
                    setAccessToken(token);
                    fetchUserDetails(token);
                  }
                }
              />
            }
          /> ) : (
            null
          ) }
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;