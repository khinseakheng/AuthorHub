import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { to: '/', label: '🏠 Dashboard' },
  { to: '/users', label: '👥 Users' },
  { to: '/groups', label: '👨‍👩‍👧‍👦 Groups' },
  { to: '/resources', label: '📚 Resources' },
  { to: '/permissions', label: '🔐 Permissions' },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🏢 AuthorHub
      </Link>
      <ul className="navbar-list">
        {navItems.map((item) => (
          <li key={item.to} className={location.pathname === item.to ? 'active' : ''}>
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
