'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { INITIAL_USERS } from '@/lib/mockData';

interface RoleContextType {
  currentUser: User;
  switchUser: (userIdOrRole: string) => void;
  setRole: (userIdOrRole: string) => void;
  allUsers: User[];
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default to Patient John Doe

  useEffect(() => {
    const savedUserId = localStorage.getItem('medrella_demo_user');
    if (savedUserId) {
      const found = INITIAL_USERS.find(
        u => u.id === savedUserId || u.doctorId === savedUserId || u.role === savedUserId
      );
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchUser = (userIdOrRole: string) => {
    const found = INITIAL_USERS.find(
      u =>
        u.id === userIdOrRole ||
        u.doctorId === userIdOrRole ||
        (userIdOrRole === 'doc-01' && u.doctorId === 'doc_1') ||
        (userIdOrRole === 'doc-02' && u.doctorId === 'doc_2') ||
        u.role === userIdOrRole
    );
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('medrella_demo_user', found.id);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        switchUser,
        setRole: switchUser,
        allUsers: INITIAL_USERS,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
