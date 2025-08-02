/**
 * DashboardContext.js
 *
 * React Context for providing dashboard state and handlers to all child components,
 * eliminating prop drilling by making dashboard data accessible throughout the component tree.
 */
import React, { createContext, useContext } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children, dashboardState, handlers, user }) => {
  const value = {
    ...dashboardState,
    ...handlers,
    user,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};
