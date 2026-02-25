import { useState } from 'react';
import DoctorTestComponent from './components/DoctorTestComponent';

const userRenderedContent = '<img src="invalid:" onerror="alert(1)">';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="container">
      <h1>Framework Doctor React Demo</h1>
      <p>A minimal React app with intentional issues for react-doctor testing.</p>

      <div className="example">
        <button type="button" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <hr />
      <h2>react-doctor test section (intentional issues)</h2>
      <div className="example">
        <DoctorTestComponent label="Test" />
        <div dangerouslySetInnerHTML={{ __html: userRenderedContent }} />
      </div>
    </div>
  );
};

export default App;
