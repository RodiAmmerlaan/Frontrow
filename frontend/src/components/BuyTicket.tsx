import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useJwt } from 'react-jwt';
import { useNavigate } from 'react-router-dom';
import PaymentMethod from './PaymentMethod';
import { QRCodeCanvas } from 'qrcode.react';
import '../styles/App.css';
import '../styles/BuyTicket.css';

interface Props {
    accessToken: string | null,
    event_id: string,
    ticketPrice?: number
}

interface TokenPayload {
    sub: string
}

interface Ticket {
    id: string;
    order_id: string;
    assigned_to: string;
    ticket_number: string;
}

interface BuyTicketsResponse {
    tickets: Ticket[];
}

interface EventDetails {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    price?: number;
}

function BuyTicket({accessToken, event_id, ticketPrice = 10}:Props) {
    const [total_amount, setAmount] = useState(0);
    const [user_id, setUserId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [purchasedTickets, setPurchasedTickets] = useState<Ticket[]>([]);
    const [currentStep, setCurrentStep] = useState<'quantity' | 'payment' | 'success'>('quantity');
    const [, setSelectedPaymentMethod] = useState<string>('');
    const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);

    const navigate = useNavigate();

    const { decodedToken } = useJwt<TokenPayload>(accessToken || "");
    const sub = accessToken ? decodedToken?.sub : null;
    
    useEffect(() => {
        if (sub) {
            setUserId(sub);
        }
    }, [sub, accessToken]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await api.get(`/events/${event_id}`);
                setEventDetails(response.data.data.event);
            } catch (error) {
                console.error("Error fetching event details:", error);
            }
        };

        fetchEventDetails();
    }, [event_id]);

    const buyTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setCurrentStep('payment');
    };

    const handlePaymentMethodSelected = async (paymentMethod: string) => {
        setSelectedPaymentMethod(paymentMethod);
        
        const currentUserId = user_id || sub;
        if (!currentUserId) {
            setError("User ID not available. Please try again.");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const response = await api.post<BuyTicketsResponse>("/orders/buy", { 
                event_id, 
                user_id: currentUserId, 
                total_amount,
                payment_method: paymentMethod
            });
            
            setPurchasedTickets(response.data.tickets);
            setCurrentStep('success');
            
        } catch (error) {
            setError("Kan Ticket niet kopen");
            setCurrentStep('quantity');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToQuantity = () => {
        setCurrentStep('quantity');
        setError("");
    };

    const goBackToEvents = () => {
        navigate("/");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('nl-NL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('nl-NL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (currentStep === 'success' && purchasedTickets.length > 0) {
        return (
            <div className="buy-ticket-container success">
                <div className="buy-ticket-header">
                    <div className="buy-ticket-icon success">
                        ✓
                    </div>
                    <h2 className="buy-ticket-title success">Tickets Gekocht!</h2>
                    <p className="buy-ticket-subtitle success">Je hebt succesvol {purchasedTickets.length} ticket(s) gekocht.</p>
                </div>
                
                {/* Event Information at the top */}
                {eventDetails && (
                    <div className="buy-ticket-event-info">
                        <div className="buy-ticket-event-card">
                            <h3 className="buy-ticket-event-title">{eventDetails.title}</h3>
                            <div className="buy-ticket-event-details">
                                <div className="buy-ticket-event-field">
                                    <span className="buy-ticket-event-label">Datum & Tijd:</span>
                                    <span className="buy-ticket-event-value">
                                        {formatDate(eventDetails.start_time)} om {formatTime(eventDetails.start_time)}
                                    </span>
                                </div>
                                <div className="buy-ticket-event-field">
                                    <span className="buy-ticket-event-label">Prijs per ticket:</span>
                                    <span className="buy-ticket-event-value">€{eventDetails.price?.toFixed(2)}</span>
                                </div>
                                <div className="buy-ticket-event-field">
                                    <span className="buy-ticket-event-label">Aantal tickets:</span>
                                    <span className="buy-ticket-event-value">{purchasedTickets.length}</span>
                                </div>
                                <div className="buy-ticket-event-field">
                                    <span className="buy-ticket-event-label">Totaal betaald:</span>
                                    <span className="buy-ticket-event-value">
                                        €{(eventDetails.price || 0) * purchasedTickets.length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="buy-ticket-tickets-list">
                    {purchasedTickets.map((ticket, index) => (
                        <div key={ticket.id} className="buy-ticket-ticket-item">
                            <div className="buy-ticket-ticket-badge">
                                Ticket #{index + 1}
                            </div>

                            <div className="buy-ticket-ticket-content">
                                <div className="buy-ticket-ticket-info">
                                    <h3 className="buy-ticket-ticket-title">Ticket: {ticket.ticket_number}</h3>
                                                                        
                                    <div className="buy-ticket-qr-section">
                                        <h4 className="buy-ticket-qr-title">Toegangscode</h4>
                                        <div className="buy-ticket-qr-container">
                                            <QRCodeCanvas 
                                                value={ticket.ticket_number}
                                                size={128}
                                                level={"H"}
                                                includeMargin={true}
                                            />
                                        </div>
                                        <p className="buy-ticket-qr-description">
                                            Laat deze QR-code zien bij de ingang van het evenement
                                        </p>
                                    </div>
                                    
                                    <div className="buy-ticket-info-box">
                                        <div className="buy-ticket-info-content">
                                            <span className="buy-ticket-info-icon">📱</span>
                                            <div>
                                                <h4 className="buy-ticket-info-title">Bewaar je tickets</h4>
                                                <p className="buy-ticket-info-text">Noteer je ticketinformatie. Je hebt deze nodig bij de ingang van het evenement.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={goBackToEvents}
                    className="buy-ticket-back-btn"
                >
                    <span>←</span>
                    Terug naar Events
                </button>
            </div>
        );
    }

    if (currentStep === 'payment') {
        return (
            <PaymentMethod
                totalAmount={total_amount}
                ticketPrice={ticketPrice}
                onPaymentMethodSelected={handlePaymentMethodSelected}
                onBack={handleBackToQuantity}
            />
        );
    }

    return (
        <div className="buy-ticket-container purchase-form">
            <div className="buy-ticket-header">
                <div className="buy-ticket-icon">
                </div>
                <h2 className="buy-ticket-title">Tickets Kopen</h2>
                <p className="buy-ticket-subtitle">Selecteer het aantal tickets dat je wilt kopen</p>
            </div>

            <form onSubmit={buyTicket} className="buy-ticket-form">
                <div className="buy-ticket-form-group">
                    <label className="buy-ticket-label">Aantal Tickets</label>
                    <input
                        type='number'
                        placeholder='Voer aantal in...'
                        value={total_amount || ''}
                        onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                        required
                        min="1"
                        max="10"
                        className="buy-ticket-input"
                    />
                    <div className="buy-ticket-hint">Maximum 10 tickets per bestelling</div>
                </div>

                {error && (
                    <div className="buy-ticket-error">
                        <span className="buy-ticket-error-icon">⚠️</span>
                        <span className="buy-ticket-error-text">{error}</span>
                    </div>
                )}

                <div className="buy-ticket-actions">
                    {accessToken && (user_id || sub) ? (
                        <button 
                            type='submit'
                            disabled={loading || total_amount <= 0}
                            className="buy-ticket-btn"
                        >
                            {loading ? (
                                <>
                                    <span className="buy-ticket-loading-spinner" />
                                    Bezig met kopen...
                                </>
                            ) : (
                                'Tickets Kopen'
                            )}
                        </button>
                    ) : (
                        <div className="buy-ticket-btn not-allowed">
                            Log in om tickets te kopen
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}

export default BuyTicket;