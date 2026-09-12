import React, { createContext, useContext, useState } from 'react';

const RoleContext = createContext();

export const ROLES = {
  OFFICER: 'Placement Officer',
  STUDENT: 'Student',
  RECRUITER: 'Recruiter',
};

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(ROLES.OFFICER);

  return (
    <RoleContext.Provider value={{ role, setRole, ROLES }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
