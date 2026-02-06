import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register({ username, email, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-box text-center">
                    <h2 className="auth-title" style={{ color: 'var(--secondary-color)' }}>Check your email</h2>
                    <p className="text-secondary mb-4">
                        We sent a verification link to <strong>{email}</strong>.
                    </p>
                    <Link to="/login" className="btn btn-primary">Return to Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Create your Google Account</h2>
                <p className="text-center text-secondary mb-4">to continue to CloudVault</p>

                {error && <div className="alert-error text-center mb-4" style={{ color: 'var(--danger-color)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Username</label>
                        <input
                            type="text"
                            className="input-field"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
                        <Link to="/login" className="link-primary text-sm">Sign in instead</Link>
                        <button type="submit" className="btn btn-primary">
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
