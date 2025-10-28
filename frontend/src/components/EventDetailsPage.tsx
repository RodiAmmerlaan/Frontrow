import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactModal from 'react-modal';
import BuyTicket from './BuyTicket';
import api from '../utils/api';
import '../styles/EventDetailsPage.css';
import { selectImageForEvent, getEventImages } from '../utils/imageUtils';
import { formatDate, formatTime } from '../utils/dateUtils';
import { EventOverview } from '../interfaces/event.interface';

interface Props {
    accessToken: string | null;
}

export default function EventDetailsPage({ accessToken }: Props) {
    const { eventId } = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<EventOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalIsOpen, setIsOpen] = useState(false);

    const heroImage = useMemo(() => {
        const eventImages = getEventImages();
        
        if (!event?.id) return eventImages[0];
        
        return selectImageForEvent(event.id);
    }, [event?.id]);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                setLoading(true);
                
                const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                if (!eventId || !uuidRegex.test(eventId)) {
                    setError('Ongeldig event ID formaat');
                    setLoading(false);
                    return;
                }
                
                const response = await api.get(`/events/${eventId}`);
                const eventDetails = response.data && response.data.success && response.data.data && response.data.data.event 
                    ? response.data.data.event 
                    : null;
                
                if (eventDetails) {
                    setEvent(eventDetails);
                } else {
                    setError('Evenement niet gevonden');
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError('Evenement niet gevonden');
                } else if (err.response?.status === 400) {
                    setError('Ongeldig event ID');
                } else {
                    setError('Fout bij het laden van event details');
                }
            } finally {
                setLoading(false);
            }
        };

        if (eventId) {
            fetchEventDetails();
        }
    }, [eventId]);

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
    }

    const getAvailabilityClass = () => {
        if (!event) return 'event-details-availability-low';
        const availabilityPercentage = (event.total_tickets || 0) > 0 
            ? Math.round(((event.tickets_left || 0) / (event.total_tickets || 0)) * 100)
            : 0;
        
        if (availabilityPercentage > 50) return 'event-details-availability-high';
        if (availabilityPercentage > 20) return 'event-details-availability-medium';
        return 'event-details-availability-low';
    };

    if (loading) {
        return (
            <div className="event-details-loading">
                Event details laden...
            </div>
        );
    }

    if (error) {
        return (
            <div className="event-details-error">
                <div className="event-details-error-message">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="event-details-error-btn"
                >
                    Terug naar overzicht
                </button>
            </div>
        );
    }

    if (!event) {
        return null;
    }

    return (
        <div className="event-details-container">
            <button
                onClick={() => navigate('/')}
                className="event-details-back-btn"
            >
                ← Terug naar overzicht
            </button>

            <div className="event-details-card">
                <div 
                    className={`event-details-hero event-details-hero-overlay`}
                    style={{ backgroundImage: `url(${heroImage})` }}
                >
                    <h1 className="event-details-title">
                        {event.title}
                    </h1>
                    
                    <div className="event-details-date">
                        {formatDate(event.start_time)} om {formatTime(event.start_time)}
                    </div>

                    <div className="event-details-status-bar">
                        <div 
                            className={`event-details-availability ${getAvailabilityClass()}`}
                        >
                            {(event.tickets_left || 0) > 0 ? `${event.tickets_left} tickets beschikbaar` : 'UITVERKOCHT'}
                        </div>
                    </div>
                </div>

                <div className="event-details-content">
                    <div className="event-details-main">
                        <div className="event-details-description">
                            <h2>
                                Over dit evenement
                            </h2>
                            <p>
                                {event.description}
                            </p>
                        </div>

                        <div className="event-details-sidebar">
                            <h3>
                                Event Informatie
                            </h3>

                            <div className="event-details-info-item">
                                <div className="event-details-info-label">
                                    DATUM & TIJD
                                </div>
                                <div className="event-details-info-value">
                                    {formatDate(event.start_time)}
                                </div>
                                <div className="event-details-info-value secondary">
                                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                                </div>
                            </div>

                            <div className="event-details-info-item">
                                <div className="event-details-info-label">
                                    TICKETPRIJS
                                </div>
                                <div className="event-details-info-value large">
                                    €{event.price}
                                </div>
                            </div>

                            <div className="event-details-info-item">
                                <div className="event-details-info-label">
                                    BESCHIKBAARHEID
                                </div>
                                <div className="event-details-info-value">
                                    {event.tickets_left || 0} van {event.total_tickets || 0} tickets
                                </div>
                            </div>

                            <div className="event-details-info-item">
                                <div className="event-details-info-value">
                                    {accessToken && (event.tickets_left || 0) > 0 ? (
                                        <button
                                            onClick={openModal}
                                            className="event-details-buy-btn"
                                        >
                                            Tickets Kopen
                                        </button>
                                    ) : (event.tickets_left || 0) === 0 ? (
                                        <div className="event-details-sold-out">
                                            Uitverkocht
                                        </div>
                                    ) : (
                                        <div className="event-details-login-message">
                                            Log in om tickets te kopen
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {accessToken && (
                <ReactModal 
                    isOpen={modalIsOpen} 
                    onRequestClose={closeModal}
                    preventScroll={true} 
                    ariaHideApp={false}
                    className="event-details-modal-content-default"
                    overlayClassName="event-details-modal-overlay-default"
                    shouldCloseOnOverlayClick={true}
                    shouldCloseOnEsc={true}
                >
                    <div>
                        <button 
                            onClick={closeModal} 
                            className="event-details-modal-close"
                        >
                            ×
                        </button>
                        <BuyTicket 
                            accessToken={accessToken} 
                            event_id={event.id}
                            ticketPrice={event.price}
                        />
                    </div>
                </ReactModal>
            )}
        </div>
    );
}