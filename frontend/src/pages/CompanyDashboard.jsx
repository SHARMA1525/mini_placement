import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ListOfJobs from './Listofjobs';
import '../components/styles/global.css';

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = React.useCallback(async () => {
        try {
            // Don't set loading to true on refresh to avoid flickering if already loaded once
            // But for initial load we want it.
            if (!companyData) setLoading(true);

            const token = localStorage.getItem('companyToken');

            if (!token) {
                setError('Please login to access dashboard');
                setLoading(false);
                return;
            }

            // 1. Fetch Company Profile
            const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/company/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const profileData = await profileResponse.json();
            setCompanyData(profileData);

            // 2. Fetch Jobs separately
            const jobsResponse = await fetch(`${import.meta.env.VITE_API_URL}/company/dashboard/job`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            let jobs = [];
            if (jobsResponse.ok) {
                const jobsData = await jobsResponse.json();
                jobs = Array.isArray(jobsData.data) ? jobsData.data : [];
            }

            if (profileData && profileData.company) {
                setCompanyData({
                    ...profileData.company,
                    jobsPosted: jobs
                });
            } else {
                throw new Error('Invalid company data received');
            }


            setLoading(false);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            setError(err.message);
            setLoading(false);
        }
    }, []); // Empty dependency array as it doesn't depend on props or state

    const handleProfileClick = () => {
        navigate(`/company/profile`);
    };

    const handleAddJob = () => {
        navigate('/dashboard/job/new');
    };

    const handleLogout = () => {
        localStorage.removeItem('companyToken');
        navigate('/');
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.loadingText}>Loading dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorText}>{error}</div>
                <button style={styles.retryButton} onClick={fetchDashboardData}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header with Profile Button */}
            <div style={styles.header}>
                <div style={styles.logo} onClick={() => navigate('/')}>PlacementHub</div>
                <button style={{ ...styles.profileButton, marginLeft: 'auto', marginRight: '8px', backgroundColor: '#f6f3f3ff', transition: 'opacity 0.2s' }} onClick={handleLogout}>
                    Log Out
                </button>
                <button style={styles.profileButton} onClick={handleProfileClick}>
                    Company Profile
                </button>
            </div>

            {/* Welcome Section */}
            <div style={styles.welcomeSection}>
                <h1 style={styles.welcomeTitle}>Welcome, {companyData?.name}!</h1>
                <p style={styles.welcomeSubtitle}>
                    Manage your job postings and company profile
                </p>
            </div>

            {/* Dashboard Content */}
            <div style={styles.content}>
                {/* Active Jobs Section */}
                <div style={styles.jobsSection}>
                    <div style={styles.sectionHeader}>
                        <h2 style={styles.sectionTitle}>Active Jobs</h2>
                        <button style={styles.addJobButton} onClick={handleAddJob}>
                            + Add Job
                        </button>
                    </div>

                    <ListOfJobs
                        jobs={companyData?.jobsPosted}
                        onRefresh={fetchDashboardData}
                    />
                </div>

                {/* Company Info Card */}
                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>Company Information</h3>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Industry</span>
                            <span style={styles.infoValue}>{companyData?.industry || 'N/A'}</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Location</span>
                            <span style={styles.infoValue}>{companyData?.location || 'N/A'}</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Type</span>
                            <span style={styles.infoValue}>{companyData?.companyType || 'N/A'}</span>
                        </div>
                        <div style={styles.infoItem}>
                            <span style={styles.infoLabel}>Email</span>
                            <span style={styles.infoValue}>{companyData?.email || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem 3rem',
        borderBottom: '1px solid #333333',
        justifyContent: 'flex-start',
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    profileButton: {
        backgroundColor: '#f9f6f6ff',
        color: '#000000',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    welcomeSection: {
        padding: '4rem 3rem 2rem',
        textAlign: 'center',
    },
    welcomeTitle: {
        fontSize: '3rem',
        fontWeight: '700',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em',
    },
    welcomeSubtitle: {
        fontSize: '1.25rem',
        color: '#a3a3a3',
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 3rem',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
    },
    jobsSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: '1.75rem',
        fontWeight: '600',
    },
    addJobButton: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    infoCard: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        padding: '1.5rem',
        height: 'fit-content',
    },
    infoTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
    },
    infoGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    infoLabel: {
        fontSize: '0.85rem',
        color: '#a3a3a3',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: '1rem',
        color: '#ffffff',
    },
    loadingContainer: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: '1.25rem',
        color: '#a3a3a3',
    },
    errorContainer: {
        minHeight: '100vh',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
    },
    errorText: {
        fontSize: '1.25rem',
        color: '#ef4444',
    },
    retryButton: {
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '6px',
        fontSize: '0.95rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
};

export default CompanyDashboard;
