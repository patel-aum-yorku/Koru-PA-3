import  { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProjectForm = () => {
  const [topic, setTopic] = useState("What is Climate change");
  const [grade, setGrade] = useState("6th Grade");
  const [dueDate, setDueDate] = useState("2025-02-20");
  const [restricted, setRestricted] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const prompts = ["Climate Change Effects", "Causes of Climate Change", "Solutions to Climate Change"];
  const navigate = useNavigate();
  const handleSubmit = () => {
    navigate(`/search-results?topic=${encodeURIComponent(topic)}&grade=${encodeURIComponent(grade)}&duedate=${encodeURIComponent(dueDate)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white p-4">
      <div className="w-full max-w-lg p-6 bg-gray-900 rounded-lg shadow-lg border border-gray-700">
        <label className="block text-lg mb-2 text-center">What’s the topic for your project?</label>
        <div className="relative mb-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 pr-10 text-black rounded border border-gray-400 focus:outline-none"
          />
          <FaSearch className="absolute right-3 top-3 text-gray-600" />
        </div>
        
        <div className="flex justify-between mb-4">
          <div>
            <label className="block text-red-400 mb-1">Please select the grade level:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 text-black rounded border border-gray-400 focus:outline-none"
            >
              <option>1st Grade</option>    
              <option>2nd Grade</option>    
              <option>3rd Grade</option>  
              <option>4th Grade</option>  
              <option>5th Grade</option>  
              <option>6th Grade</option>
              <option>7th Grade</option>
              <option>8th Grade</option>
              <option>9th Grade</option>
              <option>10th Grade</option>
              <option>11th Grade</option>
              <option>12th Grade</option>
            </select>
          </div>
          <div>
            <label className="block text-red-400 mb-1">Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 text-black rounded border border-gray-400 focus:outline-none"
            />
          </div>
        </div>
        
        {/* <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={restricted}
            onChange={() => setRestricted(!restricted)}
            className="mr-2"
          />
          <label>Restricted Search (only keywords selected could be searched by students)</label>
        </div>
         */}
        {/* <div className="mb-4">
          <label className="block mb-1">Select Multiple Prompts or Add Your Own:</label>
          <select
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="w-full p-2 text-black rounded border border-gray-400 focus:outline-none"
          >
            <option value="">-- Select a prompt --</option>
            {prompts.map((prompt, index) => (
              <option key={index} value={prompt}>{prompt}</option>
            ))}
          </select>
        </div> */}
        
        <button  onClick={handleSubmit} className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Let’s cook
        </button>
      </div>
    </div>
  );
};

export default ProjectForm;
