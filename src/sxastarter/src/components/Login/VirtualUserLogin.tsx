import React, { useState } from 'react';
import { ComponentProps } from 'lib/component-props';

const VirtualUserLogin = (props: ComponentProps): JSX.Element => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [user, setUser] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('username', username);

            // Send login request to the VirtualLogin endpoint
            const response = await fetch('/api/sitecore/Login/VirtualLogin', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSuccessMessage(data.message);
                setUser(data.user);
                // Optionally refresh the page to update authentication status
                // window.location.reload();
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('An error occurred while trying to log in.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <h2 className={styles.title}>Virtual User Login</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="username" className={styles.label}>Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                        placeholder="Enter username"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className={styles.button}
                    disabled={loading || !username.trim()}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}

            {user && (
                <div className={styles.userInfo}>
                    <h3>User Information:</h3>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Display Name:</strong> {user.displayName}</p>
                    <p><strong>Status:</strong> {user.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
                </div>
            )}
        </div>
    );
};

export default VirtualUserLogin;