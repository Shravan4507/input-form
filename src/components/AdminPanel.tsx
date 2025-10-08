import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useDatabase } from '../contexts/DatabaseContext';
import * as mongoAPI from '../services/mongoAPI';
import type { StudentFormData } from '../types/student';
import AnimatedBackground from './AnimatedBackground';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import './AdminPanel.css';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AdminPanelProps {
  onLogout: () => void;
}

type SortField = 'firstName' | 'surname' | 'email' | 'branch' | 'year' | 'division' | 'rollNumber';
type SortOrder = 'asc' | 'desc';

const AdminPanel = ({ onLogout }: AdminPanelProps) => {
  const { activeDB, switchDatabase } = useDatabase();
  
  const [students, setStudents] = useState<(StudentFormData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byBranch: {} as Record<string, number>,
    byYear: {} as Record<string, number>
  });

  // Phase 1: Search, Filter, Sort, Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [sortField, setSortField] = useState<SortField>('firstName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Phase 2: Bulk selection, Edit, Delete, Modal states
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<StudentFormData | null>(null);
  const [viewingStudent, setViewingStudent] = useState<(StudentFormData & { id: string }) | null>(null);

  // Phase 3: Advanced Export and Charts
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'firstName', 'middleName', 'surname', 'contactNumber', 'email', 
    'branch', 'year', 'division', 'rollNumber', 'zprnNumber'
  ]);
  const [showChartsModal, setShowChartsModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [activeDB]); // Refetch when database changes

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (activeDB === 'firestore') {
        // Fetch from Firestore
        const q = query(collection(db, 'students'), orderBy('submittedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const studentsData: (StudentFormData & { id: string })[] = [];
        querySnapshot.forEach((doc) => {
          studentsData.push({ id: doc.id, ...doc.data() } as StudentFormData & { id: string });
        });

        setStudents(studentsData);
        calculateStats(studentsData);
      } else {
        // Fetch from MongoDB
        const response = await mongoAPI.getAllStudents();
        if (response.success && response.data) {
          // Convert MongoDB format to match Firestore format
          const studentsData = response.data.map(student => ({
            id: student._id || '',
            firstName: student.fullName.split(' ')[0] || '',
            middleName: student.fullName.split(' ')[1] || '',
            surname: student.fullName.split(' ').slice(2).join(' ') || '',
            rollNumber: student.rollNo,
            zprnNumber: student.zprn,
            branch: student.branch,
            year: student.year,
            division: student.division,
            email: student.email,
            contactNumber: student.phoneNo,
            submittedAt: student.createdAt
          })) as (StudentFormData & { id: string })[];
          
          setStudents(studentsData);
          calculateStats(studentsData);
        }
      }
    } catch (error) {
      console.error(`Error fetching students from ${activeDB}:`, error);
      alert(`Failed to fetch student data from ${activeDB.toUpperCase()}. Please try again.`);
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

  // Phase 3: Enhanced Statistics
  const enhancedStats = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    const recentSubmissions = {
      last24h: 0,
      last7days: 0
    };

    const byDivision: Record<string, number> = {};
    const emailDomains: Record<string, number> = {};
    const submissionsByDate: Record<string, number> = {};

    students.forEach(student => {
      // Count recent submissions
      if (student.submittedAt) {
        const submittedTime = (student.submittedAt as any).seconds 
          ? (student.submittedAt as any).seconds * 1000 
          : new Date(student.submittedAt as any).getTime();
        
        if (submittedTime > oneDayAgo) recentSubmissions.last24h++;
        if (submittedTime > sevenDaysAgo) recentSubmissions.last7days++;

        // Group by date for timeline
        const date = new Date(submittedTime).toLocaleDateString();
        submissionsByDate[date] = (submissionsByDate[date] || 0) + 1;
      }

      // Count by division
      if (student.division) {
        const div = student.division.toUpperCase();
        byDivision[div] = (byDivision[div] || 0) + 1;
      }

      // Count email domains
      if (student.email) {
        const domain = student.email.split('@')[1] || 'unknown';
        emailDomains[domain] = (emailDomains[domain] || 0) + 1;
      }
    });

    return {
      recentSubmissions,
      byDivision,
      emailDomains,
      submissionsByDate
    };
  }, [students]);

  // Phase 2: Delete Student
  const handleDeleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this student record?')) {
      return;
    }

    try {
      if (activeDB === 'firestore') {
        await deleteDoc(doc(db, 'students', id));
      } else {
        await mongoAPI.deleteStudent(id);
      }
      await fetchStudents(); // Refresh the list
      setSelectedStudents(new Set()); // Clear selections
      alert(`Student deleted successfully from ${activeDB.toUpperCase()}!`);
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  // Phase 2: Bulk Delete Students
  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) {
      alert('Please select students to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedStudents.size} student(s)?`)) {
      return;
    }

    try {
      const idsArray = Array.from(selectedStudents);
      
      if (activeDB === 'firestore') {
        const deletePromises = idsArray.map(id =>
          deleteDoc(doc(db, 'students', id))
        );
        await Promise.all(deletePromises);
      } else {
        await mongoAPI.bulkDeleteStudents(idsArray);
      }
      
      await fetchStudents();
      setSelectedStudents(new Set());
      alert(`${idsArray.length} student(s) deleted successfully from ${activeDB.toUpperCase()}!`);
    } catch (error) {
      console.error('Error deleting students:', error);
      alert('Failed to delete some students. Please try again.');
    }
  };

  // Phase 2: Start editing a student
  const handleStartEdit = (student: StudentFormData & { id: string }) => {
    setEditingId(student.id);
    setEditFormData(student);
  };

  // Phase 2: Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  // Phase 2: Save edited student
  const handleSaveEdit = async () => {
    if (!editingId || !editFormData) return;

    try {
      if (activeDB === 'firestore') {
        const studentRef = doc(db, 'students', editingId);
        await updateDoc(studentRef, editFormData as any);
      } else {
        // Convert to MongoDB format
        const mongoStudent = {
          fullName: `${editFormData.firstName} ${editFormData.middleName} ${editFormData.surname}`.trim(),
          rollNo: editFormData.rollNumber,
          zprn: editFormData.zprnNumber,
          branch: editFormData.branch,
          year: editFormData.year,
          division: editFormData.division,
          email: editFormData.email,
          phoneNo: editFormData.contactNumber,
          address: '' // Can be enhanced later
        };
        await mongoAPI.updateStudent(editingId, mongoStudent);
      }
      
      await fetchStudents();
      setEditingId(null);
      setEditFormData(null);
      alert(`Student updated successfully in ${activeDB.toUpperCase()}!`);
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student. Please try again.');
    }
  };

  // Phase 2: Handle checkbox selection
  const handleSelectStudent = (id: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  // Phase 2: Select/Deselect all on current page
  const handleSelectAll = () => {
    if (selectedStudents.size === paginatedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(paginatedStudents.map(s => s.id)));
    }
  };

  // Phase 1: Filter, Sort, and Paginate students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(query) ||
        student.surname.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query) ||
        student.zprnNumber.toLowerCase().includes(query) ||
        (student.middleName && student.middleName.toLowerCase().includes(query))
      );
    }

    // Apply branch filter
    if (filterBranch) {
      filtered = filtered.filter(student => student.branch === filterBranch);
    }

    // Apply year filter
    if (filterYear) {
      filtered = filtered.filter(student => student.year === filterYear);
    }

    // Apply division filter
    if (filterDivision) {
      filtered = filtered.filter(student => student.division.toUpperCase() === filterDivision.toUpperCase());
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField]?.toString().toLowerCase() || '';
      const bValue = b[sortField]?.toString().toLowerCase() || '';
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [students, searchQuery, filterBranch, filterYear, filterDivision, sortField, sortOrder]);

  // Get unique values for filter dropdowns
  const uniqueBranches = useMemo(() => 
    [...new Set(students.map(s => s.branch))].sort(), 
    [students]
  );
  
  const uniqueYears = useMemo(() => 
    [...new Set(students.map(s => s.year))].sort(), 
    [students]
  );

  const uniqueDivisions = useMemo(() => 
    [...new Set(students.map(s => s.division.toUpperCase()))].sort(), 
    [students]
  );

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / itemsPerPage);
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedStudents, currentPage, itemsPerPage]);

  // Handle sorting when column header is clicked
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBranch, filterYear, filterDivision]);

  const exportToCSV = () => {
    // Export filtered results instead of all students
    const dataToExport = filteredAndSortedStudents;
    
    if (dataToExport.length === 0) {
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
      ...dataToExport.map(student => [
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

  // Phase 3: Export to Excel
  const exportToExcel = () => {
    const dataToExport = filteredAndSortedStudents;
    
    if (dataToExport.length === 0) {
      alert('No data to export!');
      return;
    }

    const columnMapping: Record<string, keyof StudentFormData> = {
      'firstName': 'firstName',
      'middleName': 'middleName',
      'surname': 'surname',
      'contactNumber': 'contactNumber',
      'email': 'email',
      'branch': 'branch',
      'year': 'year',
      'division': 'division',
      'rollNumber': 'rollNumber',
      'zprnNumber': 'zprnNumber'
    };

    const worksheetData = [
      // Headers
      selectedColumns.map(col => {
        const labels: Record<string, string> = {
          firstName: 'First Name',
          middleName: 'Middle Name',
          surname: 'Surname',
          contactNumber: 'Contact Number',
          email: 'Email',
          branch: 'Branch',
          year: 'Year',
          division: 'Division',
          rollNumber: 'Roll Number',
          zprnNumber: 'ZPRN Number'
        };
        return labels[col] || col;
      }),
      // Data rows
      ...dataToExport.map(student =>
        selectedColumns.map(col => {
          const key = columnMapping[col];
          return student[key] || '';
        })
      )
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

    XLSX.writeFile(workbook, `students_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Phase 3: Advanced Export Handler
  const handleAdvancedExport = () => {
    if (exportFormat === 'csv') {
      exportToCSV();
    } else {
      exportToExcel();
    }
    setShowExportModal(false);
  };

  // Phase 3: Toggle Column Selection
  const toggleColumn = (column: string) => {
    if (selectedColumns.includes(column)) {
      setSelectedColumns(selectedColumns.filter(c => c !== column));
    } else {
      setSelectedColumns([...selectedColumns, column]);
    }
  };

  return (
    <div className="admin-panel">
      <AnimatedBackground />
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <div className="database-selector">
            <span className="db-label">Database:</span>
            <button
              className={`db-toggle-btn ${activeDB === 'firestore' ? 'active' : ''}`}
              onClick={() => switchDatabase('firestore')}
              disabled={activeDB === 'firestore'}
            >
              🔥 Firestore
            </button>
            <button
              className={`db-toggle-btn ${activeDB === 'mongodb' ? 'active' : ''}`}
              onClick={() => switchDatabase('mongodb')}
              disabled={activeDB === 'mongodb'}
            >
              🍃 MongoDB
            </button>
          </div>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
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

            {/* Phase 3: New Statistics Cards */}
            <div className="stat-card">
              <h3>Recent Submissions</h3>
              <div className="stat-details">
                <div className="stat-item">
                  <span>Last 24 hours:</span>
                  <span className="count">{enhancedStats.recentSubmissions.last24h}</span>
                </div>
                <div className="stat-item">
                  <span>Last 7 days:</span>
                  <span className="count">{enhancedStats.recentSubmissions.last7days}</span>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3>Divisions</h3>
              <div className="stat-details">
                {Object.entries(enhancedStats.byDivision).map(([division, count]) => (
                  <div key={division} className="stat-item">
                    <span>Division {division}:</span>
                    <span className="count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <h3>Email Domains</h3>
              <div className="stat-details">
                {Object.entries(enhancedStats.emailDomains)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([domain, count]) => (
                    <div key={domain} className="stat-item">
                      <span>{domain}:</span>
                      <span className="count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          <section className="export-section">
            <h2>Export Data</h2>
            <div className="export-buttons-group">
              <button onClick={exportToCSV} className="export-button">
                📥 Quick Export (CSV)
              </button>
              <button onClick={() => setShowExportModal(true)} className="export-button">
                ⚙️ Advanced Export
              </button>
              <button onClick={() => setShowChartsModal(true)} className="export-button">
                📊 View Charts
              </button>
            </div>
          </section>

          <section className="students-table-section">
            <div className="table-header">
              <h2>Student Records ({filteredAndSortedStudents.length})</h2>
            </div>

            {/* Phase 1: Search and Filter Controls */}
            <div className="search-filter-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search by name, email, roll no, or ZPRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Branches</option>
                  {uniqueBranches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Years</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Divisions</option>
                  {uniqueDivisions.map(division => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>

                {(searchQuery || filterBranch || filterYear || filterDivision) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterBranch('');
                      setFilterYear('');
                      setFilterDivision('');
                    }}
                    className="clear-filters-button"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Phase 2: Bulk Actions Bar */}
            {selectedStudents.size > 0 && (
              <div className="bulk-actions-bar">
                <span className="bulk-selected-count">
                  {selectedStudents.size} student(s) selected
                </span>
                <button onClick={handleBulkDelete} className="bulk-delete-button">
                  × Delete Selected
                </button>
              </div>
            )}

            <div className="table-wrapper">
              <table className="students-table">
                <thead>
                  <tr>
                    <th className="checkbox-column">
                      <input
                        type="checkbox"
                        checked={paginatedStudents.length > 0 && selectedStudents.size === paginatedStudents.length}
                        onChange={handleSelectAll}
                        className="student-checkbox"
                      />
                    </th>
                    <th onClick={() => handleSort('firstName')} className="sortable">
                      First Name {sortField === 'firstName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Middle Name</th>
                    <th onClick={() => handleSort('surname')} className="sortable">
                      Surname {sortField === 'surname' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Contact</th>
                    <th onClick={() => handleSort('email')} className="sortable">
                      Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('branch')} className="sortable">
                      Branch {sortField === 'branch' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('year')} className="sortable">
                      Year {sortField === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('division')} className="sortable">
                      Division {sortField === 'division' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSort('rollNumber')} className="sortable">
                      Roll No {sortField === 'rollNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>ZPRN No</th>
                    <th className="actions-column">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className={editingId === student.id ? 'editing-row' : ''}>
                        <td className="checkbox-column">
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.id)}
                            onChange={() => handleSelectStudent(student.id)}
                            className="student-checkbox"
                          />
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.firstName || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, firstName: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.firstName}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.middleName || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, middleName: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (student.middleName || '-')}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.surname || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, surname: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.surname}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.contactNumber || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, contactNumber: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.contactNumber}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="email"
                              value={editFormData?.email || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, email: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.email}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <select
                              value={editFormData?.branch || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, branch: e.target.value as any} : null)}
                              className="edit-select"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {uniqueBranches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                          ) : student.branch}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <select
                              value={editFormData?.year || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, year: e.target.value as any} : null)}
                              className="edit-select"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {uniqueYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          ) : student.year}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.division || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, division: e.target.value.toUpperCase()} : null)}
                              className="edit-input"
                              maxLength={1}
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.division}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.rollNumber || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, rollNumber: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.rollNumber}
                        </td>
                        <td onClick={() => setViewingStudent(student)} className="clickable-cell">
                          {editingId === student.id ? (
                            <input
                              type="text"
                              value={editFormData?.zprnNumber || ''}
                              onChange={(e) => setEditFormData(prev => prev ? {...prev, zprnNumber: e.target.value} : null)}
                              className="edit-input"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : student.zprnNumber}
                        </td>
                        <td className="actions-column">
                          {editingId === student.id ? (
                            <div className="action-buttons">
                              <button onClick={handleSaveEdit} className="save-button" title="Save">
                                ✓
                              </button>
                              <button onClick={handleCancelEdit} className="cancel-button" title="Cancel">
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="action-buttons">
                              <button onClick={() => handleStartEdit(student)} className="edit-button" title="Edit">
                                ✏
                              </button>
                              <button onClick={() => handleDeleteStudent(student.id)} className="delete-button" title="Delete">
                                ×
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="no-results">
                        No students found matching your filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Phase 1: Pagination Controls */}
            {filteredAndSortedStudents.length > 0 && (
              <div className="pagination-controls">
                <div className="pagination-info">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedStudents.length)} of {filteredAndSortedStudents.length} students
                </div>
                
                <div className="pagination-buttons">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    ⟨⟨
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                  >
                    ⟨
                  </button>
                  
                  <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    ⟩
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                  >
                    ⟩⟩
                  </button>
                </div>

                <div className="items-per-page">
                  <label>Per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="items-select"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* Phase 2: Student Details Modal */}
      {viewingStudent && (
        <div className="modal-overlay" onClick={() => setViewingStudent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Details</h2>
              <button onClick={() => setViewingStudent(null)} className="modal-close">✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Full Name:</strong>
                <span>{viewingStudent.firstName} {viewingStudent.middleName || ''} {viewingStudent.surname}</span>
              </div>
              <div className="detail-row">
                <strong>Contact Number:</strong>
                <span className="copyable" onClick={() => navigator.clipboard.writeText(viewingStudent.contactNumber)}>
                  📞 {viewingStudent.contactNumber}
                </span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span className="copyable" onClick={() => navigator.clipboard.writeText(viewingStudent.email)}>
                  📧 {viewingStudent.email}
                </span>
              </div>
              <div className="detail-row">
                <strong>Branch:</strong>
                <span>{viewingStudent.branch}</span>
              </div>
              <div className="detail-row">
                <strong>Year:</strong>
                <span>{viewingStudent.year}</span>
              </div>
              <div className="detail-row">
                <strong>Division:</strong>
                <span>{viewingStudent.division}</span>
              </div>
              <div className="detail-row">
                <strong>Roll Number:</strong>
                <span>{viewingStudent.rollNumber}</span>
              </div>
              <div className="detail-row">
                <strong>ZPRN Number:</strong>
                <span>{viewingStudent.zprnNumber}</span>
              </div>
              {viewingStudent.submittedAt && (
                <div className="detail-row">
                  <strong>Submitted At:</strong>
                  <span>{new Date(viewingStudent.submittedAt as any).toLocaleString()}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => handleStartEdit(viewingStudent)} className="modal-edit-button">
                ✏ Edit Student
              </button>
              <button onClick={() => {
                setViewingStudent(null);
                handleDeleteStudent(viewingStudent.id);
              }} className="modal-delete-button">
                × Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content export-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Advanced Export</h2>
              <button className="modal-close" onClick={() => setShowExportModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="export-format-section">
                <h3>Export Format</h3>
                <div className="format-options">
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                    />
                    <span>📄 CSV (Comma Separated)</span>
                  </label>
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                    />
                    <span>📗 Excel (XLSX)</span>
                  </label>
                </div>
              </div>
              
              <div className="export-columns-section">
                <h3>Select Columns</h3>
                <div className="columns-grid">
                  {[
                    { key: 'fullName', label: 'Full Name' },
                    { key: 'rollNo', label: 'Roll Number' },
                    { key: 'zprn', label: 'ZPRN' },
                    { key: 'branch', label: 'Branch' },
                    { key: 'year', label: 'Year' },
                    { key: 'division', label: 'Division' },
                    { key: 'email', label: 'Email' },
                    { key: 'phoneNo', label: 'Phone Number' },
                    { key: 'address', label: 'Address' },
                    { key: 'createdAt', label: 'Submission Date' }
                  ].map((col) => (
                    <label key={col.key} className="column-option">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowExportModal(false)} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleAdvancedExport} className="export-confirm-button">
                📥 Export {selectedColumns.length} Columns
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Modal */}
      {showChartsModal && (
        <div className="modal-overlay" onClick={() => setShowChartsModal(false)}>
          <div className="modal-content charts-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Data Analytics</h2>
              <button className="modal-close" onClick={() => setShowChartsModal(false)}>×</button>
            </div>
            <div className="modal-body charts-body">
              <div className="chart-container">
                <h3>Branch Distribution</h3>
                <Pie
                  data={{
                    labels: Object.keys(enhancedStats.byDivision),
                    datasets: [{
                      label: 'Students by Division',
                      data: Object.values(enhancedStats.byDivision),
                      backgroundColor: [
                        'rgba(0, 245, 255, 0.7)',
                        'rgba(138, 43, 226, 0.7)',
                        'rgba(255, 20, 147, 0.7)',
                        'rgba(50, 205, 50, 0.7)',
                        'rgba(255, 165, 0, 0.7)',
                        'rgba(255, 215, 0, 0.7)',
                      ],
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#fff', font: { size: 12 } }
                      }
                    }
                  }}
                />
              </div>

              <div className="chart-container">
                <h3>Year-wise Distribution</h3>
                <Bar
                  data={{
                    labels: ['FY', 'SY', 'TY', 'Final Year'],
                    datasets: [{
                      label: 'Students Count',
                      data: [
                        students.filter(s => s.year === 'FY').length,
                        students.filter(s => s.year === 'SY').length,
                        students.filter(s => s.year === 'TY').length,
                        students.filter(s => s.year === 'Final Year').length
                      ],
                      backgroundColor: 'rgba(0, 245, 255, 0.7)',
                      borderColor: 'rgba(0, 245, 255, 1)',
                      borderWidth: 2
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#fff', stepSize: 1 },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      },
                      x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      }
                    }
                  }}
                />
              </div>

              <div className="chart-container">
                <h3>Submission Timeline</h3>
                <Line
                  data={{
                    labels: Object.keys(enhancedStats.submissionsByDate).sort(),
                    datasets: [{
                      label: 'Daily Submissions',
                      data: Object.keys(enhancedStats.submissionsByDate).sort().map(date => enhancedStats.submissionsByDate[date]),
                      borderColor: 'rgba(138, 43, 226, 1)',
                      backgroundColor: 'rgba(138, 43, 226, 0.2)',
                      borderWidth: 3,
                      tension: 0.4,
                      fill: true
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        labels: { color: '#fff' }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#fff', stepSize: 1 },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      },
                      x: {
                        ticks: { color: '#fff', maxRotation: 45, minRotation: 45 },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                      }
                    }
                  }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowChartsModal(false)} className="close-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
