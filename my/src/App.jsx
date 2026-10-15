
import './App.css';
import Register from './components/Register';
import Login from './components/login';

function App() {
  return (
    <main className="studentmart-page">
      {/* Left welcome panel */}
      <section className="welcome-panel">
        <div className="welcome-content">
          <h1>
            Student<span>Mart.</span>
          </h1>

          <p className="welcome-tagline">
            Your campus. Your community. Your marketplace.
          </p>

          <div className="welcome-illustration">
            <div className="circle circle-one"></div>
            <div className="circle circle-two"></div>

            <div className="market-card">
              <div className="market-icon">🛍️</div>

              <h2>Everything students need.</h2>

              <p>
                Buy, sell, and discover amazing deals on campus.
              </p>

              <div className="market-tags">
                <span>📚 Books</span>
                <span>💻 Gadgets</span>
                <span>🎒 Essentials</span>
              </div>
            </div>
          </div>

          <div className="welcome-bottom">
            <span className="online-dot"></span>
            Made for students, by students.
          </div>
        </div>
      </section>

      {/* Right forms panel */}
      <section className="forms-panel">
        <div className="forms-heading">
          <span className="eyebrow">
            WELCOME TO STUDENTMART
          </span>

          <h2>Get started today.</h2>

          <p>
            Create an account or sign in to continue.
          </p>
        </div>

        <div className="forms-grid">
          <div className="form-card">
            <Register />
          </div>

          <div className="form-card">
            <Login />
          </div>
        </div>

        <p className="page-footer">
          © {new Date().getFullYear()} StudentMart · Your campus marketplace
        </p>
      </section>
    </main>
  );
}

export default App;
