import { GoogleGenerativeAI } from "@google/generative-ai";


// Replace this with the API key from .env
const API_KEY = "window.env.GOOGLE_API_KEY";  // correct this for linking the correct api key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to calculate and display the carbon footprint
window.calculateCarbonFootprint = function (event) {
  event.preventDefault(); // Prevent form submission

  const miles = parseFloat(document.getElementById("miles").value) || 0;
  const electricity =
    parseFloat(document.getElementById("electricity").value) || 0;
  const food = parseFloat(document.getElementById("food").value) || 0;

  // Example carbon emission factors (adjust as necessary)
  const emissions = {
    miles: miles * 0.404, // kg CO2 per mile (approximate)
    electricity: electricity * 0.92, // kg CO2 per kWh (approximate)
    food: food * 1.1, // kg CO2 per meat-based meal (approximate)
  };
  const totalEmissions =
    emissions.miles + emissions.electricity + emissions.food;

  // Display total emissions
  document.getElementById(
    "totalEmissions"
  ).innerHTML = `<strong>Total Emissions: ${totalEmissions.toFixed(
    2
  )} kg CO2</strong>`; // Added this line

  const data = {
    labels: ["🚗 Miles Driven", "💡 Electricity Used", "🍖 Meals (Meat-Based)"],
    datasets: [
      {
        label: "Carbon Emissions (kg)",
        data: [emissions.miles, emissions.electricity, emissions.food],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const config = {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const percentage = ((value / totalEmissions) * 100).toFixed(1);
              return `${label}: ${value.toFixed(2)} kg CO2 (${percentage}%)`;
            },
          },
        },
        legend: {
          labels: {
            generateLabels: function (chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map(function (label, i) {
                  const meta = chart.getDatasetMeta(0);
                  const style = meta.controller.getStyle(i);
                  const value = chart.data.datasets[0].data[i];
                  const percentage = ((value / totalEmissions) * 100).toFixed(
                    1
                  );
                  return {
                    text: `${label}: ${percentage}%`,
                    fillStyle: style.backgroundColor,
                    strokeStyle: style.borderColor,
                    lineWidth: style.borderWidth,
                    hidden:
                      isNaN(data.datasets[0].data[i]) || meta.data[i].hidden,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
      },
    },
  };

  new Chart(document.getElementById("carbonChart"), config);
};

// Handle analyze button click
window.analyzeCarbonFootprint = async function () {
  const miles = parseFloat(document.getElementById("miles").value) || 0;
  const electricity =
    parseFloat(document.getElementById("electricity").value) || 0;
  const food = parseFloat(document.getElementById("food").value) || 0;
  const chatWindow = document.getElementById("chatWindow");

  // Clear previous responses
  chatWindow.innerHTML = "";

  // Fetch chatbot response from Google Gemini API
  try {
    const response = await fetchChatbotResponse(miles, electricity, food);
    chatWindow.innerHTML += `<p><strong></strong></p><pre>${response}</pre>`;
  } catch (error) {
    chatWindow.innerHTML += `<p><strong>Chatbot:</strong> Error fetching response</p>`;
    console.error("Error fetching chatbot response:", error);
  }
};

// Function to fetch chatbot response from Google Gemini API
async function fetchChatbotResponse(miles, electricity, food) {
  const prompt = `Hello Google Gemini! I've been using the Carbon Footprint Calculator, and I'd like you to analyze my carbon emissions based on the following inputs:

  - **Miles Driven:** ${miles} miles (${(miles * 0.404).toFixed(2)} kg CO2)
  - **Electricity Usage:** ${electricity} kWh (${(electricity * 0.92).toFixed(
    2
  )} kg CO2)
  - **Meat-Based Meals:** ${food} meals (${(food * 1.1).toFixed(2)} kg CO2)

Please break down my carbon footprint, giving special attention to areas with higher emissions. Also, provide personalized, actionable recommendations to reduce my emissions in each category. I’d love the response to feel engaging and motivational, with fun emojis and clear, interactive steps that can help me improve my sustainability efforts.

Here’s the data you can work with:

1. **Transportation**: ${miles} miles, leading to ${(miles * 0.404).toFixed(
    2
  )} kg CO2. How can I make my commutes more eco-friendly?
2. **Electricity**: ${electricity} kWh, resulting in ${(
    electricity * 0.92
  ).toFixed(
    2
  )} kg CO2. What changes can I implement to reduce my electricity usage further?
3. **Food Choices**: ${food} meat-based meals, contributing ${(
    food * 1.1
  ).toFixed(
    2
  )} kg CO2. Can you suggest some simple dietary changes that can reduce this number?

In your response, please include engaging recommendations for each category, and don’t forget to emphasize the benefits of reducing my carbon footprint to combat climate change! Make it fun and interactive while keeping the recommendations clear and easy to implement.Also include my total carbon emmision value.

`;

  const result = await model.generateContent(prompt);
  return formatResponse(result.response.text());
}

// Function to format the chatbot response for clarity
function formatResponse(responseText) {
  return responseText
    .replace(/## /g, "") // Remove markdown headers
    .replace(/\*\*/g, "") // Remove bold formatting
    .replace(/\*/g, "- ") // Replace asterisk with dash for bullet points
    .trim(); // Trim whitespace
}

// Attach event listener to the "Analyze" button
document
  .getElementById("analyzeButton")
  .addEventListener("click", analyzeCarbonFootprint);

document
  .getElementById("calculateButton")
  .addEventListener("click", function () {
    // Scroll to the section with ID "graph"
    document.getElementById("graph").scrollIntoView({
      behavior: "smooth", // Enables smooth scrolling
    });
  });
