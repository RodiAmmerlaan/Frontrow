import React from 'react';

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

interface UserAnalyticsTabProps {
  userPurchaseData: UserPurchaseReportResponse;
  onDownloadCSV: () => void;
  onDownloadJSON: () => void;
}

export function UserAnalyticsTab({ userPurchaseData, onDownloadCSV, onDownloadJSON }: UserAnalyticsTabProps) {
  const getOrderCountClass = (totalOrders: number) => {
    if (totalOrders >= 5) return 'reports-page-user-order-count-high';
    if (totalOrders >= 2) return 'reports-page-user-order-count-medium';
    return 'reports-page-user-order-count-low';
  };

  const getEventsAttendedClass = (eventsAttended: number) => {
    if (eventsAttended >= 3) return 'reports-page-user-events-attended-high';
    return 'reports-page-user-events-attended-low';
  };

  const getRowClass = (index: number) => {
    return index % 2 === 0 ? 'reports-page-user-table-row-even' : 'reports-page-user-table-row-odd';
  };

  return (
    <div>
      <div className="reports-page-user-stats">
        <h3 className="reports-page-summary-title">User Purchase Summary - {userPurchaseData.period.description}</h3>
        <div className="reports-page-small-stats-grid">
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Total Users</div>
            <div className="reports-page-summary-value">{userPurchaseData.summary.total_users}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Total Orders</div>
            <div className="reports-page-summary-value">{userPurchaseData.summary.total_orders}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Tickets Sold</div>
            <div className="reports-page-summary-value">{userPurchaseData.summary.total_tickets_sold}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Total Revenue</div>
            <div className="reports-page-summary-value">€{userPurchaseData.summary.total_revenue}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Avg Tickets/Order</div>
            <div className="reports-page-summary-value">{userPurchaseData.summary.average_tickets_per_order}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Avg Orders/User</div>
            <div className="reports-page-summary-value">{userPurchaseData.summary.average_orders_per_user}</div>
          </div>
          <div className="reports-page-summary-item">
            <div className="reports-page-summary-label">Avg Spending/User</div>
            <div className="reports-page-summary-value">€{userPurchaseData.summary.average_spending_per_user}</div>
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

      {userPurchaseData.frequent_buyers.length > 0 && (
        <div className="reports-page-frequent-buyers">
          <div className="reports-page-table-header">
            <h3 className="reports-page-table-title">Top 10 Frequent Buyers</h3>
          </div>
          <div className="reports-page-table-scroll">
            <table className="reports-page-table">
              <thead>
                <tr className="reports-page-header-row">
                  <th className="reports-page-user-table-header">Rank</th>
                  <th className="reports-page-user-table-header">User</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Orders</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Tickets</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {userPurchaseData.frequent_buyers.map((buyer) => (
                  <tr key={buyer.user_id} className={buyer.rank <= 3 ? 'reports-page-user-table-row-even' : 'reports-page-user-table-row-odd'}>
                    <td className="reports-page-user-table-cell" style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ color: '#2c3e50', fontWeight: 'bold', fontSize: '1.1rem' }}>#{buyer.rank}</span>
                        {buyer.rank <= 3 && (
                          <span style={{ fontSize: '18px', filter: 'grayscale(0)' }}>
                            {buyer.rank === 1 ? '🥇' : buyer.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="reports-page-user-table-cell">
                      <div>
                        <div className="reports-page-user-name">{buyer.user_name}</div>
                        <div className="reports-page-user-email">{buyer.user_email}</div>
                      </div>
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right">
                      <span className={getOrderCountClass(buyer.total_orders)}>
                        {buyer.total_orders}
                      </span>
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right reports-page-user-ticket-count">
                      {buyer.total_tickets_purchased}
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right reports-page-user-total-spent">
                      €{buyer.total_spent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {userPurchaseData.user_stats.length > 0 ? (
        <div className="reports-page-user-stats">
          <div className="reports-page-table-header">
            <h3 className="reports-page-table-title">User Purchase Statistics</h3>
          </div>
          <div className="reports-page-table-scroll">
            <table className="reports-page-table">
              <thead>
                <tr className="reports-page-header-row">
                  <th className="reports-page-user-table-header">User</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Orders</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Total Tickets</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Avg Tickets/Order</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Events Attended</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-right">Total Spent</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-left">First Purchase</th>
                  <th className="reports-page-user-table-header reports-page-user-table-header-left">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {userPurchaseData.user_stats.map((user, index) => (
                  <tr key={user.user_id} className={getRowClass(index)}>
                    <td className="reports-page-user-table-cell">
                      <div>
                        <div className="reports-page-user-name">{user.user_name}</div>
                        <div className="reports-page-user-email">{user.user_email}</div>
                      </div>
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right">
                      <span className={getOrderCountClass(user.total_orders)}>
                        {user.total_orders}
                      </span>
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right reports-page-user-ticket-count">
                      {user.total_tickets_purchased}
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right reports-page-user-ticket-avg">
                      {user.average_tickets_per_order}
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right">
                      <span className={getEventsAttendedClass(user.events_attended)}>
                        {user.events_attended}
                      </span>
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-right reports-page-user-total-spent">
                      €{user.total_spent}
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-left reports-page-user-date">
                      {user.first_purchase_date ? new Date(user.first_purchase_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="reports-page-user-table-cell reports-page-user-table-cell-left reports-page-user-date">
                      {user.last_purchase_date ? new Date(user.last_purchase_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="reports-page-no-user-data">
          <h3 className="reports-page-no-user-data-title">No User Purchase Data</h3>
          <p className="reports-page-no-user-data-text">No user purchase data found for the selected period.</p>
        </div>
      )}
    </div>
  );
}
