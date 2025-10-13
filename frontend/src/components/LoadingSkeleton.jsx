import React from 'react';

const LoadingSkeleton = ({ rows = 5, columns = 5 }) => {
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

export default LoadingSkeleton;
