Leaf Disease Finder 🌿🔬
An AI-powered web application built with React that allows users to upload an image of a plant leaf and get an instant diagnosis for diseases. The app leverages the Google Gemini model to provide detailed information, including potential causes and treatment suggestions.





✨ Features
Easy Image Upload: Simple drag-and-drop or click-to-upload interface for leaf images.

Instant Image Preview: See a preview of your uploaded image before analysis.

AI-Powered Diagnosis: Utilizes the powerful Google Gemini vision model to analyze the image and identify plant diseases.

Detailed & Structured Results: Receives a clean, JSON-formatted response with:

Disease Name

In-depth Description

List of Possible Causes

Actionable Treatment Suggestions

Confidence Score of the Diagnosis

Sleek, Responsive UI: A modern, dark-themed interface built with Tailwind CSS that looks great on both desktop and mobile devices.

Clear Status Indicators: A loading spinner and clear error messages provide a smooth user experience.






⚙️ How It Works
The application provides a seamless user experience by combining a modern frontend with a powerful AI backend.


<img width="1023" height="569" alt="Screenshot 2025-09-23 022657" src="https://github.com/user-attachments/assets/290a3593-8bf1-4498-877a-343fad129518" />





Frontend (React): The user interface is built entirely in React. When a user uploads a file, the browser's FileReader API is used to create a base64-encoded string from the image.

API Call (Gemini): This base64 string, along with a carefully crafted system prompt, is sent to the Google Gemini API endpoint.

AI Analysis: The Gemini model, instructed to act as a plant pathologist, analyzes the image. It follows the instructions in the system prompt to return a structured JSON object containing the diagnosis.

Display Results: The React application parses the JSON response and displays the information in a clean, user-friendly result card.

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js and npm (or yarn) installed on your machine.

A Google AI API Key with the Gemini model enabled.

Installation & Setup
Clone the repository:

git clone (https://github.com/kushalamgowda/Disease-Detection.git)
cd Disease-Detection

Install NPM packages:

npm install

Set up your API Key:
The application is designed to use an API key provided by an environment variable. When running locally, you can create a .env file in the root of your project and add your key:

REACT_APP_GEMINI_API_KEY=YOUR_API_KEY_HERE

Then, you would need to modify the API_URL constant in src/App.jsx to use this variable.
Note: The current code expects the key to be injected during the build process. For local development, this is the easiest approach.

Run the application:

npm start

The app will open in your browser at http://localhost:3000.
