# Supply Chain Optimization Platform

SCOP is a smart analytics tool designed to enhance industrial efficiency by providing powerful, data-driven solutions for supply chain management. This platform helps businesses make smarter decisions through intuitive and accessible modules for inventory optimization and load balancing.

**Live Project Link:** [https://cogni-haka.vercel.app/](https://cogni-haka.vercel.app/)



## 🌟 Features

SCOP is composed of two primary modules:

### 📦 P1: Inventory Optimization
This module helps businesses maintain optimal inventory levels, reducing carrying costs and preventing stockouts.

* **Demand Forecasting:** Analyzes historical data to predict future demand accurately.
* **Optimal Stock Calculation:** Recommends the ideal amount of stock to order by considering lead times, demand variability, and service level targets.
* **Safety Stock Analysis:** Calculates the necessary buffer stock to mitigate risks from demand spikes and supply chain disruptions.
* **Supplier Insights:** Incorporates supplier reliability scores for smarter, risk-aware procurement decisions.
* **Advanced Constraints:** The optimizer respects crucial business rules like factory stock capacity and supplier Minimum Order Quantities (MOQ).

### ⚖️ E1: Packing Station Load Balancer
This module ensures an even distribution of workloads across all packing stations in a warehouse, eliminating bottlenecks and maximizing efficiency.

* **Workload Distribution:** Evenly assigns orders to packing stations to prevent individual stations from being overwhelmed.
* **Efficiency Boost:** Minimizes idle time for workers and ensures a smooth, continuous packing process.
* **Reduced Delays:** Helps in meeting shipping deadlines by preventing packing bottlenecks.



## 🛠️ Tech Stack

The platform is built with a modern and robust tech stack:

* **Frontend:**
    * React
    * TypeScript
* **Backend:**
    * FastAPI
* **Deployment:**
    * **Frontend:** Vercel
    * **Backend:** Render



## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
* Node.js and npm
* Python 3.8+ and pip

### Installation

1.  **Clone the repo**
    ```sh
    git clone https://github.com/Mazen-Ahmad/CogniHaka.git
    cd CogniHaka
    ```

2.  **Setup the Backend (`cog-back`)**
    ```sh
    cd cog-back
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```
    The backend server will start on `http://127.0.0.1:8000`.

3.  **Setup the Frontend (`cog-front`)**
    ```sh
    cd ../cog-front
    npm install
    npm run dev
    ```
    The frontend development server will start on `http://localhost:5173`.



## USAGE

Once the application is running locally, you can start using its features:

1.  Navigate to the **Inventory Optimizer** or **Packing Station Load Balancer** section.
2.  Upload your data using the provided CSV uploaders. You can use the sample CSV files located in the `cog-front/public/` directory to see the expected format.
    * `sample_inventory.csv`
    * `sample_orders.csv`
3.  Adjust the input parameters as needed (e.g., service level, lead time).
4.  Click the "Run" or "Optimize" button to process the data.
5.  The results will be displayed in interactive charts and tables, along with AI-powered insights.
