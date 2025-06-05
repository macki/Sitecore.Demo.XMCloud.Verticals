/* eslint-disable */
import React, { useState } from 'react';

const VirtualUserLogin = (): JSX.Element => {
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
            // Send login request directly to the controller
            const response = await fetch('/api/sitecore/Login/VirtualLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({ username }).toString(),
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

            console.log(data);
        }

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
        <div className="container mt-4">
            <h2 className="mb-3">Virtual User Login</h2>

            <form onSubmit={handleSubmit} className="form">
                <div className="form-group mb-3">
                    <label htmlFor="username" className="form-label">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-control"
                        placeholder="Enter username"
                        required
                        disabled={loading}
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || !username.trim()}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {successMessage && <div className="alert alert-success mt-3">{successMessage}</div>}

            {user && (
                <div className="card mt-3 p-3">
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