 import { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProjectForm from './pages/ProjectForm';
import SearchResultsPage from './pages/SearchResultsPage';
import ArticlePage from './pages/ArticlePage';
const App = () => {


  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<ProjectForm />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          </Routes>
      </Suspense>
    </Router>
    
  )
}

export default App