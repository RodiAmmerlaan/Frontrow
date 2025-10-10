import React, { useEffect, useState, useMemo } from 'react';
import api from '../utils/api';
import Card from './Card';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from './Pagination';
import '../styles/EventPage.css';

import image1 from '../utils/eventImages/1.jpg';
import image2 from '../utils/eventImages/2.jpg';
import image3 from '../utils/eventImages/3.jpg';
import image4 from '../utils/eventImages/4.jpg';
import image5 from '../utils/eventImages/5.jpg';

interface Props {
    accessToken: string | null
}

interface Event {
    id: string,
    title: string,
    description?: string,
    start_time: string,
    end_time: string,
    total_tickets?: number,
    tickets_left?: number,
    price?: number
}

interface Filters {
    dateFrom: string;
    dateTo: string;
    priceMin: string;
    priceMax: string;
    timeFrom: string;
    timeTo: string;
}

function EventPage({accessToken}:Props) {
    const [ allEvents, setAllEvents ] = useState<Event[]>([]);
    const [ filteredEvents, setFilteredEvents ] = useState<Event[]>([]);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const searchTerm = searchParams.get('search');
    
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 5;
    
    const [filters, setFilters] = useState<Filters>({
        dateFrom: '',
        dateTo: '',
        priceMin: '',
        priceMax: '',
        timeFrom: '',
        timeTo: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const currentEvents = filteredEvents.slice(startIndex, endIndex);

    const applyFilters = useMemo(() => {
        return (events: Event[]) => {
            return events.filter(event => {
                if (filters.dateFrom) {
                    const eventDate = new Date(event.start_time).toISOString().split('T')[0];
                    if (eventDate < filters.dateFrom) return false;
                }
                if (filters.dateTo) {
                    const eventDate = new Date(event.start_time).toISOString().split('T')[0];
                    if (eventDate > filters.dateTo) return false;
                }
                
                if (filters.priceMin && event.price !== undefined) {
                    if (event.price < parseFloat(filters.priceMin)) return false;
                }
                if (filters.priceMax && event.price !== undefined) {
                    if (event.price > parseFloat(filters.priceMax)) return false;
                }
                
                if (filters.timeFrom) {
                    const eventTime = new Date(event.start_time).toTimeString().slice(0, 5);
                    if (eventTime < filters.timeFrom) return false;
                }
                if (filters.timeTo) {
                    const eventTime = new Date(event.start_time).toTimeString().slice(0, 5);
                    if (eventTime > filters.timeTo) return false;
                }
                
                return true;
            });
        };
    }, [filters]);

    useEffect(() => {
        const filtered = applyFilters(allEvents);
        setFilteredEvents(filtered);
        setCurrentPage(1);
    }, [allEvents, filters, applyFilters]);

    const handleFilterChange = (filterName: keyof Filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            dateFrom: '',
            dateTo: '',
            priceMin: '',
            priceMax: '',
            timeFrom: '',
            timeTo: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    const eventsWithImages = useMemo(() => {
        const eventImages = [image1, image2, image3, image4, image5];
        
        if (currentEvents.length === 0) return [];
        
        const shuffledImages = [...eventImages].sort(() => Math.random() - 0.5);
        
        return currentEvents.map((event, index) => {
            const imageIndex = index % shuffledImages.length;
            
            return {
                ...event,
                assignedImage: shuffledImages[imageIndex]
            };
        });
    }, [currentEvents, currentPage]);

    async function getEvents(): Promise<Event[]> {
        return await api.get("/events")
            .then((response) => {
                return response.data.events;
            });
    }

    async function searchEvents(searchTerm: string): Promise<Event[]> {
        return await api.get(`/events/search?name=${encodeURIComponent(searchTerm)}`)
            .then((response) => {
                return response.data.events;
            });
    }

    useEffect(() => {
        async function loadEvents() {
            setLoading(true);
            setError(null);
            
            try {
                let data: Event[];
                if (searchTerm) {
                    data = await searchEvents(searchTerm);
                } else {
                    data = await getEvents();
                }
                setAllEvents(data);
            } catch (err) {
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        }
        loadEvents();
    }, [searchTerm])

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="event-page-container">
            <div className="event-page-hero">
                <h1 className="event-page-title">
                    {searchTerm ? 'ZOEKRESULTATEN' : 'AGENDA'}
                </h1>
            </div>

            {loading && (
                <div className="event-page-loading">
                    <p>Evenementen laden...</p>
                </div>
            )}

            {error && (
                <div className="event-page-error">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && allEvents.length > 0 && (
                <div className="filter-section">
                    <div className="filter-header">
                        <button 
                            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <span>Filters</span>
                            <span className={`filter-icon ${showFilters ? 'rotated' : ''}`}>▼</span>
                            {hasActiveFilters && <span className="filter-indicator"></span>}
                        </button>
                        {hasActiveFilters && (
                            <button className="clear-filters-btn" onClick={clearFilters}>
                                Wis filters
                            </button>
                        )}
                        <div className="filter-results-count">
                            {filteredEvents.length} van {allEvents.length} evenementen
                        </div>
                    </div>
                    
                    {showFilters && (
                        <div className="filter-controls">
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>Datum van:</label>
                                    <input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Datum tot:</label>
                                    <input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>Prijs min (€):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.priceMin}
                                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                        className="filter-input"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Prijs max (€):</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={filters.priceMax}
                                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                        className="filter-input"
                                        placeholder="999.99"
                                    />
                                </div>
                            </div>
                            
                            <div className="filter-row">
                                <div className="filter-group">
                                    <label>Starttijd:</label>
                                    <input
                                        type="time"
                                        value={filters.timeFrom}
                                        onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                                <div className="filter-group">
                                    <label>Eindtijd:</label>
                                    <input
                                        type="time"
                                        value={filters.timeTo}
                                        onChange={(e) => handleFilterChange('timeTo', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!loading && !error && filteredEvents.length > 0 && (
                <>
                    <div className="event-page-events-container">
                        {eventsWithImages.map((x, index) =>
                            <div key={x.id} className="event-page-event-item">
                                <Card 
                                    accessToken={accessToken} 
                                    id={x.id} 
                                    title={x.title} 
                                    description={x.description} 
                                    start_time={x.start_time} 
                                    end_time={x.end_time} 
                                    totalTickets={x.total_tickets} 
                                    ticketsLeft={x.tickets_left} 
                                    price={x.price}
                                    assignedImage={x.assignedImage}
                                />
                            </div>
                        )}
                    </div>
                    
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredEvents.length}
                        itemsPerPage={eventsPerPage}
                        hasActiveFilters={hasActiveFilters}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            {!loading && !error && allEvents.length === 0 && (
                <div className="event-page-no-events">
                    <p>
                        {searchTerm 
                            ? `Geen evenementen gevonden voor "${searchTerm}"` 
                            : 'Geen evenementen gevonden'
                        }
                    </p>
                </div>
            )}
            
            {!loading && !error && allEvents.length > 0 && filteredEvents.length === 0 && (
                <div className="event-page-no-events">
                    <p>Geen evenementen gevonden die voldoen aan de filters</p>
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        Wis alle filters
                    </button>
                </div>
            )}
        </div>
    )
};

export default EventPage;