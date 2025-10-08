import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { StudentFormData } from '../types/student';
import AnimatedBackground from './AnimatedBackground';
import './AdminPanel.css';

interface AdminPanelProps {
  onLogout: () => void;
}

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const [students, setStudents] = useState<(StudentFormData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byBranch: {} as Record<string, number>,
    byYear: {} as Record<string, number>
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'students'), orderBy('submittedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const studentsData: (StudentFormData & { id: string })[] = [];
      querySnapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as StudentFormData & { id: string });
      });

      setStudents(studentsData);
      calculateStats(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch student data. Please check your Firebase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: StudentFormData[]) => {
    const byBranch: Record<string, number> = {};
    const byYear: Record<string, number> = {};

    data.forEach(student => {
      // Count by branch
      if (student.branch) {
        byBranch[student.branch] = (byBranch[student.branch] || 0) + 1;
      }
      // Count by year
      if (student.year) {
        byYear[student.year] = (byYear[student.year] || 0) + 1;
      }
    });

    setStats({
      total: data.length,
      byBranch,
      byYear
    });
  };

  const exportToCSV = () => {
    if (students.length === 0) {
      alert('No data to export!');
      return;
    }

    const headers = [
      'First Name',
      'Middle Name',
      'Surname',
      'Contact Number',
      'Email',
      'Branch',
      'Year',
      'Division',
      'Roll Number',
      'ZPRN Number',
      'Submitted At'
    ];

    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.firstName,
        student.middleName || '',
        student.surname,
        student.contactNumber,
        student.email,
        student.branch,
        student.year,
        student.division,
        student.rollNumber,
        student.zprnNumber,
        student.submittedAt ? new Date(student.submittedAt as any).toLocaleString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="admin-panel">
      <AnimatedBackground />
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </header>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <section className="stats-section">
            <div className="stat-card">
              <h3>Total Students</h3>
              <p className="stat-number">{stats.total}</p>
            </div>

            <div className="stat-card">
              <h3>Branches</h3>
              <div className="stat-details">
                {Object.entries(stats.byBranch).map(([branch, count]) => (
                  <div key={branch} className="stat-item">
                    <span>{branch}:</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <h3>Years</h3>
              <div className="stat-details">
                {Object.entries(stats.byYear).map(([year, count]) => (
                  <div key={year} className="stat-item">
                    <span>{year}:</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="export-section">
            <h2>Export Data</h2>
            <button onClick={exportToCSV} className="export-button">
              📥 Export to CSV
            </button>
          </section>

          <section className="students-table-section">
            <h2>Student Records</h2>
            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Middle Name</th>
                    <th>Surname</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Branch</th>
                    <th>Year</th>
                    <th>Division</th>
                    <th>Roll No</th>
                    <th>ZPRN No</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.firstName}</td>
                      <td>{student.middleName || '-'}</td>
                      <td>{student.surname}</td>
                      <td>{student.contactNumber}</td>
                      <td>{student.email}</td>
                      <td>{student.branch}</td>
                      <td>{student.year}</td>
                      <td>{student.division}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.zprnNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
