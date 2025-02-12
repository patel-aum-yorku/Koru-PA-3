import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  
  // use the useLocation hook to get the current location, this will help us get the query parameters
  // use the URLSearchParams to get the query parameters from the location object
  // get the topic and grade from the query parameters
  // set the initialTopic to the topic from the query parameters
  // set the grade to the grade from the query parameters
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTopic = params.get("topic") || "";
  const grade = params.get("grade") || "6th Grade";
  const dueDate = params.get("duedate") || "";
  console.log("Grade from previous page:", grade);
  console.log("Due Date from previous page:", dueDate);

  // create a state variable to store the search results
  // create a state variable to store the loading state
  // create a state variable to store the selected links
  // create a state variable to store the topic
  // set the initial value of the topic to the initialTopic
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [topic, setTopic] = useState(initialTopic);

  useEffect(() => {
    if (topic) {
      fetchSearchResults();
    }
  }, [topic]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      // Step 1: Fetch Google Search API results
      const googleResponse = await axios.get(`/api/google-search?query=${topic}`);
      const urls = googleResponse.data.urls;
      
      // Step 2: Send URLs to Cohere AI for relevance filtering
      const cohereResponse = await axios.post(`/api/cohere-filter`, {
        urls,
        grade
      });
      
      setSearchResults(cohereResponse.data.filteredUrls);
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
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(result.url)}
                  onChange={() => toggleSelection(result.url)}
                  className="mr-2"
                />
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {result.title}
                </a>
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-red-400 text-sm">
          <input type="checkbox"  className="mr-2" />
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
