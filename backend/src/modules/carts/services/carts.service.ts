import { Op } from 'sequelize';
import sequelize from '../../../utils/database.ts';
import OutreachCart from '../models/outreach-cart.model.ts';
import OutreachProspecting from '../../prospecting/models/outreach-prospecting.model.ts';

const DEFAULT_PAGE_SIZE = 25;
const ALLOWED_ORDER_FIELDS = ['domain', 'similarity_score', 'added_at'] as const;
const ORDER_DIRECTIONS = ['ASC', 'DESC'] as const;

export interface GetCartsParams {
  page?: number | string;
  page_size?: number | string;
  domain?: string;
  order?: string;
}

export interface GetCartsResult {
  success: boolean;
  user_id: string;
  data: {
    items: Array<{
      id: number;
      session_id: string;
      domain: string;
      keywords: string | null;
      similarity_score: number | null;
      spider_id: number | null;
      campaign_id: number | null;
      added_at: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
      pageSize: number;
      totalAvailable: number;
    };
  };
}

const buildWhereClause = (
  queryParams: GetCartsParams,
  sessionId: string
): Record<string, unknown> => {
  const where: Record<string, unknown> = {
    session_id: sessionId,
  };

  if (queryParams.domain && String(queryParams.domain).trim()) {
    const domainVal = String(queryParams.domain).trim();
    // eslint-disable-next-line dot-notation
    where['domain'] = {
      [Op.like]: `%${domainVal}%`,
    };
  }

  return where;
};

const buildOrderClause = (queryParams: GetCartsParams): [string, string][] => {
  const defaultOrder: [string, string][] = [
    ['similarity_score', 'DESC'],
    ['id', 'ASC'],
  ];

  if (!queryParams.order) {
    return defaultOrder;
  }

  const orderParts = (queryParams.order as string).split(',');
  const field = orderParts[0];
  const direction = orderParts[1];

  if (
    field &&
    ALLOWED_ORDER_FIELDS.includes(field as (typeof ALLOWED_ORDER_FIELDS)[number]) &&
    direction &&
    ORDER_DIRECTIONS.includes(direction.toUpperCase() as (typeof ORDER_DIRECTIONS)[number])
  ) {
    const dir = direction.toUpperCase();
    if (field === 'id') {
      return [[field, dir]];
    }
    return [
      [field, dir],
      ['id', 'ASC'],
    ];
  }

  return defaultOrder;
};

/**
 * Get cart items with pagination, filtering, and ordering
 */
export const getCarts = async (
  queryParams: GetCartsParams,
  sessionId: string
): Promise<GetCartsResult> => {
  const { page = 1, page_size: pageSize = DEFAULT_PAGE_SIZE } = queryParams;

  const pageNum = parseInt(String(page), 10) || 1;
  const pageSizeNum = parseInt(String(pageSize), 10) || DEFAULT_PAGE_SIZE;
  const offset = (pageNum - 1) * pageSizeNum;

  const whereClause = buildWhereClause(queryParams, sessionId);
  const orderClause = buildOrderClause(queryParams);

  const { rows, count } = await OutreachCart.findAndCountAll({
    where: whereClause,
    order: orderClause,
    limit: pageSizeNum,
    offset,
    raw: true,
  });

  const totalAvailable = await OutreachCart.count({
    where: { session_id: sessionId },
  });

  const totalPages = Math.ceil(count / pageSizeNum) || 1;

  const items = rows.map((row: any) => ({
    id: row.id,
    session_id: row.session_id,
    domain: row.domain,
    keywords: row.keywords ?? null,
    similarity_score: row.similarity_score != null ? Number(row.similarity_score) : null,
    spider_id: row.spider_id ?? null,
    campaign_id: row.campaign_id != null ? Number(row.campaign_id) : null,
    added_at: row.added_at ? new Date(row.added_at).toISOString() : '',
  }));

  return {
    success: true,
    user_id: sessionId,
    data: {
      items,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords: count,
        pageSize: pageSizeNum,
        totalAvailable,
      },
    },
  };
};

const cleanDomain = (domain: string): string => {
  let cleaned = domain.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  const slash = cleaned.indexOf('/');
  if (slash !== -1) cleaned = cleaned.substring(0, slash);
  return cleaned.trim();
};

export interface ProcessCartsResult {
  success: boolean;
  skipped: number;
  inserted: number;
  insertedPerCampaign: Array<{ campaign_id: number; count: number }>;
}

/**
 * Process cart: move domains to prospecting, then clear cart.
 * Wrapped in a transaction; rolls back on any error.
 * Uses bulk lookup and bulk insert to avoid N+1.
 */
export const processCarts = async (sessionId: string): Promise<ProcessCartsResult> => {
  const transaction = await sequelize.transaction();

  try {
    const cartItems = await OutreachCart.findAll({
      where: { session_id: sessionId },
      raw: true,
      transaction,
    });

    const pairs = cartItems
      .map((item: { campaign_id?: number | null; domain: string }) => {
        const campaignId = item.campaign_id != null ? Number(item.campaign_id) : null;
        if (campaignId == null) return null;

        const domain = cleanDomain(item.domain);
        if (!domain) return null;

        return { domain, campaignId };
      })
      .filter((p): p is { domain: string; campaignId: number } => p != null);

    let existingSet = new Set<string>();
    if (pairs.length > 0) {
      const uniquePairs = Array.from(
        new Map(pairs.map(p => [`${p.domain}|${p.campaignId}`, p])).values()
      );

      const existing = (await OutreachProspecting.findAll({
        where: {
          [Op.or]: uniquePairs.map(p => ({ domain: p.domain, campaign_id: p.campaignId })),
        },
        attributes: ['domain', 'campaign_id'],
        raw: true,
        transaction,
      })) as Array<{ domain: string; campaign_id: number | null }>;
      existingSet = new Set(
        existing
          .map(e => (e.campaign_id != null ? `${e.domain}|${e.campaign_id}` : null))
          .filter(Boolean) as string[]
      );
    }

    const toInsertDeduplicated = new Map<string, { domain: string; campaignId: number }>();
    pairs.forEach(p => {
      const key = `${p.domain}|${p.campaignId}`;
      if (!existingSet.has(key)) {
        existingSet.add(key);
        toInsertDeduplicated.set(key, p);
      }
    });
    const toInsert = Array.from(toInsertDeduplicated.values());

    if (toInsert.length > 0) {
      await OutreachProspecting.bulkCreate(
        toInsert.map(p => ({
          domain: p.domain,
          campaign_id: p.campaignId,
          processing_status: 'pending' as const,
        })),
        { transaction }
      );
    }

    const inserted = toInsert.length;
    const skipped = cartItems.length - inserted;
    const insertedPerCampaignMap = new Map<number, number>();
    toInsert.forEach(p => {
      const prev = insertedPerCampaignMap.get(p.campaignId) ?? 0;
      insertedPerCampaignMap.set(p.campaignId, prev + 1);
    });
    const insertedPerCampaign = Array.from(insertedPerCampaignMap.entries()).map(([id, count]) => ({
      campaign_id: id,
      count,
    }));

    await OutreachCart.destroy({
      where: { session_id: sessionId },
      transaction,
    });

    await transaction.commit();

    return {
      success: true,
      skipped,
      inserted,
      insertedPerCampaign,
    };
  } catch (e) {
    await transaction.rollback();
    throw e;
  }
};

/**
 * Get cart count for a specific campaign and session
 * Only counts items where campaign_id matches and session_id matches
 * @param campaignId - Campaign ID
 * @param sessionId - Session ID (user ID)
 * @returns Count of cart items
 */
export const getCartCount = async (campaignId: number, sessionId: string): Promise<number> => {
  const count = await OutreachCart.count({
    where: {
      campaign_id: campaignId,
      session_id: sessionId,
    },
  });

  return count;
};
