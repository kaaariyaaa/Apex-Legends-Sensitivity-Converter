import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { readFile, writeFile } from 'node:fs/promises';

const propertyId = process.env.GA4_PROPERTY_ID;
const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!propertyId || !credentials) {
  console.info('Skipping preset ranking update: GA4 credentials are not configured.');
  process.exit(0);
}

const client = new BetaAnalyticsDataClient({ credentials: JSON.parse(credentials) });
const [report] = await client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{ startDate: '31daysAgo', endDate: '2daysAgo' }],
  dimensions: [{ name: 'customEvent:preset_id' }],
  metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }],
  dimensionFilter: {
    filter: { fieldName: 'eventName', stringFilter: { matchType: 'EXACT', value: 'preset_used' } }
  },
  orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
  limit: 50
});

const presets = JSON.parse(await readFile(new URL('../src/data/presets.json', import.meta.url), 'utf8'));
const known = new Set(presets.map(({ id }) => id));
const rankings = (report.rows ?? [])
  .map((row) => ({ id: row.dimensionValues[0].value, users: Number(row.metricValues[0].value), uses: Number(row.metricValues[1].value) }))
  .filter(({ id }) => known.has(id));
const output = { updatedAt: new Date().toISOString(), period: '過去30日（2日前まで）', rankings };
await writeFile(new URL('../public/data/preset-rankings.json', import.meta.url), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Updated ${rankings.length} preset rankings.`);
