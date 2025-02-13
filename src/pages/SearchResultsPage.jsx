import React, { useState, useEffect, useRef } from "react";
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
  const [aiResults, setAIResults] = useState(null);
  const [aiLoading, setAILoading] = useState(false);

  const isInitialMount = useRef(true); // Track initial mount

  // Load saved state from session storage on component mount
  useEffect(() => {
    const savedSearchResults = sessionStorage.getItem("searchResults");
    const savedAIResults = sessionStorage.getItem("aiResults");
    const savedSelectedLinks = sessionStorage.getItem("selectedLinks");

    if (savedSearchResults && JSON.parse(savedSearchResults).length > 0) {
      setSearchResults(JSON.parse(savedSearchResults));
    }
    if (savedAIResults) {
      try {
        setAIResults(JSON.parse(savedAIResults));
      } catch (error) {
        console.error("Error parsing AI results from sessionStorage:", error);
      }
    }
    if (savedSelectedLinks) {
      setSelectedLinks(JSON.parse(savedSelectedLinks));
    }

    isInitialMount.current = false;
  }, []);

  // Save state to session storage whenever it changes (after initial mount)
  useEffect(() => {
    if (!isInitialMount.current && searchResults.length > 0) {
      sessionStorage.setItem("searchResults", JSON.stringify(searchResults));
    }
  }, [searchResults]);

  useEffect(() => {
    if (!isInitialMount.current && aiResults) {
      sessionStorage.setItem("aiResults", JSON.stringify(aiResults));
    }
  }, [aiResults]);

  useEffect(() => {
    if (!isInitialMount.current && selectedLinks.length > 0) {
      sessionStorage.setItem("selectedLinks", JSON.stringify(selectedLinks));
    }
  }, [selectedLinks]);

  const fetchSearchResults = async () => {
    console.log("Fetching new search results...");
    setAIResults(null); // Reset AI results when a new search is performed
    sessionStorage.removeItem("aiResults"); // Clear saved AI results
    searchResults.length && setSearchResults([]); // Clear previous search results
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

  const fetchAIResults = async () => {
    console.log("Fetching AI results...");
    const searchLinksText = searchResults.map((link) => link.url).join(", ");
    const cohere_api_key = import.meta.env.VITE_COHERE_API_KEY;
    const userPrompt = searchLinksText + "Go through all these links make sure it contains info related to the topic " + topic + " and tell which websites are not age appropriate and understandable by " + grade + " and  why. Your response should be a json with schema " +
      "{'understandable_links': ['link1', 'link2'], 'not_understandable': [{'link3', 'why'}, {'link4', 'why'}] }";

    setAILoading(true);
    try {
      const response = await axios.post(
        "https://api.cohere.com/v2/chat",
        {
          model: "command-r-plus",
          messages: [{ role: "user", content: userPrompt }],
        },
        {
          headers: {
            Authorization: `BEARER ${cohere_api_key}`,
            "Content-Type": "application/json",
          },
        }
      );

      try {
        const aiResponseText = response.data.message.content[0]?.text || "";
        const jsonMatch = aiResponseText.match(/{.*}/s); // Extract JSON safely
        if (jsonMatch) {
          const parsedResults = JSON.parse(jsonMatch[0]);
          setAIResults(parsedResults);
        } else {
          console.error("AI response did not contain valid JSON:", aiResponseText);
        }
      } catch (error) {
        console.error("Error parsing AI results:", error);
      }

    } catch (error) {
      console.error("Error fetching AI results:", error);
    } finally {
      setAILoading(false);
    }
  };

  const toggleSelection = (url) => {
    setSelectedLinks((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  // Create a mapping of URLs to titles from the Google search results
  const urlToTitleMap = searchResults.reduce((map, result) => {
    map[result.url] = result.title;
    return map;
  }, {});

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
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

        <button
          onClick={fetchAIResults}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Check with AI
        </button>

        {loading ? (
          <p className="text-center text-gray-400">Loading search results...</p>
        ) : aiLoading ? (
          <p className="text-center text-gray-400">Analyzing links with AI...</p>
        ) : aiResults ? (
          <div className="text-left">
            <h3 className="text-lg text-green-400 mt-4">Understandable Links</h3>
            {aiResults.understandable_links.map((link, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(link)}
                  onChange={() => toggleSelection(link)}
                  className="mr-2"
                />
                <span
                  className="text-blue-400 hover:underline cursor-pointer"
                  onClick={() =>
                    navigate(`/article/${index}`, {
                      state: { title: urlToTitleMap[link] || link, url: link },
                    })
                  }
                >
                  {urlToTitleMap[link] || link}
                </span>
                <a href={link} target="_blank" rel="noopener noreferrer" className="ml-2">
                  <FaExternalLinkAlt className="text-gray-400 hover:text-gray-200" />
                </a>
              </div>
            ))}

            <h3 className="text-lg text-red-400 mt-4">Not Understandable Links</h3>
            {aiResults.not_understandable.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLinks.includes(item.link)}
                      onChange={() => toggleSelection(item.link)}
                      className="mr-2"
                    />
                    <span
                      className="text-blue-400 hover:underline cursor-pointer"
                      onClick={() =>
                        navigate(`/article/${index}`, {
                          state: { title: urlToTitleMap[item.link] || item.link, url: item.link },
                        })
                      }
                    >
                      {urlToTitleMap[item.link] || item.link}
                    </span>
                  </div>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="ml-2">
                    <FaExternalLinkAlt className="text-gray-400 hover:text-gray-200" />
                  </a>
                </div>
                <p className="text-sm text-gray-400 ml-6">{item.why}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-left">
            {searchResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between mb-2">
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(result.url)}
                  onChange={() => toggleSelection(result.url)}
                  className="mr-2"
                />
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
            ))}
          </div>
        )}

        <div className="mt-4 text-red-400 text-sm">
          <input type="checkbox" checked readOnly className="mr-2" />
          Students are allowed to use AI text summarizer (By Default)
        </div>
      </div>

      <button className="w-full max-w-2xl mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
        Finalize
      </button>
    </div>
  );
};

export default SearchResultsPage;