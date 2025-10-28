import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

interface Props {
    onLogin: (accessToken: string) => void;
}

interface LoginResponse {
    success: boolean;
    data: {
        access_token: string;
    };
}

function LoginPage({ onLogin }:Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post<LoginResponse>("/auth/login", { email, password });
            if (response.data && response.data.success && response.data.data && response.data.data.access_token) {
                const accessToken = response.data.data.access_token;
                onLogin(accessToken);
                navigate("/");
            } else {
                setError("Login mislukt, controleer je gegevens");
            }
        } catch {
            setError("Login mislukt, controleer je gegevens");
        }
    };

    let navigate = useNavigate();

    return (     
        <div className="login-page-container">
            <div className="login-page-card">
                <div className="login-page-header">
                    <h2 className="login-page-title">Login</h2>
                </div>

                <form onSubmit={handleLogin} className="login-page-form">
                    <div className="login-page-form-group">
                        <input
                            type='email'
                            placeholder='E-mail adres'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="login-page-input"
                        />
                    </div>
                    
                    <div className="login-page-form-group">
                        <input
                            type='password'
                            placeholder='Wachtwoord'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="login-page-input"
                        />
                    </div>

                    <button 
                        type='submit'
                        className="login-page-submit-btn"
                    >
                        Inloggen
                    </button>
                </form>
                
                {error && (
                    <div className="login-page-error">
                        {error}
                    </div>
                )}
                
                <div className="login-page-register-link">
                    <p className="login-page-register-text">
                        Nog geen account?{' '}
                        <span 
                            className="login-page-register-button"
                            onClick={() => navigate('/register')}
                        >
                            Registreer hier
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;