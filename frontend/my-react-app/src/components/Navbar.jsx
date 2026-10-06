import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import "../styles/navbar.css";
import logo from "../assets/sikh_army_logo.png";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const cartItems = useSelector((state) => state.cart.cartItems);
    const navigate = useNavigate();

    const handleLogout = () => {
    logout();
    navigate('/login');
    };
    return (
        <>
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">
                    <img src={logo} alt="Sikh Army logo" style={{ height: '45px', width: '100px', borderRadius: '8px', objectFit: 'contain', filter: 'drop-shadow(0 2px 8px rgba(249, 115, 22, 0.35))'}} className="navbar-logo" />
                    Sikh Army
                </Link>
            </div>
            <ul className="navbar-links">
                <li><Link to="/shop">Shop</Link></li>
                <li><Link to="/cart">Cart ({cartItems.length})</Link></li>
                {user ? (
                <>
                <li><Link to="/profile">Hi, {user.name}</Link></li>
                {user.role === 'admin' && <li><Link to="/admin">Admin</Link></li>}
                <li><button onClick={handleLogout} className="btn-logout">Logout</button></li>
                </>
                ) : (
                <li><Link to="/login">Login</Link></li>
                )}
            </ul>
        </nav>
        </>
    )
}

export default  Navbar;