# DetailPace Metrics & Analytics Guide (`PaceStats`)

This document explains how the **Metrics** page (`src/components/pace/pace-stats.tsx` and `src/lib/pace/stats.ts`) calculates turnaround performance, how **Target Est.** is derived, and what each section of the dashboard tells you.

---

## 1. Fixed Service Time vs. Dynamic Group "Target Est."

Every service tier has a **fixed baseline target time** defined in `src/lib/pace/services.ts`:

| Service Tier | Target Duration | Target in Seconds |
| :--- | :--- | :--- |
| **Delivery Prep** | `1h 00m` | `3,600s` |
| **Quick Detail** | `2h 00m` | `7,200s` |
| **Full Detail** | `4h 00m` | `14,400s` |
| **Ceramic Coating** | `8h 00m` | `28,800s` |

When looking at a **single service** (such as in the charts or the bottom matrix table), the **Target Benchmark** is simply that fixed standard (1h, 2h, 4h, or 8h).

However, when looking at **Fleet Turnaround Average** (KPI Card 1) or **Vehicle Classification Benchmarks** (`New`, `Used`, `Demo` cards), those groups contain a **mix of different services**. To provide a fair, apples-to-apples comparison, the system calculates **Target Est.** as the **weighted average of the service estimates for the completed vehicles in that specific group**:

```text
Target Est. = (Sum of target times for each completed vehicle's assigned service)
              ÷ (Total completed vehicles in that group)
```

### Example
* Suppose you have completed **2 New Vehicles**—one had a *Delivery Prep* (`1h` target) and one had a *Full Detail* (`4h` target). The **Target Est.** for **New Vehicles** will show **`2h 30m`** (`(1h + 4h) ÷ 2`).
* If your **Used Vehicles** mostly received *Full Details* (`4h`) and *Ceramic Coatings* (`8h`), the **Target Est.** for Used Vehicles will automatically adjust upward to reflect that heavier service workload mix.

---

## 2. How Metrics Are Calculated Under the Hood

1. **Data Source & Caching**
   * The page fetches all vehicles from the `vehicles` table (`status`, `type`, `net_work_seconds`, `service_type`) and caches the calculated result in `localStorage` (`detailtrack_stats_cache`) so the dashboard loads immediately and updates whenever jobs change or when you click **Recalculate**.
2. **Completed Jobs Only for Timing**
   * Only vehicles with status **`Completed`** (and `net_work_seconds > 0`) are used to calculate average durations, target estimates, and variance percentages so in-progress timers do not skew historical averages.
   * **Net Work Seconds (`net_work_seconds`)** measures actual active detailing time (excluding time when a job was paused).
3. **Variance Formula**
   * **Variance Seconds:** `Actual Avg Seconds - Target Est. Seconds`
   * **Variance Percentage:** `((Actual Avg - Target Est.) / Target Est.) × 100`
   * **Negative (`-`) / Emerald ("Faster" / "Ahead"):** Your team is finishing faster than the estimated benchmark.
   * **Positive (`+`) / Amber ("Over Target"):** Jobs are taking longer than the estimated benchmark.

---

## 3. Section-by-Section Dashboard Breakdown

### A. Top 3 KPI Summary Cards

1. **Fleet Turnaround Average**
   * **What it shows:** The overall average active work time across *all* completed vehicles compared against the **Target Standard** (the average target time of all completed jobs).
   * **What it tells you:** Whether your shop as a whole is pacing ahead of or behind your service estimates, and by how much time/percentage.
2. **Benchmark Adherence**
   * **What it shows:** How many individual completed vehicles finished at or under their specific service's target time (`net_work_seconds <= service estimatedSeconds`), expressed as a count (e.g., `14 / 20`) and an **Efficiency Index %**.
   * **Fastest / Longest Class:** Identifies which vehicle condition (`New`, `Used`, or `Demo`) has the shortest and longest average turnaround time.
3. **Fleet Throughput**
   * **What it shows:** Total completed vehicles vs. total vehicles in the database, how many vehicles are currently active/in-bay, overall completion percentage, and a color-coded bar showing the inventory split between `New`, `Used`, and `Demo` vehicles.

---

### B. Vehicle Classification Benchmarks (New vs. Used vs. Demo)

* **What it shows:** Three dedicated cards breaking down performance by vehicle inventory condition (`New`, `Used`, `Demo`).
* **Metrics per card:**
  * **Average Duration:** Actual average detailing time for completed vehicles of that type.
  * **Target Est.:** The average benchmark expected for those completed vehicles based on the services they received.
  * **Variance Bar & %:** Whether that specific class of vehicle is running faster or slower than its service mix target.
  * **Classification Volume:** What percentage of that vehicle class's total inventory has been completed (`completed / total`).
* **What it tells you:** Helps identify if, for example, *Used* cars consistently run over target on the same services where *New* cars finish ahead of target.

---

### C. Interactive Comparative Bar Chart (3 View Modes)

You can toggle the chart units between **Hours** and **Minutes** at the top right of the page, and switch between three analytical views:

1. **By Service Tier**
   * Groups bars by service (*Full Detail*, *Ceramic Coating*, *Quick Detail*, *Delivery Prep*).
   * Compares the gray **Target Benchmark** bar directly against the actual averages for **New**, **Used**, and **Demo** vehicles side-by-side.
2. **By Vehicle Classification**
   * Groups bars by vehicle type (*New*, *Used*, *Demo*) so you can compare how long each of the 4 services takes within a single vehicle category.
3. **Actual vs. Benchmark**
   * Strips out the vehicle types and gives a clean 1-to-1 comparison of the **Standard Target Benchmark** vs. **Actual Average Time** for each of the 4 service tiers.

---

### D. Full Detailing Matrix & Pacing Variance (Bottom Table)

* **What it shows:** A complete cross-tabulation table where each row is a **Service Tier** and the columns display:
  1. **Target Benchmark:** The fixed standard time for that service (`04:00:00`, `08:00:00`, etc.).
  2. **New / Used / Demo Vehicle Avg:** The average time and vehicle count `(n)` for each intersection of Service + Vehicle Type.
  3. **Overall Actual:** The combined average time across all vehicle types for that service.
  4. **Performance Status:** A badge showing whether that service tier is overall **Ahead** (green) or **Over** (amber) its target benchmark.
* **What it tells you:** Which specific service tiers are accurately estimated and which ones may need their standard time targets adjusted or operational bottlenecks addressed.
