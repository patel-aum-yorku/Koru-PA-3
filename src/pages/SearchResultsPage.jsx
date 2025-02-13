import React, { useState, useEffect } from "react";
import { FaSearch, FaExternalLinkAlt } from "react-icons/fa";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTopic = params.get("topic") || "";
  const grade = params.get("grade") || "6th Grade";
  const dueDate = params.get("duedate") || "";

  const navigate = useNavigate();

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [topic, setTopic] = useState(initialTopic);

  const fetchSearchResults = async () => {
    searchResults.length && setSearchResults([]); // Clear previous results
    setLoading(true);
    try {
      const API_KEY = import.meta.env.VITE_SEARCH_API_KEY;
      const SEARCH_ENGINE_ID = import.meta.env.VITE_SEARCH_ENGINE_ID;
      const response = await axios.get(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&safe=active&q=${topic}`
      );
      const results = response.data.items || [];
      setSearchResults(results.map((item) => ({ url: item.link, title: item.title })));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
    setLoading(false);
  };

  const toggleSelection = (url) => {
    setSelectedLinks((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  return (
    <div className="h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-2xl p-6 bg-gray-800 rounded-lg shadow-lg border border-gray-700 text-center">
        <label className="block text-2xl text-orange-400 mb-4">Search for Information</label>
        <div className="relative w-full mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 text-black rounded border border-gray-400 focus:outline-none"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-600 cursor-pointer" onClick={fetchSearchResults} />
        </div>
        <div className="text-left">
          {loading ? (
            <p className="text-center text-gray-400">Loading search results...</p>
          ) : (
            searchResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(result.url)}
                  onChange={() => toggleSelection(result.url)}
                  className="mr-2"
                />
                {/* Clicking on this will navigate to the new Article Page */}
                <span
                  className="text-blue-400 hover:underline cursor-pointer"
                  onClick={() =>
                    navigate(`/article/${index}`, {
                      state: { title: result.title, url: result.url },
                    })
                  }
                >
                  {result.title}
                </span>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="ml-2">
                  <FaExternalLinkAlt className="text-gray-400 hover:text-gray-200" />
                </a>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-red-400 text-sm">
          <input type="checkbox" checked readOnly className="mr-2" />
          Students are allowed to use AI text summarizer (By Default)
        </div>
        <button className="w-full mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Finalize
        </button>
      </div>
    </div>
  );
};

export default SearchResultsPage;
