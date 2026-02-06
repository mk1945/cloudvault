import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Sign in</h2>
                <p className="text-center text-secondary mb-4">to continue to CloudVault</p>

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
                    <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                        <Link to="/forgotpassword" className="link-primary text-sm">Forgot email or password?</Link>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <button type="submit" className="btn btn-primary">
                            Next
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '40px', textAlign: 'left', fontSize: '14px' }}>
                    <Link to="/register" className="link-primary">Create account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
