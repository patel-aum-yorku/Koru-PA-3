import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { useLocation } from "react-router-dom";

const SearchResultsPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialTopic = params.get("topic") || "";
  const grade = params.get("grade") || "6th Grade";
  const dueDate = params.get("duedate") || "";

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLinks, setSelectedLinks] = useState([]);
  const [topic, setTopic] = useState(initialTopic);
  const [aiResults, setAIResults] = useState(null); // Store AI results
  const [aiLoading, setAILoading] = useState(false); // Track AI loading state

  const fetchSearchResults = async () => {
    setAIResults(null); // Reset AI results when a new search is performed
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

  useEffect(() => {
    console.log("Updated Search Results:", searchResults);
  }, [searchResults]); // Runs whenever `searchResults` changes

  useEffect(() => {
    console.log("Updated Ai Results:", aiResults);
  }, [aiResults]); // Runs whenever `aiResponse` changes

  // Out of all these links tell me which are age appropriate and understandable for 9th Grade student, tell which ones are not and why Not the json
  function fetchAIResults() {
    const searchLinksText = searchResults.map((link) => link.url).join(", ");
    const cohere_api_key = import.meta.env.VITE_COHERE_API_KEY;
    const userPrompt = searchLinksText + "Go through all these links make sure it contains info related to the topic " + topic + " and tell which websites are not age appropriate and understandable by " + grade + " and  why. Your response should be a json with schema " +
      "{'understandable_links': ['link1', 'link2'], 'not_understandable': [{'link3', 'why'}, {'link4', 'why'}] }";

    console.log("User Prompt:", userPrompt);
    const fetchData = async () => {
      setAILoading(true); // Set AI loading to true when the request starts
      try {
        const response = await axios.post(
          "https://api.cohere.com/v2/chat",
          {
            model: "command-r-plus",
            messages: [{ role: "user", content: userPrompt }],
          },
          {
            headers: {
              Authorization: `BEARER ${cohere_api_key}`, // Corrected authorization header
              "Content-Type": "application/json",
            },
          }
        );
        console.log("AI Response:", response.data);

        // Extract the JSON content from the AI response
        const aiResponseText = response.data.message.content[0].text;
        const jsonStartIndex = aiResponseText.indexOf("{"); // Find the start of the JSON
        const jsonEndIndex = aiResponseText.lastIndexOf("}") + 1; // Find the end of the JSON
        const jsonString = aiResponseText.slice(jsonStartIndex, jsonEndIndex); // Extract the JSON string

        const parsedResults = JSON.parse(jsonString); // Parse the JSON string
        setAIResults(parsedResults); // Set the parsed results to `aiResults`
      } catch (error) {
        console.error("Error fetching AI results:", error);
      } finally {
        setAILoading(false); // Set AI loading to false when the request completes (or fails)
      }
    };
    fetchData();
  }

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

        {/* New "Check with AI" Button */}
        <button
          onClick={fetchAIResults}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Check with AI
        </button>

        {loading ? (
          <p className="text-center text-gray-400">Loading search results...</p>
        ) : aiLoading ? ( // Show loading indicator for AI response
          <p className="text-center text-gray-400">Analyzing links with AI...</p>
        ) : aiResults ? (
          <div className="text-left">
            {/* Display Understandable Links */}
            <h3 className="text-lg text-green-400 mt-4">Understandable Links</h3>
            {aiResults.understandable_links.map((link, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedLinks.includes(link)}
                  onChange={() => toggleSelection(link)}
                  className="mr-2"
                />
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {link}
                </a>
              </div>
            ))}

            {/* Display Non-Understandable Links */}
            <h3 className="text-lg text-red-400 mt-4">Not Understandable Links</h3>
            {aiResults.not_understandable.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLinks.includes(item.link)}
                    onChange={() => toggleSelection(item.link)}
                    className="mr-2"
                  />
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    {item.link}
                  </a>
                </div>
                <p className="text-sm text-gray-400 ml-6">{item.why}</p>
              </div>
            ))}
          </div>
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

        <div className="mt-4 text-red-400 text-sm">
          <input type="checkbox" checked readOnly className="mr-2" />
          Students are allowed to use AI text summarizer (By Default)
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;