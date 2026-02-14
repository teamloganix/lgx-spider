import { Op, type WhereOptions } from 'sequelize';
import sequelize from '../../../utils/database.ts';
import OutreachProspecting from '../../prospecting/models/outreach-prospecting.model.ts';
import OutreachArchive from '../../archives/models/outreach-archive.model.ts';
import OutreachSettings from '../../settings/models/outreach-settings.model.ts';
import OutreachGlobalBlacklist from '../../global-blacklist/models/outreach-global-blacklist.model.ts';
import type { ProcessingStatus } from '../../prospecting/models/outreach-prospecting.model.ts';

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;
const MAX_LIST_RECORDS = 500;
const ORDER_FIELDS = [
  'id',
  'domain',
  'campaign_name',
  'domain_rating',
  'org_traffic',
  'org_keywords',
  'org_cost',
  'paid_traffic',
  'paid_keywords',
  'paid_cost',
  'top_country',
  'top_traffic',
  'processing_status',
  'created_at',
  'updated_at',
] as const;
const ORDER_DIRECTIONS = ['ASC', 'DESC'] as const;
const PROCESSING_PAUSED_KEY = 'processing_paused';
const STATUSES: ProcessingStatus[] = ['pending', 'processing', 'completed', 'failed'];

export interface GetMetricsQuery {
  page?: number | string;
  page_size?: number | string;
  order?: string;
  search?: string;
  campaign?: string | string[];
  org_cost?: string;
  org_keywords?: string;
  org_traffic?: string;
  dr?: string;
  domain_rating?: string;
  paid_traffic?: string;
  paid_keywords?: string;
  paid_cost?: string;
  top_country?: string | string[];
  top_traffic?: string;
  status?: string | string[];
  processing_status?: string | string[];
  error?: string;
}

export interface MetricsListItem {
  id: number;
  domain: string;
  campaign_name: string;
  domain_rating: number | null;
  org_traffic: number | null;
  org_keywords: number | null;
  org_cost: number | null;
  paid_traffic: number | null;
  paid_keywords: number | null;
  paid_cost: number | null;
  top_country: string | null;
  top_traffic: number | null;
  processing_status: string;
  created_at: string;
  updated_at: string;
  error_message: string | null;
}

export interface GetMetricsListResult {
  success: true;
  data: {
    items: MetricsListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      pageSize: number;
      totalAvailable: number;
    };
  };
}

export interface GetMetricsStatsResult {
  success: true;
  data: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export interface GetMetricsFilterOptionsResult {
  success: true;
  data: {
    campaigns: string[];
    top_countries: string[];
    statuses: string[];
  };
}

export interface ToggleProcessingResult {
  success: true;
  paused: boolean;
  message: string;
}

export interface BlacklistProcessedResult {
  success: true;
  message: string;
  archived: number;
  blacklisted: number;
  removed: number;
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function parseRange(value: string | undefined): { min: number; max: number } | null {
  if (!value || typeof value !== 'string') return null;
  const parts = value
    .trim()
    .split(',')
    .map(p => p.trim());
  if (parts.length !== 2) return null;
  const min = parseFloat(parts[0]!);
  const max = parseFloat(parts[1]!);
  if (Number.isNaN(min) || Number.isNaN(max) || min > max) return null;
  return { min, max };
}

/** Extract top_country and top_traffic from org_traffic_top_by_country JSON [[ "code", traffic ], ...] */
function extractTopCountryAndTraffic(json: unknown): { top_country: string | null; top_traffic: number | null } {
  if (!json) return { top_country: null, top_traffic: null };
  try {
    const arr = Array.isArray(json) ? json : JSON.parse(String(json)) as unknown[];
    const first = arr?.[0];
    if (!Array.isArray(first) || first.length < 2) return { top_country: null, top_traffic: null };
    const code = first[0];
    const traffic = first[1];
    const country = typeof code === 'string' ? code.toUpperCase() : null;
    const num = typeof traffic === 'number' ? traffic : typeof traffic === 'string' ? parseInt(String(traffic), 10) : null;
    return {
      top_country: country ?? null,
      top_traffic: num != null && !Number.isNaN(num) ? num : null,
    };
  } catch {
    return { top_country: null, top_traffic: null };
  }
}

function buildWhereClause(query: GetMetricsQuery): WhereOptions {
  const where: WhereOptions = {};
  const andClauses: unknown[] = [];

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    where.domain = { [Op.like]: `%${search}%` };
  }

  const campaigns = toArray(query.campaign ?? query.campaign).filter(Boolean);
  if (campaigns.length > 0) {
    where.campaign_name = { [Op.in]: campaigns };
  }

  const statuses = toArray(query.status ?? query.processing_status)
    .map(s => s.toLowerCase())
    .filter(Boolean);
  if (statuses.length > 0) {
    const valid = statuses.filter(s => STATUSES.includes(s as ProcessingStatus));
    if (valid.length > 0) {
      where.processing_status = { [Op.in]: valid };
    }
  }

  const orgCostRange = parseRange(query.org_cost);
  if (orgCostRange) {
    where.org_cost = { [Op.between]: [orgCostRange.min, orgCostRange.max] };
  }
  const orgKeywordsRange = parseRange(query.org_keywords);
  if (orgKeywordsRange) {
    where.org_keywords = { [Op.between]: [orgKeywordsRange.min, orgKeywordsRange.max] };
  }
  const orgTrafficRange = parseRange(query.org_traffic);
  if (orgTrafficRange) {
    where.org_traffic = { [Op.between]: [orgTrafficRange.min, orgTrafficRange.max] };
  }
  const drRange = parseRange(query.dr ?? query.domain_rating);
  if (drRange) {
    where.domain_rating = { [Op.between]: [drRange.min, drRange.max] };
  }
  const paidTrafficRange = parseRange(query.paid_traffic);
  if (paidTrafficRange) {
    where.paid_traffic = { [Op.between]: [paidTrafficRange.min, paidTrafficRange.max] };
  }
  const paidKeywordsRange = parseRange(query.paid_keywords);
  if (paidKeywordsRange) {
    where.paid_keywords = { [Op.between]: [paidKeywordsRange.min, paidKeywordsRange.max] };
  }
  const paidCostRange = parseRange(query.paid_cost);
  if (paidCostRange) {
    where.paid_cost = { [Op.between]: [paidCostRange.min, paidCostRange.max] };
  }

  if (query.error === 'true' || query.error === '1') {
    andClauses.push({
      [Op.and]: [
        sequelize.where(sequelize.col('error_message'), { [Op.ne]: null }),
        sequelize.where(sequelize.col('error_message'), { [Op.ne]: '' }),
      ],
    });
  } else if (query.error === 'false' || query.error === '0') {
    andClauses.push({
      [Op.or]: [
        { error_message: null },
        { error_message: '' },
      ],
    });
  }

  const topCountries = toArray(query.top_country).map(c => String(c).toLowerCase()).filter(Boolean);
  if (topCountries.length > 0) {
    const safeCodes = topCountries.map(c => `'${String(c).replace(/'/g, "''")}'`);
    andClauses.push(
      sequelize.literal(
        `(${safeCodes.map(c => `JSON_SEARCH(org_traffic_top_by_country, 'one', ${c}, NULL, '$[*][0]') IS NOT NULL`).join(' OR ')})`
      )
    );
  }

  const topTrafficRange = parseRange(query.top_traffic);
  if (topTrafficRange) {
    andClauses.push(
      sequelize.literal(
        `(CAST(JSON_UNQUOTE(JSON_EXTRACT(org_traffic_top_by_country, '$[0][1]')) AS UNSIGNED) BETWEEN ${topTrafficRange.min} AND ${topTrafficRange.max})`
      )
    );
  }

  if (andClauses.length > 0) {
    (where as { [Op.and]?: unknown[] })[Op.and] = andClauses;
  }
  return where;
}

function buildOrderClause(
  orderParam: string | undefined
): [string | ReturnType<typeof sequelize.literal>, string][] {
  const defaultOrder: [string, string][] = [
    ['domain_rating', 'DESC'],
    ['created_at', 'DESC'],
  ];
  if (!orderParam || typeof orderParam !== 'string') return defaultOrder;
  const parts = orderParam
    .trim()
    .split(',')
    .map(p => p.trim());
  const field = parts[0];
  const direction = (parts[1] ?? 'DESC').toUpperCase();
  if (
    !field ||
    !ORDER_FIELDS.includes(field as (typeof ORDER_FIELDS)[number]) ||
    !ORDER_DIRECTIONS.includes(direction as (typeof ORDER_DIRECTIONS)[number])
  ) {
    return defaultOrder;
  }
  const dir = direction as 'ASC' | 'DESC';
  if (field === 'top_country') {
    return [
      [
        sequelize.literal(
          "UPPER(JSON_UNQUOTE(JSON_EXTRACT(org_traffic_top_by_country, '$[0][0]')))"
        ),
        dir,
      ],
      ['id', 'ASC'],
    ];
  }
  if (field === 'top_traffic') {
    return [
      [
        sequelize.literal(
          "CAST(JSON_UNQUOTE(JSON_EXTRACT(org_traffic_top_by_country, '$[0][1]')) AS UNSIGNED)"
        ),
        dir,
      ],
      ['id', 'ASC'],
    ];
  }
  return [
    [field, dir],
    ['id', 'ASC'],
  ];
}

function mapRowToItem(row: Record<string, unknown>): MetricsListItem {
  const json = row.org_traffic_top_by_country;
  const { top_country, top_traffic } = extractTopCountryAndTraffic(json);
  return {
    id: Number(row.id),
    domain: String(row.domain),
    campaign_name: String(row.campaign_name ?? ''),
    domain_rating: row.domain_rating != null ? Number(row.domain_rating) : null,
    org_traffic: row.org_traffic != null ? Number(row.org_traffic) : null,
    org_keywords: row.org_keywords != null ? Number(row.org_keywords) : null,
    org_cost: row.org_cost != null ? Number(row.org_cost) : null,
    paid_traffic: row.paid_traffic != null ? Number(row.paid_traffic) : null,
    paid_keywords: row.paid_keywords != null ? Number(row.paid_keywords) : null,
    paid_cost: row.paid_cost != null ? Number(row.paid_cost) : null,
    top_country,
    top_traffic,
    processing_status: String(row.processing_status ?? 'pending'),
    created_at: row.created_at ? new Date(row.created_at as Date).toISOString() : '',
    updated_at: row.updated_at ? new Date(row.updated_at as Date).toISOString() : '',
    error_message: row.error_message != null ? String(row.error_message) : null,
  };
}

/**
 * Get paginated list of outreach prospecting with filters, ordering, capped at 500 records total.
 */
export async function getMetricsList(query: GetMetricsQuery): Promise<GetMetricsListResult> {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10) || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(
    Number(query.page_size) as (typeof PAGE_SIZE_OPTIONS)[number]
  )
    ? Number(query.page_size)
    : DEFAULT_PAGE_SIZE;

  const whereClause = buildWhereClause(query);
  const orderClause = buildOrderClause(query.order);

  const totalAvailable = await OutreachProspecting.count({ where: whereClause });

  const allRows = await OutreachProspecting.findAll({
    where: whereClause,
    order: orderClause,
    limit: MAX_LIST_RECORDS,
    raw: true,
    attributes: [
      'id',
      'domain',
      'campaign_name',
      'domain_rating',
      'org_traffic',
      'org_keywords',
      'org_cost',
      'paid_traffic',
      'paid_keywords',
      'paid_cost',
      'org_traffic_top_by_country',
      'processing_status',
      'created_at',
      'updated_at',
      'error_message',
    ],
  });

  const totalRecords = (allRows as Record<string, unknown>[]).length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const start = (page - 1) * pageSize;
  const pageRows = (allRows as Record<string, unknown>[]).slice(start, start + pageSize);
  const items = pageRows.map(mapRowToItem);

  return {
    success: true,
    data: {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
        pageSize,
        totalAvailable,
      },
    },
  };
}

/**
 * Get aggregate stats by processing_status (no filters, full table).
 */
export async function getMetricsStats(): Promise<GetMetricsStatsResult> {
  const [rows] = await sequelize.query<Record<string, unknown>>(
    `SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN processing_status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN processing_status = 'processing' THEN 1 ELSE 0 END) AS processing,
      SUM(CASE WHEN processing_status = 'completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN processing_status = 'failed' THEN 1 ELSE 0 END) AS failed
    FROM outreach_prospecting`
  );

  const row = rows?.[0];
  const total = Number(row?.total ?? 0);
  const pending = Number(row?.pending ?? 0);
  const processing = Number(row?.processing ?? 0);
  const completed = Number(row?.completed ?? 0);
  const failed = Number(row?.failed ?? 0);

  return {
    success: true,
    data: { total, pending, processing, completed, failed },
  };
}

/**
 * Get filter options: distinct campaigns, top countries from JSON, fixed statuses.
 */
export async function getMetricsFilterOptions(): Promise<GetMetricsFilterOptionsResult> {
  const campaigns = await OutreachProspecting.findAll({
    attributes: ['campaign_name'],
    group: ['campaign_name'],
    order: [['campaign_name', 'ASC']],
    raw: true,
  });
  const campaignNames = (campaigns as { campaign_name: string }[])
    .map(c => c.campaign_name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  const allRows = await OutreachProspecting.findAll({
    attributes: ['org_traffic_top_by_country'],
    raw: true,
  });

  const countrySet = new Set<string>();
  for (const r of allRows as { org_traffic_top_by_country: unknown }[]) {
    const { top_country } = extractTopCountryAndTraffic(r.org_traffic_top_by_country);
    if (top_country) countrySet.add(top_country);
  }
  const top_countries = Array.from(countrySet).sort();

  return {
    success: true,
    data: {
      campaigns: campaignNames,
      top_countries,
      statuses: [...STATUSES],
    },
  };
}

/**
 * Toggle processing_paused in outreach_settings. Returns new paused state.
 */
export async function toggleProcessing(): Promise<ToggleProcessingResult> {
  const existing = await OutreachSettings.findOne({
    where: { setting_key: PROCESSING_PAUSED_KEY },
  });

  const currentPaused = existing ? existing.setting_value === '1' : false;
  const newPaused = !currentPaused;
  const value = newPaused ? '1' : '0';

  if (existing) {
    await existing.update({ setting_value: value });
  } else {
    await OutreachSettings.create({
      setting_key: PROCESSING_PAUSED_KEY,
      setting_value: value,
    });
  }

  return {
    success: true,
    paused: newPaused,
    message: newPaused
      ? 'Processing paused successfully'
      : 'Processing resumed successfully',
  };
}

/**
 * Get current processing paused state (for initial button state).
 */
export async function getProcessingPaused(): Promise<boolean> {
  const row = await OutreachSettings.findOne({
    where: { setting_key: PROCESSING_PAUSED_KEY },
  });
  return row ? row.setting_value === '1' : false;
}

/**
 * Blacklist processed domains: archive to outreach_archive, insert into outreach_global_blacklist, delete from outreach_prospecting.
 */
export async function blacklistProcessedDomains(
  domains: Array<{ id: number; domain: string }>
): Promise<BlacklistProcessedResult> {
  if (domains.length === 0) {
    return {
      success: true,
      message: 'No domains to blacklist',
      archived: 0,
      blacklisted: 0,
      removed: 0,
    };
  }

  const transaction = await sequelize.transaction();
  let archivedCount = 0;
  let blacklistedCount = 0;

  try {
    const ids = domains.map(d => d.id);
    const rows = await OutreachProspecting.findAll({
      where: { id: { [Op.in]: ids } },
      raw: true,
      transaction,
    });

    for (const row of rows as Record<string, unknown>[]) {
      await OutreachArchive.create(
        {
          original_prospecting_id: Number(row.id),
          domain: String(row.domain),
          campaign_name: String(row.campaign_name ?? ''),
          domain_rating: row.domain_rating != null ? Number(row.domain_rating) : null,
          org_traffic: row.org_traffic != null ? Number(row.org_traffic) : null,
          org_keywords: row.org_keywords != null ? Number(row.org_keywords) : null,
          org_cost: row.org_cost != null ? Number(row.org_cost) : null,
          paid_cost: row.paid_cost != null ? Number(row.paid_cost) : null,
          paid_keywords: row.paid_keywords != null ? Number(row.paid_keywords) : null,
          paid_traffic: row.paid_traffic != null ? Number(row.paid_traffic) : null,
          org_traffic_top_by_country:
            row.org_traffic_top_by_country != null
              ? typeof row.org_traffic_top_by_country === 'string'
                ? row.org_traffic_top_by_country
                : JSON.stringify(row.org_traffic_top_by_country)
              : null,
          processing_status: (row.processing_status as string) ?? 'completed',
          error_message: row.error_message != null ? String(row.error_message) : null,
          original_created_at: row.created_at ? new Date(row.created_at as Date) : null,
          original_updated_at: row.updated_at ? new Date(row.updated_at as Date) : null,
        },
        { transaction }
      );
      archivedCount++;
    }

    for (const d of domains) {
      const [_, created] = await OutreachGlobalBlacklist.findOrCreate({
        where: { domain: d.domain },
        defaults: { domain: d.domain },
        transaction,
      });
      if (created) blacklistedCount++;
    }

    const removedCount = await OutreachProspecting.destroy({
      where: { id: { [Op.in]: ids } },
      transaction,
    });

    await transaction.commit();

    return {
      success: true,
      message: `Successfully archived ${archivedCount} records, blacklisted ${blacklistedCount} domains, and removed ${removedCount} records from prospecting`,
      archived: archivedCount,
      blacklisted: blacklistedCount,
      removed: removedCount,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
