import React from 'react';
import '../styles/Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="navbar-logo" aria-hidden="true">
            <img src="/to-do-list%20Logo.png" alt="Task Flow logo" className="navbar-logo-img" />
          </div>
          <h2>Task Flow</h2>
        </div>
        <div className="navbar-user">
          {user && (
            <button onClick={onLogout} className="btn btn-logout">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
