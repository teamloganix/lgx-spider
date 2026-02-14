import { Op, type WhereOptions } from 'sequelize';
import sequelize from '../../../utils/database.ts';
import OutreachEmail from '../models/outreach-email.model.ts';
import OutreachArchive from '../../archives/models/outreach-archive.model.ts';

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100, 200] as const;
const ORDER_FIELDS = [
  'domain',
  'campaign_name',
  'link_value',
  'verdict',
  'priority',
  'guest_posts',
  'domain_rating',
  'org_traffic',
  'org_keywords',
  'analyzed_at',
] as const;
const ORDER_DIRECTIONS = ['ASC', 'DESC'] as const;

export interface GetEmailsQuery {
  page?: number | string;
  page_size?: number | string;
  order?: string;
  search?: string;
  domain?: string;
  campaign?: string | string[];
  link_value?: string;
  verdict?: string | string[];
  priority?: string | string[];
  guest_posts?: string | string[];
  traffic?: string;
  keywords?: string;
  domain_rating?: string;
}

export interface EmailListItem {
  id: number;
  domain: string;
  campaign_name: string;
  analyzed_at: string | null;
  link_value: number | null;
  verdict: string;
  priority: string;
  guest_posts: string;
  contact_emails: string[];
  domain_rating: number | null;
  org_traffic: number | null;
  org_keywords: number | null;
  primary_email: string | null;
}

export interface GetEmailsListResult {
  success: true;
  data: {
    items: EmailListItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      pageSize: number;
      totalAvailable: number;
    };
  };
}

export interface GetFilterOptionsResult {
  success: true;
  data: {
    campaigns: string[];
    verdicts: string[];
    priorities: string[];
    guest_posts: string[];
  };
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
  const min = parseInt(parts[0]!, 10);
  const max = parseInt(parts[1]!, 10);
  if (Number.isNaN(min) || Number.isNaN(max) || min > max) return null;
  return { min, max };
}

function parseAnalysisJson(json: string | null): {
  link_value?: number | undefined;
  verdict?: string | undefined;
  priority?: string | undefined;
  guest_posts?: string | undefined;
  contact_emails?: string[] | undefined;
} {
  if (!json) return {};
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    const lb = data['link_building_recommendation'] as Record<string, unknown> | undefined;
    const gp = data['guest_post_analysis'] as Record<string, unknown> | undefined;
    const ca = data['contact_availability'] as Record<string, unknown> | undefined;
    const emailsFound = ca?.['emails_found'] as Record<string, unknown> | undefined;
    const actual = emailsFound?.['actual_emails'] as string[] | undefined;
    const overall = data['overall_link_value'];
    const verdictVal = lb?.['verdict'];
    const priorityVal = lb?.['outreach_priority'];
    const guestVal = gp?.['accepts_guest_posts'];
    return {
      link_value: typeof overall === 'number' ? overall : undefined,
      verdict: typeof verdictVal === 'string' ? verdictVal : undefined,
      priority: typeof priorityVal === 'string' ? priorityVal : undefined,
      guest_posts: typeof guestVal === 'string' ? guestVal : undefined,
      contact_emails: Array.isArray(actual) ? actual : undefined,
    };
  } catch {
    return {};
  }
}

function normalizeVerdict(outreachStatus: string | null, fromJson: string | undefined): string {
  if (outreachStatus === 'APPROVE' || outreachStatus === 'REJECT') return outreachStatus;
  const v = (fromJson ?? '').toUpperCase();
  if (v === 'APPROVE' || v === 'REJECT' || v === 'REVIEW') return v;
  return 'UNKNOWN';
}

function normalizeGuestPosts(accepts: number | null, fromJson: string | undefined): string {
  if (accepts === 1) return 'Yes';
  if (accepts === 0) return 'No';
  const s = (fromJson ?? '').toLowerCase();
  if (s === 'yes' || s === 'no') return s === 'yes' ? 'Yes' : 'No';
  return 'Unknown';
}

function buildWhereClause(query: GetEmailsQuery): WhereOptions {
  const where: WhereOptions = {};
  const andClauses: unknown[] = [];

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    where['domain'] = { [Op.like]: `%${search}%` };
  }

  const campaigns = toArray(query.campaign).filter(Boolean);
  if (campaigns.length > 0) {
    where['campaign_name'] = { [Op.in]: campaigns };
  }

  const linkRange = parseRange(query.link_value);
  if (linkRange) {
    const linkExpr =
      'COALESCE(`OutreachEmail`.`link_value_score`, ' +
      'CAST(JSON_UNQUOTE(JSON_EXTRACT(`OutreachEmail`.`analysis_json`, ' +
      "'$.overall_link_value')) AS UNSIGNED))";
    const linkBetween = `(${linkExpr} BETWEEN ${linkRange.min} AND ${linkRange.max})`;
    andClauses.push(sequelize.literal(linkBetween));
  }

  const verdicts = toArray(query.verdict)
    .map(v => v.toUpperCase())
    .filter(Boolean);
  if (verdicts.length > 0) {
    const allowedVerdicts = ['APPROVE', 'REJECT', 'REVIEW', 'UNKNOWN'];
    const safeVerdicts = verdicts.filter(v => allowedVerdicts.includes(v));
    const verdictExpr =
      'UPPER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`OutreachEmail`.`analysis_json`, ' +
      "'$.link_building_recommendation.verdict')), ''))";
    const conditions: unknown[] = safeVerdicts.map(v =>
      sequelize.literal(`${verdictExpr} = '${v}'`)
    );
    andClauses.push({ [Op.or]: conditions });
  }

  const priorities = toArray(query.priority).filter(Boolean);
  if (priorities.length > 0) {
    const allowed = ['Low', 'Medium', 'High'] as const;
    const valid = priorities.filter(p => allowed.includes(p as (typeof allowed)[number]));
    if (valid.length > 0) {
      where['outreach_priority'] = { [Op.in]: valid };
    }
  }

  const guestPosts = toArray(query.guest_posts)
    .map(g => g.toLowerCase())
    .filter(Boolean);
  if (guestPosts.length > 0) {
    const conditions: unknown[] = [];
    if (guestPosts.includes('yes')) conditions.push({ accepts_guest_posts: 1 });
    if (guestPosts.includes('no')) conditions.push({ accepts_guest_posts: 0 });
    if (guestPosts.includes('unknown')) conditions.push({ accepts_guest_posts: { [Op.is]: null } });
    if (conditions.length > 0) {
      andClauses.push({ [Op.or]: conditions });
    }
  }

  if (andClauses.length > 0) {
    (where as { [key: symbol]: unknown })[Op.and] = andClauses;
  }
  return where;
}

function buildOrderClause(
  orderParam: string | undefined
): [string | ReturnType<typeof sequelize.literal>, string][] {
  const defaultOrder: [string, string][] = [
    ['analyzed_at', 'DESC'],
    ['id', 'ASC'],
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
  if (field === 'domain_rating' || field === 'org_traffic' || field === 'org_keywords') {
    return [
      [sequelize.literal(`\`OutreachArchive\`.\`${field}\``), dir],
      ['id', 'ASC'],
    ];
  }
  if (field === 'link_value') {
    const linkOrderExpr =
      'COALESCE(`OutreachEmail`.`link_value_score`, ' +
      'CAST(JSON_UNQUOTE(JSON_EXTRACT(`OutreachEmail`.`analysis_json`, ' +
      "'$.overall_link_value')) AS UNSIGNED))";
    return [
      [sequelize.literal(linkOrderExpr), dir],
      ['id', 'ASC'],
    ];
  }
  if (field === 'priority') {
    return [
      ['outreach_priority', dir],
      ['id', 'ASC'],
    ];
  }
  if (field === 'guest_posts') {
    return [
      ['accepts_guest_posts', dir],
      ['id', 'ASC'],
    ];
  }
  if (field === 'verdict') {
    const verdictOrderExpr =
      'UPPER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(`OutreachEmail`.`analysis_json`, ' +
      "'$.link_building_recommendation.verdict')), ''))";
    return [
      [sequelize.literal(verdictOrderExpr), dir],
      ['id', 'ASC'],
    ];
  }
  return [
    [field, dir],
    ['id', 'ASC'],
  ];
}

function mapRowToItem(
  row: OutreachEmail & { OutreachArchive?: OutreachArchive | null }
): EmailListItem {
  const analysis = parseAnalysisJson(row.analysis_json);
  const archive = row.OutreachArchive as Record<string, unknown> | null | undefined;
  const linkValue = row.link_value_score ?? analysis.link_value ?? null;
  const verdict = normalizeVerdict(row.outreach_status, analysis.verdict);
  const priority = row.outreach_priority ?? analysis.priority ?? 'Unknown';
  const guestPosts = normalizeGuestPosts(row.accepts_guest_posts, analysis.guest_posts);
  const contactEmails = analysis.contact_emails ?? [];
  return {
    id: row.id,
    domain: row.domain,
    campaign_name: row.campaign_name,
    analyzed_at: row.analyzed_at ? new Date(row.analyzed_at).toISOString() : null,
    link_value: linkValue != null ? Number(linkValue) : null,
    verdict,
    priority: typeof priority === 'string' ? priority : 'Unknown',
    guest_posts: guestPosts,
    contact_emails: contactEmails,
    domain_rating: (archive ? archive['domain_rating'] : null) as number | null,
    org_traffic: (archive ? archive['org_traffic'] : null) as number | null,
    org_keywords: (archive ? archive['org_keywords'] : null) as number | null,
    primary_email: row.primary_email ?? null,
  };
}

/**
 * Get paginated list of outreach emails with filters, ordering, and archive metrics
 */
export async function getEmailsList(query: GetEmailsQuery): Promise<GetEmailsListResult> {
  const page = Math.max(1, parseInt(String(query.page ?? 1), 10) || 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(
    Number(query.page_size) as (typeof PAGE_SIZE_OPTIONS)[number]
  )
    ? Number(query.page_size)
    : DEFAULT_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  const whereClause = buildWhereClause(query);
  const orderClause = buildOrderClause(query.order);

  const trafficRange = parseRange(query.traffic);
  const keywordsRange = parseRange(query.keywords);
  const domainRatingRange = parseRange(query.domain_rating);

  const includeWhere: Record<string, unknown> = {};
  if (trafficRange) {
    includeWhere['org_traffic'] = { [Op.between]: [trafficRange.min, trafficRange.max] };
  }
  if (keywordsRange) {
    includeWhere['org_keywords'] = { [Op.between]: [keywordsRange.min, keywordsRange.max] };
  }
  if (domainRatingRange) {
    includeWhere['domain_rating'] = {
      [Op.between]: [domainRatingRange.min, domainRatingRange.max],
    };
  }
  const requireArchive =
    trafficRange !== null || keywordsRange !== null || domainRatingRange !== null;

  const include: Array<{
    model: typeof OutreachArchive;
    required: boolean;
    attributes: string[];
    where?: Record<string, unknown>;
  }> = [
    {
      model: OutreachArchive,
      required: requireArchive,
      attributes: ['domain_rating', 'org_traffic', 'org_keywords', 'original_prospecting_id'],
      ...(Object.keys(includeWhere).length > 0 ? { where: includeWhere } : {}),
    },
  ];

  const { rows, count } = await OutreachEmail.findAndCountAll({
    where: whereClause,
    include,
    order: orderClause,
    limit: pageSize,
    offset,
    attributes: { exclude: ['outreach_status'] },
  });

  const totalAvailable = await OutreachEmail.count();

  const items = (rows as (OutreachEmail & { OutreachArchive?: OutreachArchive | null })[]).map(
    mapRowToItem
  );
  const totalPages = Math.ceil(count / pageSize) || 1;

  return {
    success: true,
    data: {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: count,
        pageSize,
        totalAvailable,
      },
    },
  };
}

/**
 * Get filter options: distinct campaign names from outreach_emails + fixed verdicts, priorities, guest_posts
 */
export async function getFilterOptions(): Promise<GetFilterOptionsResult> {
  const campaigns = await OutreachEmail.findAll({
    attributes: ['campaign_name'],
    group: ['campaign_name'],
    order: [['campaign_name', 'ASC']],
    raw: true,
  });
  const campaignNames = (campaigns as { campaign_name: string }[])
    .map(c => c.campaign_name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return {
    success: true,
    data: {
      campaigns: campaignNames,
      verdicts: ['APPROVE', 'REJECT', 'REVIEW'],
      priorities: ['Low', 'Medium', 'High'],
      guest_posts: ['yes', 'no', 'unknown'],
    },
  };
}
