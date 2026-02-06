import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../services/auth';

const ActivateAccount = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Activating...');

    useEffect(() => {
        if (token) {
            authService.activate(token)
                .then((res) => {
                    setStatus('Account activated successfully! Redirecting to login...');
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                })
                .catch((err) => {
                    setStatus(err.response?.data?.message || 'Activation failed');
                });
        } else {
            setStatus('Invalid token');
        }
    }, [token, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-box text-center">
                <h2 className="auth-title">Account Activation</h2>
                <p className="text-secondary mb-4">{status}</p>
                <div className="mt-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActivateAccount;
