import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const transformUrl = async (url) => {
  try {
    const isOriginalUrlValid = await testIframeUrl(url);
    if (isOriginalUrlValid) {
      return url;
    }

    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter((part) => part);
    pathParts.unshift("embed");
    urlObj.pathname = pathParts.join("/");
    const transformedUrl = urlObj.toString();

    const isTransformedUrlValid = await testIframeUrl(transformedUrl);
    if (isTransformedUrlValid) {
      return transformedUrl;
    }

    return url;
  } catch (error) {
    console.error("Error transforming URL:", error);
    return url;
  }
};

const testIframeUrl = (url) => {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    iframe.onload = () => {
      document.body.removeChild(iframe);
      resolve(true);
    };

    iframe.onerror = () => {
      document.body.removeChild(iframe);
      resolve(false);
    };
  });
};

const ArticlePage = () => {
  const location = useLocation();
  const articleTitle = location.state?.title || "Selected Article";
  const articleUrl = location.state?.url || "";
  const [transformedUrl, setTransformedUrl] = useState("");
  const [aiResults, setAIResults] = useState(null);
  const [aiLoading, setAILoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(6);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    const fetchTransformedUrl = async () => {
      const url = await transformUrl(articleUrl);
      setTransformedUrl(url);
    };

    if (articleUrl) {
      fetchTransformedUrl();
    }
  }, [articleUrl]);

  const fetchAIResults = async () => {
    console.log("Fetching AI results...");
    const grade = 6;
    const cohere_api_key = import.meta.env.VITE_COHERE_API_KEY;
    const userPrompt = `Go through this link ${articleUrl} generate ${numQuestions} mcq questions for the grade level ${grade}th from this, make sure we have one question which test the understanding of the problem, problem solving, critical thinking and reflection each So total 4 questions. Return the response in the form of json only { 'Q1':  {'Type': Critical Thinking, 'Text': text, 'choice': [1,2,3,4], 'Ans': ans }}`;
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
      console.log("AI response:", response.data);
      const aiResponseText = response.data.message.content[0]?.text || "";

      // Extract JSON from the response (remove Markdown code block)
      const jsonStartIndex = aiResponseText.indexOf("[");
      const jsonEndIndex = aiResponseText.lastIndexOf("]") + 1;
      const jsonString = aiResponseText.slice(jsonStartIndex, jsonEndIndex);

      if (jsonString) {
        try {
          const parsedResults = JSON.parse(jsonString);
          setAIResults(parsedResults.map(obj => Object.values(obj)[0])); 
          // setAIResults(parsedResults);
          setShowQuestions(true);
          
        } catch (error) {
          console.error("Error parsing AI results:", error);
        }
      } else {
        console.error("AI response did not contain valid JSON:", aiResponseText);
      }
    } catch (error) {
      console.error("Error fetching AI results:", error);
    } finally {
      setAILoading(false);
    }
  };

  const handleCreateQuestions = () => {
    fetchAIResults();
  };

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
        {transformedUrl ? (
          <>
            <iframe
              src={transformedUrl}
              className="w-full h-[600px] rounded border border-gray-600"
              title="Article"
              onError={(e) => {
                console.error("Iframe failed to load:", e);
                e.target.style.display = "none"; // Hide the iframe if it fails
              }}
            />
            {/* Fallback Link */}
            <p className="mt-2 text-center text-gray-400">
              If the article does not load,{" "}
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                click here to open it in a new tab
              </a>
              .
            </p>
          </>
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
        <select
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value))}
        >
          {Array.from({ length: 7 }, (_, i) => i + 4).map((num) => (
            <option key={num} value={num}>
              {num}</option>
          ))}
        </select>

        <button
          className="w-full mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={handleCreateQuestions}
        >
          Create Reflection Questions
        </button>

        {aiLoading ? (
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-gray-400">Generating questions with cohere AI...</p>
          </div>
        ) : (
          showQuestions && Array.isArray(aiResults) && aiResults.length > 0 && (
            <div className="mt-4 text-left">
              {aiResults.map((question, index) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-bold">{index + 1}. {question.Text}</h3>
                  <p className="text-sm text-gray-400 mb-2">Type: {question.Type}</p>
                  <div className="space-y-2">
                    {(question.choices || question.choice)?.map((choice, idx) => (
                      <label key={idx} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={choice}
                          className="form-radio text-blue-500"
                        />
                        <span>{choice}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Answer: {question.Ans}</p>
                </div>
              ))}
            </div>
          )
        )}


      </div>
    </div>
  );
};

export default ArticlePage;