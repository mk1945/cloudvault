import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Cloud } from 'lucide-react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <Link to="/" className="logo" style={{ color: 'var(--primary-color)', fontSize: '22px' }}>
                <Cloud size={32} strokeWidth={2.5} />
                <span style={{ fontWeight: 600 }}>CloudVault</span>
            </Link>

            <div className="nav-links">
                {user ? (
                    <>
                        <span className="text-secondary" style={{ fontWeight: 500 }}>Hello, {user.username}</span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Link to="/login" className="btn btn-outline">Sign in</Link>
                        <Link to="/register" className="btn btn-primary">Create account</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
