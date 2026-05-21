import db from '../../../database/index.js';

const TABLE = 'job_descriptions';

/**
 * Aggregate accessible job counts by industry per month.
 * Returns trend direction per industry based on last 2 months.
 */
export const getMarketTrends = async () => {
    const rows = await db.raw(
        `SELECT
       work_environment                                    AS industry,
       DATE_TRUNC('month', created_at)                    AS month,
       COUNT(*)::int                                       AS accessible_job_count
     FROM ${TABLE}
     WHERE accessibility_level IN ('AA', 'AAA')
       AND created_at >= NOW() - INTERVAL '6 months'
     GROUP BY work_environment, DATE_TRUNC('month', created_at)
     ORDER BY work_environment, month DESC`,
    ).then(r => r.rows);

    // Group by industry and compute trend from last 2 months
    const byIndustry = {};
    for (const row of rows) {
        const key = row.industry || 'other';
        if (!byIndustry[key]) byIndustry[key] = [];
        byIndustry[key].push({ month: row.month, count: row.accessible_job_count });
    }

    return Object.entries(byIndustry).map(([industry, months]) => {
        const [latest, prev] = months; // already sorted desc
        const trend =
      !prev ? 'stable' :
          latest.count > prev.count ? 'growing' :
              latest.count < prev.count ? 'declining' : 'stable';

        return {
            industry,
            trend,
            accessible_job_count: latest?.count ?? 0,
            month: latest?.month,
        };
    });
};
