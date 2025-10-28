import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';
import '../styles/ReportsPage.css';
import { ReportsHeader } from './ReportsHeader';
import { TabNavigation } from './TabNavigation';
import { ReportsFilter } from './ReportsFilter';
import { SalesOverviewTab } from './SalesOverviewTab';
import { UserAnalyticsTab } from './UserAnalyticsTab';

type JwtPayload = { 
    sub: string, 
    email: string,
    role: string
};

interface ReportsPageProps {
    accessToken: string | null;
}

interface SalesOverviewResponse {
    period: {
        month?: number;
        year?: number;
        description: string;
    };
    total_events: number;
    total_orders: number;
    total_tickets_sold: number;
    total_revenue: number;
    average_revenue_per_event: number;
    events: EventSalesOverview[];
}

interface EventSalesOverview {
    event_id: string;
    event_title: string;
    event_description?: string;
    event_start_time: string;
    event_end_time: string;
    total_orders: number;
    total_tickets_sold: number;
    total_revenue: number;
    ticket_price?: number;
    tickets_available?: number;
    sales_percentage?: number;
}

interface UserPurchaseStats {
    user_id: string;
    user_email: string;
    user_name: string;
    total_orders: number;
    total_tickets_purchased: number;
    total_spent: number;
    average_tickets_per_order: number;
    events_attended: number;
    first_purchase_date: string;
    last_purchase_date: string;
}

interface FrequentBuyer {
    user_id: string;
    user_email: string;
    user_name: string;
    total_orders: number;
    total_tickets_purchased: number;
    total_spent: number;
    rank: number;
}

interface UserPurchaseReportResponse {
    period: {
        month?: number;
        year?: number;
        description: string;
    };
    summary: {
        total_users: number;
        total_orders: number;
        total_tickets_sold: number;
        total_revenue: number;
        average_tickets_per_order: number;
        average_orders_per_user: number;
        average_spending_per_user: number;
    };
    user_stats: UserPurchaseStats[];
    frequent_buyers: FrequentBuyer[];
}

export default function ReportsPage({ accessToken }: ReportsPageProps) {
    const [activeTab, setActiveTab] = useState<'sales' | 'users'>('sales');
    const [salesData, setSalesData] = useState<SalesOverviewResponse | null>(null);
    const [userPurchaseData, setUserPurchaseData] = useState<UserPurchaseReportResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        month: "",
        year: ""
    });

    const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            if (activeTab === 'sales') {
                const response = await api.get(`/events/sales-overview?month=${filters.month || ''}&year=${filters.year || ''}`);
                // Updated to handle new response format with success/data structure
                if (response.data && response.data.success && response.data.data) {
                    setSalesData(response.data.data);
                } else if (response.data && !response.data.success && response.data.error === "FORBIDDEN") {
                    setError('Access denied. Admin role required');
                }
            } else {
                const response = await api.get(`/events/user-purchase-report?month=${filters.month || ''}&year=${filters.year || ''}`);
                // Updated to handle new response format with success/data structure
                if (response.data && response.data.success && response.data.data) {
                    setUserPurchaseData(response.data.data);
                } else if (response.data && !response.data.success && response.data.error === "FORBIDDEN") {
                    setError('Access denied. Admin role required');
                }
            }
        } catch (err: any) {
            // Handle network errors or other unexpected errors
            if (err.response && err.response.data && err.response.data.error === "FORBIDDEN") {
                setError('Access denied. Admin role required');
            } else {
                setError('Fout bij het ophalen van rapportagedata');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        setSalesData(null);
        setUserPurchaseData(null);
        setError(null);
        loadInitialData();
    }, [activeTab]);

    const loadInitialData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            if (activeTab === 'sales') {
                const response = await api.get(`/events/sales-overview`);
                // Updated to handle new response format with success/data structure
                if (response.data && response.data.success && response.data.data) {
                    setSalesData(response.data.data);
                } else if (response.data && !response.data.success && response.data.error === "FORBIDDEN") {
                    setError('Access denied. Admin role required');
                }
            } else {
                const response = await api.get(`/events/user-purchase-report`);
                // Updated to handle new response format with success/data structure
                if (response.data && response.data.success && response.data.data) {
                    setUserPurchaseData(response.data.data);
                } else if (response.data && !response.data.success && response.data.error === "FORBIDDEN") {
                    setError('Access denied. Admin role required');
                }
            }
        } catch (err: any) {
            // Handle network errors or other unexpected errors
            if (err.response && err.response.data && err.response.data.error === "FORBIDDEN") {
                setError('Access denied. Admin role required');
            } else {
                setError('Fout bij het ophalen van rapportagedata');
            }
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = () => {
        if (!salesData) return;
        
        const csvHeaders = [
            'Event Title',
            'Event Description', 
            'Start Time',
            'End Time',
            'Total Orders',
            'Tickets Sold',
            'Total Revenue',
            'Ticket Price',
            'Tickets Available',
            'Sales Percentage'
        ];
        
        const csvRows = salesData.events.map(event => [
            `"${event.event_title}"`,
            `"${event.event_description || ''}"`,
            `"${new Date(event.event_start_time).toLocaleDateString()}"`,
            `"${new Date(event.event_end_time).toLocaleDateString()}"`,
            event.total_orders,
            event.total_tickets_sold,
            event.total_revenue,
            event.ticket_price || 0,
            event.tickets_available || 0,
            `${event.sales_percentage || 0}%`
        ]);
        
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales-report-${salesData.period.description.replace(/\s+/g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadJSONReport = () => {
        if (!salesData) return;
        
        const jsonContent = JSON.stringify(salesData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales-report-${salesData.period.description.replace(/\s+/g, '-')}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadUserPurchaseReport = () => {
        if (!userPurchaseData) return;
        
        const csvHeaders = [
            'User Email',
            'User Name',
            'Total Orders',
            'Total Tickets Purchased',
            'Total Spent',
            'Average Tickets per Order',
            'Events Attended',
            'First Purchase Date',
            'Last Purchase Date'
        ];
        
        const csvRows = userPurchaseData.user_stats.map(user => [
            `"${user.user_email}"`,
            `"${user.user_name}"`,
            user.total_orders,
            user.total_tickets_purchased,
            user.total_spent,
            user.average_tickets_per_order,
            user.events_attended,
            `"${new Date(user.first_purchase_date).toLocaleDateString()}"`,
            `"${new Date(user.last_purchase_date).toLocaleDateString()}"`
        ]);
        
        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `user-purchase-report-${userPurchaseData.period.description.replace(/\s+/g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadUserPurchaseJSONReport = () => {
        if (!userPurchaseData) return;
        
        const jsonContent = JSON.stringify(userPurchaseData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `user-purchase-report-${userPurchaseData.period.description.replace(/\s+/g, '-')}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="reports-page-container">
            <div className="reports-page-wrapper">
                <ReportsHeader />
            
                <TabNavigation 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                />
            
                <ReportsFilter 
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onFilterSubmit={handleFilterSubmit}
                    loading={loading}
                />

                {error && (
                    <div className={`reports-page-error-container ${error.includes('Access denied') ? 'authorization-error' : ''}`}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {activeTab === 'sales' && (
                    salesData ? (
                        <SalesOverviewTab 
                            salesData={salesData}
                            onDownloadCSV={downloadReport}
                            onDownloadJSON={downloadJSONReport}
                        />
                    ) : loading ? null : (
                        <div className="reports-page-no-data">
                            <h3 className="reports-page-no-data-title">No Sales Data</h3>
                            <p className="reports-page-no-data-text">No sales data available.</p>
                        </div>
                    )
                )}

                {activeTab === 'users' && (
                    userPurchaseData ? (
                        <UserAnalyticsTab 
                            userPurchaseData={userPurchaseData}
                            onDownloadCSV={downloadUserPurchaseReport}
                            onDownloadJSON={downloadUserPurchaseJSONReport}
                        />
                    ) : loading ? null : (
                        <div className="reports-page-no-user-data">
                            <h3 className="reports-page-no-user-data-title">No User Purchase Data</h3>
                            <p className="reports-page-no-user-data-text">No user purchase data available.</p>
                        </div>
                    )
                )}

                {loading && (
                    <div className="reports-page-loading-container">
                        <div className="reports-page-loading-text">Loading {activeTab === 'sales' ? 'sales' : 'user purchase'} data...</div>
                    </div>
                )}
            </div>
        </div>
    );
}