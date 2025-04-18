# Simple-Steps – Diabetes Management Platform 

----------------------------------
** Author: Haroun Kassouri
** Date: 24/11/2024
** Deployed Live Website: [simplesteps.pro](https://simplesteps.pro/)
----------------------------------

-------------------
Project Description
---------------------
Simple Steps is a full-stack diabetes management platform designed especially for older adults. It offers an accessible, web-based environment for tracking glucose levels, logging meals and exercise, and receiving personalised AI health recommendations — all within one integrated system.

By combining manual and CGM (Dexcom) tracking, real-time visual dashboards, a smart AI chatbot, and healthcare locator tools, the platform empowers diabetic users to independently manage their condition with greater clarity, control, and confidence.

-----------------
Key Objectives
-----------------
Provide a centralized digital tool to support self-management of diabetes
Enhance accessibility and ease-of-use for older adult users
Integrate AI and predictive modelling to deliver real-time, tailored insights
Link health metrics across glucose, nutrition, and activity for connected feedback
Maintain privacy, security, and individual data ownership



-------------
Main Features
-------------
Manual & Real-Time Glucose Monitoring
Manually log glucose readings or sync live CGM data from the Dexcom API.

Dashboard with Interactive Charts
Line and bar charts built using Chart.js allow users to view glucose trends across daily, weekly, and monthly views.

AI Chatbot
A context-aware assistant built using OpenAI, offering feedback based on real-time logs and user profile data.

Food & Exercise Logging
Log meals and workouts via searchable external APIs (FatSecret, API Ninjas) or manual entry, with dynamic calorie impact.

Calorie Goal Calculation
Daily goals calculated using BMR formulas based on profile data, automatically adjusted with every log.

Predictive Glucose Model
A client-side machine learning engine forecasts upcoming glucose values using polynomial regression.

Real-Time Alerts
In-app banners and browser notifications warn users of high/low glucose levels or risky predictions.

Secure Authentication & Profiles
Session-based login using hashed credentials and protected API routes. Each user's data is securely scoped to their session.

-------------
Tech Stack
-------------
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, MongoDB
Programming Language: JavaScript / TypeScript
Machine Learning: ml-regression-polynomial 
Visualisation: Chart.js
Deployment: Railway

APIs Used:
Dexcom Developer API (CGM glucose readings)
FatSecret API (nutrition search and food logging)
API Ninjas (exercise calorie calculations)
OpenAI API (chatbot intelligence)


----------------------
Future Improvements
----------------------
Add role-based access for clinicians or carers

Expand chatbot memory and context management

Integrate wearable fitness APIs (Fitbit, Google Fit)

Offline support via Progressive Web App (PWA)

----------------------
Setup and Installation
----------------------
# Ensure you have the following installed:
Node.js 
npm 

# Clone the repository:
git clone https://github.com/HarounHK/Simple-Steps.git

# Install Dependencies:
npm install

# Navigate to main directory:
cd simples-steps 

# Run this command to launch:
npm run dev  

Go to http://localhost:3000 to see the application

----------------------
# NPM Packages used 
----------------------
npm install next react react-dom
npm install bcryptjs mongoose
npm install openai
npm install axios
npm install ml-regression-polynomial
npm install chart.js react-chartjs-2
npm install tailwindcss postcss autoprefixer
npm install react-toastify
npm install cookie jsonwebtoken
npm install dayjs

----------------------
# Enviroment Variabes
----------------------
Create a .env.local file in the root directory and add the following enviorment variables. Fill in 'blank' wih your own keys
MONGODB_URI=blank
OPENAI_API_KEY=blank
FATSECRET_CLIENT_ID=blank
FATSECRET_CLIENT_SECRET=blank
DEXCOM_CLIENT_ID=blank
DEXCOM_CLIENT_SECRET=blank
DEXCOM_REDIRECT_URI=blank