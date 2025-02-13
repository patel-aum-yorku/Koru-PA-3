import React from "react";
import { useLocation } from "react-router-dom";

const ArticlePage = () => {
  const location = useLocation();
  const articleTitle = location.state?.title || "Selected Article";
  const articleUrl = location.state?.url || "";
console.log( articleUrl);
console.log( articleTitle);
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-4">
      {/* Top Section with Mandatory Button */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{articleTitle}</h1>
        <button className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Add to be Mandatory
        </button>
      </div>

      {/* Article Display in Iframe */}
      <div className="w-full max-w-4xl p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        {articleUrl ? (
          <iframe
            src={articleUrl}
            className="w-full h-[600px] rounded border border-gray-600"
            title="Article"
          />
        ) : (
          <p className="text-center text-gray-400">No article URL provided.</p>
        )}
      </div>

      {/* AI Summary and Questions Section */}
      <div className="w-full max-w-4xl mt-4 text-center bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700">
        <p className="mb-2">Do we need AI-generated summary for this text?</p>
        <div className="flex justify-center gap-4 mb-4">
          <label>
            <input type="radio" name="ai-summary" value="yes" className="mr-2" /> Yes
          </label>
          <label>
            <input type="radio" name="ai-summary" value="no" className="mr-2" /> No
          </label>
        </div>

        <p className="mb-2">No. of questions to be generated:</p>
        <select className="p-2 rounded bg-gray-700 border border-gray-600 text-white">
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>

        <button className="w-full mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Create Reflection Questions
        </button>
      </div>
    </div>
  );
};

export default ArticlePage;
