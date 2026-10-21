import { NavLink, Outlet, Link } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="TrailBook home">
            <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="currentColor" />
              <path d="M4 25 L12 12 L17 19 L21 14 L28 25 Z" fill="var(--surface)" />
            </svg>
            <span>TrailBook</span>
          </Link>
          <nav className="main-nav">
            <NavLink to="/" end>
              Trails
            </NavLink>
            <NavLink to="/new" className="nav-cta">
              + Add trail
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          TrailBook · Hiking trails around Almaty · Midterm project, React SPA
        </div>
      </footer>
    </div>
  );
}
