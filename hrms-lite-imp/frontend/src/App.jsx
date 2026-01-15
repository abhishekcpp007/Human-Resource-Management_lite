import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common';
import { Dashboard, Employees, Attendance } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
