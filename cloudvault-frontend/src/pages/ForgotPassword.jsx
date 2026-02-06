import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');
        setError('');

        try {
            await authService.forgotPassword(email);
            setStatus('Email sent! Please check your inbox for the reset link.');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Account Recovery</h2>
                <p className="text-center text-secondary mb-4">Enter your email to reset password</p>

                {status && <div className="text-center mb-4" style={{ color: 'var(--secondary-color)' }}>{status}</div>}
                {error && <div className="alert-error text-center mb-4" style={{ color: 'var(--danger-color)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary">
                            Send Reset Link
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <Link to="/login" className="link-primary text-sm">Back to Sign In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
