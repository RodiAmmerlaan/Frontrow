import React, { useState } from 'react';
import api, { setAccessToken } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../styles/RegistrationPage.css';

interface Props {
    onLogin: (access_token: string) => void;
}

interface AccessToken {
    access_token: string;
}

function RegistrationPage( { onLogin }: Props) {
    const [form, setForm] = useState({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        street: "",
        house_number: "",
        postal_code: "",
        city: ""
    });
    const [error, setError] = useState("");
    const [, setLoadingAddress] = useState(false);

    let navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const validateAddress = async () => {
        if (form.postal_code && form.house_number) {
            try {
                setLoadingAddress(true);
                const response = await api.get(`/addressCheck?postalCode=${encodeURIComponent(form.postal_code)}&houseNumber=${encodeURIComponent(form.house_number)}`);
                if(!(response.status === 200)) setError("Adres niet gevonden");

                const data = response.data.data;

                if (data.city && data.street) {
                    setForm((prev) => ({
                        ...prev,
                        street: data.street,
                        city: data.city
                    }));
                }
            } catch (error) {
            } finally {
                setLoadingAddress(false);
            }
        }
    }

    const handleSubmit = async (error: React.FormEvent) => {
        error.preventDefault();
        setError("");

        try {
            const response = await api.post<AccessToken>("/auth/register", form);

            if (response.data?.access_token) {
                setAccessToken(response.data.access_token);
                onLogin(response.data.access_token);

                navigate("/")
            } else {
                setError("Geen access token ontvangen, probeer het later opnieuw");
            }
        } catch {
            setError("Registratie mislukt. Controleer je gegevens.")
        }
    };

    return (
        <div className="registration-page-container">
            <div className="registration-page-card">
                <div className="registration-page-header">
                    <h2 className="registration-page-title">Registreren</h2>
                </div>

                <form onSubmit={handleSubmit} className="registration-page-form">
                    <div className="registration-page-section">
                        <h3 className="registration-page-section-title">Persoonlijke Gegevens</h3>
                        
                        <div className="registration-page-row">
                            <input
                                type='text'
                                name='first_name'
                                placeholder='Voornaam'
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                className="registration-page-input no-margin"
                            />
                            <input
                                type='text'
                                name='last_name'
                                placeholder='Achternaam'
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                className="registration-page-input no-margin"
                            />
                        </div>
                        
                        <input
                            type='email'
                            name='email'
                            placeholder='E-mail adres'
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="registration-page-input"
                        />
                        
                        <input
                            type='password'
                            name='password'
                            placeholder='Wachtwoord'
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="registration-page-input no-margin"
                        />
                    </div>

                    <div className="registration-page-section">
                        <h3 className="registration-page-section-title">Adresgegevens</h3>
                        
                        <div className="registration-page-row">
                            <input
                                type='text'
                                name='postal_code'
                                placeholder='Postcode'
                                value={form.postal_code}
                                onChange={handleChange}
                                onBlur={validateAddress}
                                required
                                className="registration-page-input no-margin"
                            />
                            <input
                                type='text'
                                name='house_number'
                                placeholder='Huisnummer'
                                value={form.house_number}
                                onChange={handleChange}
                                onBlur={validateAddress}
                                required
                                className="registration-page-input no-margin"
                            />
                        </div>
                        
                        <input
                            type='text'
                            name='street'
                            placeholder='Straat (wordt automatisch ingevuld)'
                            value={form.street}
                            onChange={handleChange}
                            readOnly
                            className="registration-page-input readonly"
                        />
                        
                        <input
                            type='text'
                            name='city'
                            placeholder='Stad (wordt automatisch ingevuld)'
                            value={form.city}
                            onChange={handleChange}
                            readOnly
                            className="registration-page-input readonly no-margin"
                        />
                    </div>
                    
                    <button 
                        type='submit'
                        className="registration-page-submit-btn"
                    >
                        Account Aanmaken
                    </button>
                </form>
                
                {error && (
                    <div className="registration-page-error">
                        {error}
                    </div>
                )}
                
                <div className="registration-page-login-link">
                    <p className="registration-page-login-text">
                        Al een account?{' '}
                        <span 
                            className="registration-page-login-button"
                            onClick={() => navigate('/login')}
                        >
                            Log hier in
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegistrationPage;