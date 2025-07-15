import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">AuthorHub Dashboard</h1>
          <p>Welcome to the AuthorHub Management System</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Users</h3>
          <p>Manage user accounts, profiles, and authentication</p>
          <Link to="/users" className="card-action">
            View Users →
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <h3>Groups</h3>
          <p>Create and manage user groups for better organization</p>
          <Link to="/groups" className="card-action">
            View Groups →
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📄</div>
          <h3>Resources</h3>
          <p>Define and manage system resources and access points</p>
          <Link to="/resources" className="card-action">
            View Resources →
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🔐</div>
          <h3>Permissions</h3>
          <p>Configure permissions and access control policies</p>
          <Link to="/permissions" className="card-action">
            View Permissions →
          </Link>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-section">
          <h2>Getting Started</h2>
          <div className="info-grid">
            <div className="info-item">
              <h4>1. Create Users</h4>
              <p>Start by adding users to your system with their basic information.</p>
            </div>
            <div className="info-item">
              <h4>2. Set Up Groups</h4>
              <p>Organize users into logical groups like admins, editors, or viewers.</p>
            </div>
            <div className="info-item">
              <h4>3. Define Resources</h4>
              <p>Create resources that represent different parts of your application.</p>
            </div>
            <div className="info-item">
              <h4>4. Assign Permissions</h4>
              <p>Grant groups specific permissions to access and modify resources.</p>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>System Features</h2>
          <ul className="feature-list">
            <li>✅ User Management with full CRUD operations</li>
            <li>✅ Group-based organization and user assignment</li>
            <li>✅ Resource definition and management</li>
            <li>✅ Fine-grained permission control (Create, Read, Update, Delete)</li>
            <li>✅ Real-time updates and responsive design</li>
            <li>✅ Professional UI with modern components</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
