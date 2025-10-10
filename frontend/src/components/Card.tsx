import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Card.css';
import { selectImageForEvent, getEventImages } from '../utils/imageUtils';
import { formatDay, formatDateDay, formatMonth, formatTime } from '../utils/dateUtils';
import { EventOverview } from '../interfaces/event.interface';

interface Props extends EventOverview {
    accessToken: string | null;
    totalTickets?: number;
    ticketsLeft?: number;
    price?: number;
    assignedImage?: string;
}

export default function Card( props: Props ) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();
    
    
    const selectedImage = useMemo(() => {
        return selectImageForEvent(props.id, props.assignedImage);
    }, [props.assignedImage, props.id]);
    
    const handleImageError = () => {
        setImageError(true);
    };

    function handleCardClick() {
        const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (props.id && uuidRegex.test(props.id)) {
            navigate(`/event/${props.id}`);
        } else {
            console.error('Invalid event ID format:', props.id);
        }
    }

    return (
        <div 
            className={`event-card ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            <div className="event-card-date">
                <div className="event-card-date-weekday">
                    {formatDay(props.start_time)}
                </div>
                <div className="event-card-date-day">
                    {formatDateDay(props.start_time)}
                </div>
                <div className="event-card-date-month">
                    {formatMonth(props.start_time)}
                </div>
            </div>

            <div className="event-card-image">
                {!imageError ? (
                    <img 
                        src={selectedImage} 
                        alt={props.title}
                        className="event-card-image-element"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="event-card-image-fallback">
                        🎪
                    </div>
                )}
            </div>

            <div className="event-card-content">
                <div>
                    <div className="event-card-header">
                        <h3 className="event-card-title">
                            {props.title}
                        </h3>
                    </div>

                    <p className="event-card-description">
                        {props.description || 'Geen beschrijving beschikbaar'}
                    </p>
                </div>

                <div>
                    <div className="event-card-details">
                        <div className="event-card-price">
                            <div className="event-card-price-label">
                                PRIJS
                            </div>
                            <div className="event-card-price-value">
                                €{props.price || 0}
                            </div>
                        </div>

                        <div className="event-card-time">
                            <div className="event-card-time-label">
                                START TIJD
                            </div>
                            <div className="event-card-time-value">
                                {formatTime(props.start_time)}
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick();
                            }}
                            className="event-card-button"
                        >
                            Meer Info & Tickets
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};