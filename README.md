# Adaptive Fraud Intelligence System

A hackathon-ready, real-time adaptive fraud detection system designed to distinguish legitimate high-volume transaction surges (e.g. flash sales, holidays) from suspicious high-velocity activity (e.g. credential stuffing, bot attacks).

---

## System Architecture Pipeline

```text
Historical Dataset (Time, V1–V28, Amount)
       ↓
Preprocessing & Feature Engineering
       ↓
ML Fraud Detection Engine (Random Forest)
       ↓
Temporal & Surge Intelligence
       ↓
Risk Fusion Engine
       ↓
Decision Engine (ALLOW / REVIEW / BLOCK)
       ↓
FastAPI Backend Services
       ↓
React Cyber Banking Dashboard
```

---

## Dataset Configuration & Handling

The system strictly adheres to the authentic credit card fraud dataset schema:
* **Time**: Elapsed time in seconds from initial transaction.
* **V1 – V28**: Anonymized numerical features derived from PCA.
* **Amount**: Transaction monetary value.
* **Class**: Historical target (`0` = Legitimate, `1` = Fraudulent).

> **IMPORTANT**: The dataset does **not** contain customer names, IDs, merchant IDs, account numbers, IP addresses, or device IDs. The system does not invent or fabricate PII fields.

### Dataset Environment Variables
To train on or run against the full dataset (e.g., `creditcard.csv`), configure the environment variable:

```bash
export DATASET_PATH=/path/to/full_dataset.csv
```

When `DATASET_PATH` is not set, the application automatically defaults to the development sample dataset located at `data/sample_transactions.csv`.

---

## Team Module Ownership

Designed for modular development across four engineers:

| Member / Role | Module Folder | Key Responsibilities |
| :--- | :--- | :--- |
| **Member 1** — ML Fraud Detection | `ml/` | Data validation, missing value checks, preprocessing, model training, evaluation metrics calculation, and prediction interface. |
| **Member 2** — Temporal Intelligence | `intelligence/` | Time-delta calculations, rolling velocity tracking, historical baseline estimation, surge multiplier calculation, and temporal anomaly scoring. |
| **Member 3** — Backend & Risk Engine | `backend/` | FastAPI REST endpoints, Pydantic request/response schemas, Risk Fusion scoring, Decision Engine threshold logic, and explanation generation. |
| **Member 4** — Frontend & Dashboard | `frontend/` | React dashboard UI, Lucide icon design, Recharts data visualization, real-time simulation controls, and transaction detail drawer. |

---

## Installation & Setup

### Prerequisites
* Python 3.10+
* Node.js 18+ and `npm`

### 1. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train ML Model
Train the Random Forest model on your target dataset (defaults to sample data or `DATASET_PATH` if specified):
```bash
PYTHONPATH=. python3 ml/train.py
```

### 3. Install Frontend Dependencies
```bash
cd frontend
npm install
```

---

## Running the Application

### Start FastAPI Backend Server
```bash
PYTHONPATH=. uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
API Documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### Start Frontend React Development Dashboard
```bash
cd frontend
npm run dev
```
Dashboard will be available at: [http://localhost:3000](http://localhost:3000)

---

## Running Tests

Run the automated test suite covering ML prediction, temporal algorithms, backend API endpoints, and decision engine logic:

```bash
PYTHONPATH=. pytest
```

---

## Demo Scenarios

The dashboard includes a real-time transaction simulator supporting 3 core demonstration scenarios:

1. **Scenario 1: Normal Transaction Activity**
   * Normal velocity (~15 tx/min baseline)
   * Low fraud probabilities
   * System Decision: **ALLOW**

2. **Scenario 2: Legitimate High-Volume Surge (Flash Sale)**
   * High velocity & surge multiplier (&gt;3x baseline)
   * Low fraud probabilities (clean V1–V28 vectors)
   * System Decision: **ALLOW** with adaptive threshold dampening

3. **Scenario 3: Suspicious High-Velocity Activity**
   * High velocity & surge multiplier
   * Elevated fraud probabilities (anomalous V12, V14, V17 features)
   * System Decision: **REVIEW** or **BLOCK** with automated explanation reasons
