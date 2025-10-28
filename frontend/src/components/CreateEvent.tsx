import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateEvent.css';

interface Event {
    id: string,
    title: string,
    description: string,
    date: string,
    start_time: string,
    end_time: string,
    total_tickets: number,
    price: number,
}

export function CreateEvent() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        total_tickets: 0,
        price: 0,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    let navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === 'total_tickets' || name === 'price') {
            setForm({ ...form, [name]: value === '' ? 0 : Number(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/events/create", form);
            if (response.data && response.data.success) {
                navigate("/")
            } else {
                setError("Kan nieuw evenement niet aanmaken.");
            }
        } catch {
            setError("Kan nieuw evenement niet aanmaken.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-event-container">
            <div className="create-event-card">
                <div className="create-event-header">
                    <h1 className="create-event-title">Nieuw Evenement Aanmaken</h1>
                    <div className="create-event-divider"></div>
                    <p className="create-event-subtitle">Vul de details van het evenement in</p>
                </div>

                <form onSubmit={handleSubmit} className="create-event-form">
                    <div className="create-event-section">
                        <h2 className="create-event-section-title">Basisinformatie</h2>
                        
                        <div className="create-event-form-group">
                            <label htmlFor="title" className="create-event-label">Titel *</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="create-event-input"
                                placeholder="Voer de titel van het evenement in"
                            />
                        </div>

                        <div className="create-event-form-group">
                            <label htmlFor="description" className="create-event-label">Beschrijving *</label>
                            <textarea
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                required
                                className="create-event-textarea"
                                placeholder="Beschrijf het evenement"
                                rows={4}
                            />
                        </div>
                    </div>

                    <div className="create-event-section">
                        <h2 className="create-event-section-title">Datum en Tijd</h2>
                        
                        <div className="create-event-form-row">
                            <div className="create-event-form-group">
                                <label htmlFor="date" className="create-event-label">Datum *</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                    className="create-event-input"
                                />
                            </div>
                        </div>

                        <div className="create-event-form-row">
                            <div className="create-event-form-group">
                                <label htmlFor="start_time" className="create-event-label">Starttijd *</label>
                                <input
                                    type="time"
                                    id="start_time"
                                    name="start_time"
                                    value={form.start_time}
                                    onChange={handleChange}
                                    required
                                    className="create-event-input"
                                />
                            </div>

                            <div className="create-event-form-group">
                                <label htmlFor="end_time" className="create-event-label">Eindtijd *</label>
                                <input
                                    type="time"
                                    id="end_time"
                                    name="end_time"
                                    value={form.end_time}
                                    onChange={handleChange}
                                    required
                                    className="create-event-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="create-event-section">
                        <h2 className="create-event-section-title">Ticketinformatie</h2>
                        
                        <div className="create-event-form-row">
                            <div className="create-event-form-group">
                                <label htmlFor="total_tickets" className="create-event-label">Aantal Tickets *</label>
                                <input
                                    type="number"
                                    id="total_tickets"
                                    name="total_tickets"
                                    value={form.total_tickets || ''}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="create-event-input"
                                />
                            </div>

                            <div className="create-event-form-group">
                                <label htmlFor="price" className="create-event-label">Prijs per Ticket (€) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={form.price || ''}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="create-event-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="create-event-button-group">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="create-event-cancel-btn"
                        >
                            Annuleren
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="create-event-submit-btn"
                        >
                            {loading ? 'Aanmaken...' : 'Evenement Aanmaken'}
                        </button>
                    </div>

                    {error && (
                        <div className="create-event-error">
                            {error}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}