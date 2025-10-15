export interface StudentFormData {
  firstName: string;
  middleName?: string;
  surname: string;
  contactNumber: string;
  email: string;
  branch: 'Computer' | 'IT' | 'Mechanical' | 'Electrical' | 'Electronics' | 'Civil' | 'AI ML' | 'AI DS' | 'Other' | '';
  customBranch?: string; // For when "Other" is selected
  year: 'FY' | 'SY' | 'TY' | 'Final Year' | '';
  division: string;
  rollNumber: string;
  zprnNumber: string;
  // Optional extra fields (non-mandatory)
  team?: 'Technial' | 'Documentaion' | 'Social Media & Editing' | 'Design & Innovation' | 'Public Relations & Outreach' | 'Management & Operations' | '';
  position?: 'President' | 'Chairman' | 'Treasurer' | 'Co - Treasurer' | 'Secretary' | 'Member' | '';
  nameToDisplay?: string;
  imageDriveLink?: string;
  socialMedia?: string;
  submittedAt?: Date;
}

export interface AdminCredentials {
  username: string;
  password: string;
}
