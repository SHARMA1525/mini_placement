import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../components/styles/global.css';

const JobCard = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // If id exists, we are in edit mode
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        jobTitle: '',
        stipend: '',
        description: '',
        skills: '',
        location: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchJobDetails();
        }
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('companyToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/company/dashboard/job/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch job details');

            const data = await response.json();
            const job = data.data;

            setFormData({
                jobTitle: job.jobTitle,
                stipend: job.stipend,
                description: job.description,
                skills: job.skills ? job.skills.map(s => s.skillName).join(", ") : "",
                location: job.location,
                isActive: job.isActive ?? true
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);


        try {
            const token = localStorage.getItem('companyToken');
            const url = isEditMode ?
                `${import.meta.env.VITE_API_URL}/company/dashboard/job/${id}` :
                `${import.meta.env.VITE_API_URL}/company/dashboard/job`;

            const method = isEditMode ? 'PUT' : 'POST';

            // Process skills from string to array
            const payload = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
            };


            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'

                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to update the job details');

            navigate('/company/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.jobTitle) {
        return <div style={styles.loadingText}>Loading job details...</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>{isEditMode ? 'Edit Job' : 'Create New Job'}</h2>

                {error && <div style={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Job Title</label>
                        <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Stipend / Salary</label>
                        <input
                            type="text"
                            name="stipend"
                            value={formData.stipend}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="e.g. ₹50000/month"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="e.g. Bangalore"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            style={styles.textarea}
                            rows="5"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Skills (comma separated)</label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="React, Node.js, MongoDB"
                        />
                    </div>

                    <div style={styles.checkboxGroup}>
                        <label style={styles.label}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                style={styles.checkbox}
                            />
                            Active Job
                        </label>
                    </div>

                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={() => navigate('/company/dashboard')}
                            style={styles.cancelButton}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={styles.submitButton}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update Job' : 'Post Job')}
                        </button>
                    </div>
                </form>
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
    },
    card: {
        backgroundColor: '#1a1a1a',
        border: '1px solid #333333',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '600px',
    },
    title: {
        fontSize: '1.75rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.9rem',
        color: '#a3a3a3',
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#0f0f0f',
        border: '1px solid #333333',
        borderRadius: '6px',
        padding: '0.75rem',
        color: '#ffffff',
        fontSize: '1rem',
        outline: 'none',
    },
    textarea: {
        backgroundColor: '#0f0f0f',
        border: '1px solid #333333',
        borderRadius: '6px',
        padding: '0.75rem',
        color: '#ffffff',
        fontSize: '1rem',
        outline: 'none',
        resize: 'vertical',
    },
    checkboxGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    checkbox: {
        marginRight: '0.5rem',
        accentColor: '#ffffff',
    },
    buttonGroup: {
        display: 'flex',
        gap: '1rem',
        marginTop: '1rem',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        color: '#000000',
        border: 'none',
        padding: '0.75rem',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: 'transparent',
        color: '#ffffff',
        border: '1px solid #333333',
        padding: '0.75rem',
        borderRadius: '6px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    error: {
        color: '#ef4444',
        marginBottom: '1rem',
        textAlign: 'center',
    },
    loadingText: {
        color: '#a3a3a3',
        textAlign: 'center',
        marginTop: '2rem',
    }
};

export default JobCard;
