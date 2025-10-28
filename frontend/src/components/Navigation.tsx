import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import '../styles/Navigation.css';

interface NavigationProps {
  accessToken: string | null;
  userName: string;
  onLogout: () => void;
  getRole: (token: string) => string | undefined;
}

export function Navigation({ accessToken, userName, onLogout, getRole }: NavigationProps) {
  return (
    <nav className="app-navigation">
      <div className="app-nav-content">
        <div className="app-brand">
          <Link to="/" className="app-brand-link">
            FrontRow
          </Link>
        </div>
        
        <div className="app-nav-links">
          <Link 
            to="/" 
            className="app-nav-link"
          >
            Home
          </Link>
          
          {accessToken && getRole(accessToken) === "Admin" && (
            <>
              <span className="app-nav-separator">|</span>
              <Link 
                to="/createEvent"
                className="app-nav-link"
              >
                Evenement Aanmaken
              </Link>
              <span className="app-nav-separator">|</span>
              <Link 
                to="/reports"
                className="app-nav-link"
              >
                Rapporten
              </Link>
            </>
          )}
        </div>
        

        <div className="app-nav-search">
          <SearchBar />
        </div>
        
        <div className="app-nav-actions">

          {accessToken && userName && (
            <span className="app-welcome-message">
              Welkom, {userName}
            </span>
          )}
          
          {!accessToken ? (
            <>
              <Link 
                to="/register"
                className="app-auth-link"
              >
                Registreren
              </Link>
              <span className="app-nav-separator">|</span>
              <Link 
                to="/login"
                className="app-auth-link"
              >
                Inloggen
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  onLogout();
                }}
                className="app-nav-link"
              >
                Uitloggen
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}