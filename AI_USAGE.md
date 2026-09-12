# AI Usage Note

## Project: Market Hypothesis Lab

This document provides a transparent overview of how Artificial Intelligence (AI) tools were utilized during the design, development, and deployment of the **Market Hypothesis Lab**.

---

### 1. AI Tools & Models Utilized
- **Assistant / Environment**: Google Antigravity (Advanced Agentic Coding Assistant)
- **Core Models**: Gemini 2.5 / 3.0 series
- **Application**: Architectural pair-programming, boilerplate scaffolding, code generation, refactoring, and cloud deployment troubleshooting.

---

### 2. Areas Where AI Was Leveraged

#### A. Architecture & Scaffolding
- **Rapid Prototyping**: Generated initial project boilerplate for the full-stack architecture (React 18 + Vite frontend, Express.js backend, and pure `node-postgres` pool configuration).
- **Type/Interface Consistency**: Ensured schema alignment across PostgreSQL tables (`nifty_prices`, `experiments`, `results`) and corresponding REST API payloads.

#### B. Quantitative Logic & SQL Window Functions
- **Zero Look-Ahead Bias CTEs**: AI assisted in drafting PostgreSQL Common Table Expressions (CTEs) using `LAG()` for prior-day drops, `LEAD(open, 1)` for next-day open fills, and `LEAD(close, H)` for forward exits.
- **Baseline Computation**: Assisted in framing the unconditional benchmark query spanning every possible $H$-day holding period across the 20-year window.

#### C. Synthetic Data Generation
- **Historical Regime Simulation**: Developed the deterministic generation script (`generate_nifty_data.js`) to produce ~5,200 trading days (2005–2025) reflecting real-world market characteristics (2008 Lehman crash, 2020 COVID shock, bull rallies, and fat-tailed return distributions).

#### D. UI Design & Component Engineering
- **Component Styling**: Crafted modern Tailwind CSS styles, color tokens (slate/cyan/amber), glassmorphism cards, and interactive stage stepper transitions.
- **Data Visualization**: Configured Recharts bar charts and distribution graphs with custom tooltips and responsive containers.

#### E. Deployment & DevOps Debugging
- **Vercel & Render Integration**: Troubleshot edge cases in deployment, including Vercel SPA rewrite routing rules (`vercel.json`), Render PostgreSQL SSL connection strings, and automated database startup seeding.

---

### 3. Human Direction, Validation & Verification

While AI accelerated code authoring and debugging, core intellectual direction and domain validation remained strictly human-led:

1. **Financial Methodology & Bias Elimination**:
   - Strictly enforced that signals identified on day $T$ close cannot execute until day $T+1$ open, avoiding the common flaw of assuming unfillable same-day closing fills.
2. **Epistemological Design**:
   - Mandated the architectural separation in the **LEARN** stage between **"What the data shows"** (pure factual metrics) and **"What we can reasonably conclude"** (evidence grading + mandatory real-world caveats).
3. **Manual Code Review & Testing**:
   - Inspected SQL queries, verified mathematical returns calculations against manual sample trades, and confirmed database index performance.

---

### 4. Summary Reflection
The use of AI acted as a high-leverage force multiplier—accelerating iterative UI and backend development by ~4-5x while preserving rigorous architectural control, quantitative precision, and adherence to assignment requirements.
