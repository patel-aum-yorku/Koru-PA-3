import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

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

  useEffect(() => {
    const fetchTransformedUrl = async () => {
      const url = await transformUrl(articleUrl);
      setTransformedUrl(url);
    };

    if (articleUrl) {
      fetchTransformedUrl();
    }
  }, [articleUrl]);

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