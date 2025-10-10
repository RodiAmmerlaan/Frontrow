import React from 'react';

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

interface SalesOverviewTabProps {
  salesData: SalesOverviewResponse;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
}

export function SalesOverviewTab({ salesData, onDownloadCSV, onDownloadJSON }: SalesOverviewTabProps) {
  return (
    <div>
      <div className="reports-page-summary">
        <h3 className="reports-page-summary-title">Sales Summary - {salesData.period.description}</h3>
        <div className="reports-page-summary-grid">
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Total Events</div>
            <div className="reports-page-summary-value">{salesData.total_events}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Total Orders</div>
            <div className="reports-page-summary-value">{salesData.total_orders}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Tickets Sold</div>
            <div className="reports-page-summary-value">{salesData.total_tickets_sold}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Total Revenue</div>
            <div className="reports-page-summary-value">€{salesData.total_revenue}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Avg Revenue/Event</div>
            <div className="reports-page-summary-value">€{salesData.average_revenue_per_event}</div>
          </div>
        </div>
      </div>

      <div className="reports-page-download-section">
        <h3 className="reports-page-download-title">Download Reports</h3>
        <div className="reports-page-flex-buttons">
          <button
            onClick={onDownloadCSV}
            className="reports-page-download-btn csv"
          >
            Download CSV Report
          </button>
          <button
            onClick={onDownloadJSON}
            className="reports-page-download-btn json"
          >
            Download JSON Report
          </button>
        </div>
      </div>

      {salesData.events.length > 0 ? (
        <div className="reports-page-table-container">
          <div className="reports-page-table-header">
            <h3 className="reports-page-table-title">Event Details</h3>
          </div>
          <div className="reports-page-table-scroll">
            <table className="reports-page-table">
              <thead>
                <tr className="reports-page-header-row">
                  <th>Event</th>
                  <th>Start Date</th>
                  <th className="right">Orders</th>
                  <th className="right">Tickets Sold</th>
                  <th className="right">Revenue</th>
                  <th className="right">Price</th>
                  <th className="right">Sales %</th>
                </tr>
              </thead>
              <tbody>
                {salesData.events.map((event) => (
                  <tr key={event.event_id}>
                    <td>
                      <div>
                        <div className="reports-page-table-event-title">{event.event_title}</div>
                      </div>
                    </td>
                    <td>
                      {new Date(event.event_start_time).toLocaleDateString()}
                    </td>
                    <td className="right">
                      {event.total_orders}
                    </td>
                    <td className="right">
                      {event.total_tickets_sold}
                    </td>
                    <td className="right reports-page-table-revenue">
                      €{event.total_revenue}
                    </td>
                    <td className="right">
                      €{event.ticket_price || 0}
                    </td>
                    <td className="right">
                      <span className={`reports-page-table-badge ${
                        (event.sales_percentage || 0) >= 75 ? 'high' : 
                        (event.sales_percentage || 0) >= 50 ? 'medium' : 'low'
                      }`}>
                        {event.sales_percentage || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="reports-page-no-data">
          <h3 className="reports-page-no-data-title">No Sales Data</h3>
          <p className="reports-page-no-data-text">No sales data found for the selected period.</p>
        </div>
      )}
    </div>
  );
}