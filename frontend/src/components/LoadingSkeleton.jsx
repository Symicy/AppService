import React from 'react';

// Table skeleton for data tables
const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {[...Array(columns)].map((_, i) => (
              <th key={i}>
                <div className="skeleton skeleton-header"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(columns)].map((_, colIndex) => (
                <td key={colIndex}>
                  <div className="skeleton skeleton-text"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Card skeleton for dashboard stats
const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="row g-3 mb-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="col-lg-4 col-md-6">
          <div className="card" style={{ background: 'rgba(30, 30, 30, 0.9)', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-header mb-2" style={{ width: '60%' }}></div>
                  <div className="skeleton skeleton-title mb-2" style={{ width: '40%', height: '2rem' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
                </div>
                <div className="skeleton skeleton-icon" style={{ width: '50px', height: '50px', borderRadius: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Chart skeleton
const ChartSkeleton = ({ height = 300 }) => {
  return (
    <div className="card" style={{ background: 'rgba(30, 30, 30, 0.9)', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
      <div className="card-body">
        <div className="skeleton skeleton-header mb-3" style={{ width: '40%' }}></div>
        <div className="skeleton" style={{ height: `${height}px`, borderRadius: '8px' }}></div>
      </div>
    </div>
  );
};

// Dashboard skeleton combining cards, charts, and table
const DashboardSkeleton = () => {
  return (
    <>
      <CardSkeleton count={3} />
      <CardSkeleton count={3} />
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <ChartSkeleton height={300} />
        </div>
        <div className="col-lg-4">
          <ChartSkeleton height={300} />
        </div>
      </div>
      <div className="card" style={{ background: 'rgba(30, 30, 30, 0.9)', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
        <div className="card-body">
          <div className="skeleton skeleton-header mb-3" style={{ width: '30%' }}></div>
          <TableSkeleton rows={5} columns={5} />
        </div>
      </div>
    </>
  );
};

// User list skeleton (full page with table)
const UserListSkeleton = () => {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="skeleton skeleton-title" style={{ width: '200px', height: '2rem' }}></div>
        <div className="skeleton" style={{ width: '150px', height: '40px', borderRadius: '8px' }}></div>
      </div>
      <div className="card" style={{ background: 'rgba(30, 30, 30, 0.9)', border: '1px solid rgba(0, 255, 255, 0.3)' }}>
        <div className="card-body">
          <TableSkeleton rows={8} columns={8} />
        </div>
      </div>
    </div>
  );
};

// Main LoadingSkeleton component - can render different types
const LoadingSkeleton = ({ type = 'table', rows = 5, columns = 5, count = 3, height = 300 }) => {
  switch (type) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'cards':
      return <CardSkeleton count={count} />;
    case 'chart':
      return <ChartSkeleton height={height} />;
    case 'userList':
      return <UserListSkeleton />;
    case 'table':
    default:
      return <TableSkeleton rows={rows} columns={columns} />;
  }
};

export default LoadingSkeleton;
export { TableSkeleton, CardSkeleton, ChartSkeleton, DashboardSkeleton, UserListSkeleton };
