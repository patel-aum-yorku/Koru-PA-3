 import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProjectForm from './pages/ProjectForm';
import SearchResultsPage from './pages/SearchResultsPage';
const App = () => {


  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<ProjectForm />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          {/* <Route path="/cart" element={<CartPage />} /> */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          </Routes>
      </Suspense>
    </Router>
    
  )
}

export default App