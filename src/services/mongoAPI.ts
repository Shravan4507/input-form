// MongoDB API Service
// All API calls to the Express backend

const API_BASE_URL = 'http://localhost:5000/api';

// Student Interface matching MongoDB schema
export interface MongoStudent {
  _id?: string;
  fullName: string;
  rollNo: string;
  zprn: string;
  branch: string;
  year: string;
  division: string;
  email: string;
  phoneNo: string;
  address: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// API Response Interface
interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// ========== STUDENT API CALLS ==========

/**
 * Add a new student to MongoDB
 */
export const addStudent = async (studentData: Omit<MongoStudent, '_id' | 'createdAt' | 'updatedAt'>): Promise<APIResponse<MongoStudent>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

/**
 * Get all students from MongoDB
 */
export const getAllStudents = async (): Promise<APIResponse<MongoStudent[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (id: string): Promise<APIResponse<MongoStudent>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
};

/**
 * Update student in MongoDB
 */
export const updateStudent = async (id: string, studentData: Partial<MongoStudent>): Promise<APIResponse<MongoStudent>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(studentData),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

/**
 * Delete student from MongoDB
 */
export const deleteStudent = async (id: string): Promise<APIResponse<void>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};

/**
 * Bulk delete students from MongoDB
 */
export const bulkDeleteStudents = async (ids: string[]): Promise<APIResponse<{ deletedCount: number }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error bulk deleting students:', error);
    throw error;
  }
};

/**
 * Get statistics from MongoDB
 */
export const getStatistics = async (): Promise<APIResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/students/stats`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
};

// ========== ADMIN API CALLS ==========

/**
 * Admin login with MongoDB backend
 */
export const adminLogin = async (email: string, password: string): Promise<APIResponse<{ email: string }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Check if MongoDB backend is reachable
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    return response.ok;
  } catch (error) {
    console.error('Backend is not reachable:', error);
    return false;
  }
};

/**
 * Convert Firestore student format to MongoDB format
 */
export const firestoreToMongo = (firestoreStudent: any): MongoStudent => {
  return {
    fullName: firestoreStudent.fullName,
    rollNo: firestoreStudent.rollNo,
    zprn: firestoreStudent.zprn,
    branch: firestoreStudent.branch,
    year: firestoreStudent.year,
    division: firestoreStudent.division,
    email: firestoreStudent.email,
    phoneNo: firestoreStudent.phoneNo,
    address: firestoreStudent.address,
  };
};

/**
 * Convert MongoDB student format to Firestore format
 */
export const mongoToFirestore = (mongoStudent: MongoStudent): any => {
  return {
    id: mongoStudent._id,
    fullName: mongoStudent.fullName,
    rollNo: mongoStudent.rollNo,
    zprn: mongoStudent.zprn,
    branch: mongoStudent.branch,
    year: mongoStudent.year,
    division: mongoStudent.division,
    email: mongoStudent.email,
    phoneNo: mongoStudent.phoneNo,
    address: mongoStudent.address,
    createdAt: mongoStudent.createdAt,
  };
};
