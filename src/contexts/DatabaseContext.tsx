import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type DatabaseType = 'firestore' | 'mongodb';

interface DatabaseContextType {
  activeDB: DatabaseType;
  setActiveDB: (db: DatabaseType) => void;
  switchDatabase: (db: DatabaseType) => Promise<boolean>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Check if MongoDB backend is available
const checkMongoDBAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:5000/api/students', {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch (error) {
    console.log('MongoDB backend not available, defaulting to Firestore');
    return false;
  }
};

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  // Always default to firestore initially
  const [activeDB, setActiveDBState] = useState<DatabaseType>('firestore');
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check MongoDB availability on mount and restore preference if available
  useEffect(() => {
    const initializeDatabase = async () => {
      const savedDB = localStorage.getItem('activeDatabase') as DatabaseType;
      
      // If saved preference was MongoDB, check if backend is available
      if (savedDB === 'mongodb') {
        const isMongoAvailable = await checkMongoDBAvailability();
        
        if (isMongoAvailable) {
          setActiveDBState('mongodb');
        } else {
          // Reset to firestore if MongoDB not available
          setActiveDBState('firestore');
          localStorage.setItem('activeDatabase', 'firestore');
        }
      } else {
        // Default to firestore
        setActiveDBState('firestore');
        localStorage.setItem('activeDatabase', 'firestore');
      }
      
      setInitialCheckDone(true);
    };

    initializeDatabase();
  }, []);

  // Save to localStorage whenever it changes (after initial check)
  useEffect(() => {
    if (initialCheckDone) {
      localStorage.setItem('activeDatabase', activeDB);
    }
  }, [activeDB, initialCheckDone]);

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
