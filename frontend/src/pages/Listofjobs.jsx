import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ListOfJobs = ({ jobs, onRefresh }) => {
    const navigate = useNavigate();
    const [activeMenuId, setActiveMenuId] = useState(null);

    const toggleMenu = (e, jobId) => {
        e.stopPropagation(); // Prevent triggering card click
        setActiveMenuId(activeMenuId === jobId ? null : jobId);
    };

    const handleEdit = (e, jobId) => {
        e.stopPropagation();
        navigate(`/dashboard/job/${jobId}`);
    };
    const handleStudents = (e, jobId) => {
        e.stopPropagation();
        navigate(`/dashboard/job/${jobId}/applicants`);
        setActiveMenuId(null);
    };

    const handleDelete = async (e, jobId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this job?')) return;

        try {
            const token = localStorage.getItem('companyToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/company/dashboard/job/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });


            if (response.ok) {
                onRefresh();
            } else {
                alert('Failed to delete job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            alert('Error deleting job');
        }
        setActiveMenuId(null);
    };

    const handleCardClick = (jobId) => {
        navigate(`/dashboard/job/${jobId}`);
    };

    // Close menu when clicking outside (simple implementation)
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    if (!jobs || jobs.length === 0) {
        return (
            <div style={styles.emptyState}>
                <p style={styles.emptyStateText}>No active jobs posted yet</p>
                <p style={styles.emptyStateSubtext}>
                    Click "Add Job" to post your first job opening
                </p>
            </div>
        );
    }

    return (
        <div style={styles.jobsList}>
            {jobs.map((job, index) => (
                <div
                    key={job.jobId || job._id || index}
                    style={styles.jobCard}
                    onClick={() => handleCardClick(job.jobId || job._id)}
                >
                    <div style={styles.jobInfo}>
                        <h3 style={styles.jobTitle}>{job.jobTitle || 'Untitled Job'}</h3>
                        <div style={styles.jobMeta}>
                            <span style={styles.jobMetaItem}>
                                {job.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span style={styles.jobDivider}>•</span>
                            <span style={styles.jobMetaItem}>
                                {job.location || 'Remote'}
                            </span>
                            {job.stipend && (
                                <>
                                    <span style={styles.jobDivider}>•</span>
                                    <span style={styles.jobMetaItem}>{job.stipend}</span>
                                </>
                            )}
                        </div>
                        {job.description && (
                            <p style={styles.jobDescription}>
                                {job.description.substring(0, 150)}
                                {job.description.length > 150 ? '...' : ''}
                            </p>
                        )}
                    </div>

                    <div style={styles.menuContainer}>
                        <button
                            style={styles.menuButton}
                            onClick={(e) => toggleMenu(e, job.jobId || job._id)}
                        >
                            ⋮
                        </button>

                        {activeMenuId === (job.jobId || job._id) && (
                            <div style={styles.menuDropdown}>
                                <button
                                    style={{ ...styles.menuItem, borderBottom: '1px solid #aeababff' }}
                                    onClick={(e) => handleEdit(e, job.jobId)}
                                >
                                    Update
                                </button>
                                <button
                                    style={{ ...styles.menuItem, borderBottom: '1px solid #aeababff' }}
                                    onClick={(e) => handleStudents(e, job.jobId)}
                                >
                                    View applicants
                                </button>
                                <button
                                    style={{ ...styles.menuItem, color: '#ef4444' }}
                                    onClick={(e) => handleDelete(e, job.jobId)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const styles = {
    jobsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    jobCard: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.2s',
    },
    jobInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '0.5rem',
        color: '#ffffff',
    },
    jobMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
    },
    jobMetaItem: {
        fontSize: '0.9rem',
        color: '#a3a3a3',
    },
    jobDivider: {
        color: '#666666',
    },
    jobDescription: {
        fontSize: '0.95rem',
        color: '#cccccc',
        lineHeight: '1.5',
    },
    menuContainer: {
        position: 'relative',
        marginLeft: '1rem',
    },
    menuButton: {
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0 0.5rem',
        lineHeight: '1',
    },
    menuDropdown: {
        position: 'absolute',
        top: '100%',
        right: '0',
        backgroundColor: '#262626',
        border: '1px solid #333333',
        borderRadius: '6px',
        padding: '0.5rem 0',
        zIndex: 10,
        minWidth: '120px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
    menuItem: {
        display: 'block',
        width: '100%',
        padding: '0.5rem 1rem',
        textAlign: 'left',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#ffffff',
        fontSize: '0.9rem',
        cursor: 'pointer',
    },
    emptyState: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        padding: '3rem',
        textAlign: 'center',
    },
    emptyStateText: {
        fontSize: '1.1rem',
        color: '#ffffff',
        marginBottom: '0.5rem',
    },
    emptyStateSubtext: {
        fontSize: '0.95rem',
        color: '#a3a3a3',
    },
};

export default ListOfJobs;