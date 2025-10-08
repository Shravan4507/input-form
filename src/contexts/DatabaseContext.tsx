import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type DatabaseType = 'firestore' | 'mongodb';

interface DatabaseContextType {
  activeDB: DatabaseType;
  setActiveDB: (db: DatabaseType) => void;
  switchDatabase: (db: DatabaseType) => Promise<boolean>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  // Load from localStorage or default to firestore
  const [activeDB, setActiveDBState] = useState<DatabaseType>(() => {
    const saved = localStorage.getItem('activeDatabase');
    return (saved as DatabaseType) || 'firestore';
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeDatabase', activeDB);
  }, [activeDB]);

  const setActiveDB = (db: DatabaseType) => {
    setActiveDBState(db);
  };

  const switchDatabase = async (db: DatabaseType): Promise<boolean> => {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        `Switch to ${db.toUpperCase()}?\n\n` +
        `All future operations will use the ${db} database.\n` +
        `Current data will remain unchanged.`
      );
      
      if (confirmed) {
        setActiveDB(db);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  return (
    <DatabaseContext.Provider value={{ activeDB, setActiveDB, switchDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};
