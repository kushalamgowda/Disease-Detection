import React, { useState, useCallback } from 'react';

// --- Helper Functions & Constants ---

// API configuration
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=`; // Key will be provided by the environment

// Function to convert file to base64
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// System prompt for the AI model
const SYSTEM_PROMPT = `
You are an expert botanist and plant pathologist. Your task is to analyze an image of a plant leaf and identify any diseases.
Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting like \`\`\`json.
The JSON object must conform to the following schema:
{
  "diseaseName": "string", // Name of the disease, or "Healthy" if no disease is found, or "Unknown" if not identifiable.
  "description": "string", // A detailed description of the disease, its symptoms, and its impact on the plant.
  "possibleCauses": ["string"], // An array of strings describing common causes.
  "suggestedTreatments": ["string"], // An array of strings with actionable treatment advice.
  "confidenceScore": "number" // A number between 0 and 1 indicating your confidence in the diagnosis.
}
If the image is not a leaf or the quality is too poor to analyze, set diseaseName to "Not a Leaf" or "Poor Quality" respectively and provide an explanation in the description.
`;

// --- SVG Icons ---

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-6 w-6">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const LeafIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 text-green-500">
        <path d="M11 20A7 7 0 0 1 4 13H2a10 10 0 0 0 10 10z" />
        <path d="M12 21.35A7 7 0 0 0 19 14.35V12a2 2 0 0 0-2-2h-1a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v1a2 2 0 0 1-2 2H4a2 2 0 0 0-2 2v2.35A7 7 0 0 0 11 20.35V22" />
        <path d="M2 13a10 10 0 0 1 10-10h1" />
    </svg>
);

const Loader = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        <p className="text-gray-300">Analyzing leaf... this may take a moment.</p>
    </div>
);

// --- React Components ---

const Header = () => (
    <header className="w-full text-center p-4">
        <div className="flex items-center justify-center mb-2">
            <LeafIcon />
            <h1 className="text-4xl sm:text-5xl font-bold text-green-400 ml-3">Leaf Disease Finder</h1>
        </div>
        <p className="text-lg text-gray-400">Upload a leaf image to diagnose plant diseases with AI</p>
    </header>
);

const ImageUploader = ({ onImageUpload, onAnalyze, imagePreviewUrl, isLoading }) => {
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            onImageUpload(event.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-lg bg-gray-800 border-2 border-dashed border-gray-600 rounded-2xl p-6 text-center transition-all hover:border-green-500 hover:bg-gray-700/50">
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
            />
            {!imagePreviewUrl ? (
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-4">
                    <UploadIcon />
                    <span className="font-semibold text-green-400">Click to upload</span>
                    <span className="text-gray-400 text-sm">or drag and drop an image</span>
                </label>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    <img src={imagePreviewUrl} alt="Leaf preview" className="max-h-60 w-auto rounded-lg shadow-lg" />
                    <div className="flex items-center space-x-4">
                         <label htmlFor="file-upload" className="cursor-pointer bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors text-sm disabled:opacity-50" disabled={isLoading}>
                            Change Image
                        </label>
                        <button onClick={onAnalyze} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-500 transition-colors font-bold disabled:bg-green-800 disabled:cursor-not-allowed" disabled={isLoading}>
                            Analyze Leaf
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ResultCard = ({ result }) => {
    if (!result) return null;

    const { diseaseName, description, possibleCauses, suggestedTreatments, confidenceScore } = result;

    const getBorderColor = () => {
        if (diseaseName === 'Healthy') return 'border-green-500';
        if (diseaseName === 'Unknown' || diseaseName === 'Not a Leaf' || diseaseName === 'Poor Quality') return 'border-yellow-500';
        return 'border-red-500';
    };

    return (
        <div className={`w-full max-w-2xl mt-8 bg-gray-800 rounded-2xl p-6 border-t-4 ${getBorderColor()} shadow-2xl`}>
            <h2 className="text-2xl font-bold text-white mb-1">{diseaseName}</h2>
             {confidenceScore && <p className="text-sm text-gray-400 mb-4">Confidence: { (confidenceScore * 100).toFixed(1) }%</p>}

            <div className="space-y-4">
                <div>
                    <h3 className="font-semibold text-green-400 mb-1">Description</h3>
                    <p className="text-gray-300">{description}</p>
                </div>
                
                {possibleCauses && possibleCauses.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-green-400 mb-1">Possible Causes</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {possibleCauses.map((cause, index) => <li key={index}>{cause}</li>)}
                        </ul>
                    </div>
                )}
                
                {suggestedTreatments && suggestedTreatments.length > 0 && (
                     <div>
                        <h3 className="font-semibold text-green-400 mb-1">Suggested Treatments</h3>
                        <ul className="list-disc list-inside text-gray-300 space-y-1">
                            {suggestedTreatments.map((treatment, index) => <li key={index}>{treatment}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function App() {
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageUpload = (file) => {
        setImageFile(file);
        setAnalysisResult(null);
        setError('');
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const base64Image = await fileToBase64(imageFile);

            const payload = {
                contents: [
                    {
                        parts: [
                            { text: SYSTEM_PROMPT },
                            {
                                inlineData: {
                                    mimeType: imageFile.type,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ],
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                throw new Error("Invalid response structure from the API.");
            }
            
            // Clean the response to ensure it's valid JSON
            const cleanedJsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsedResult = JSON.parse(cleanedJsonString);
                setAnalysisResult(parsedResult);
            } catch (parseError) {
                 throw new Error("Failed to parse the AI's response. The response was not valid JSON.");
            }

        } catch (err) {
            console.error("Analysis failed:", err);
            setError(err.message || 'An unknown error occurred during analysis.');
            setAnalysisResult({
                 diseaseName: "Analysis Failed",
                 description: err.message || 'An unknown error occurred. Please check the console for details and try again.',
                 possibleCauses: [],
                 suggestedTreatments: []
            });

        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

    return (
        <div className="bg-gray-900 min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 text-white font-sans">
            <main className="flex flex-col items-center w-full max-w-4xl space-y-6">
                <Header />
                <ImageUploader 
                    onImageUpload={handleImageUpload}
                    onAnalyze={handleAnalyze}
                    imagePreviewUrl={imagePreviewUrl}
                    isLoading={isLoading}
                />
                
                {error && <div className="bg-red-900 border border-red-500 text-red-300 px-4 py-3 rounded-lg mt-4 text-center">{error}</div>}

                <div className="w-full flex items-center justify-center pt-6">
                    {isLoading && <Loader />}
                    {!isLoading && analysisResult && <ResultCard result={analysisResult} />}
                </div>
            </main>
             <footer className="text-center text-gray-500 text-sm mt-8 pb-4">
                <p>Powered by Gemini. For informational purposes only. Always consult a professional for critical plant health issues.</p>
            </footer>
        </div>
    );
}
