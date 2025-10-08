export interface StudentFormData {
  firstName: string;
  middleName?: string;
  surname: string;
  contactNumber: string;
  email: string;
  branch: 'Computer' | 'IT' | 'Mechanical' | 'Electrical' | 'Electronics' | 'Civil' | '';
  year: 'FY' | 'SY' | 'TY' | 'Final Year' | '';
  division: string;
  rollNumber: string;
  zprnNumber: string;
  submittedAt?: Date;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
