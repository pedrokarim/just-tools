import { prisma } from "./prisma";

export interface PageViewData {
  pagePath: string;
  userAgent?: string;
  ipAddress?: string;
  fingerprint?: string;
  country?: string;
  city?: string;
}

export async function recordPageView(data: PageViewData) {
  try {
    // Enregistrer la vue de page
    await prisma.pageView.create({
      data: {
        pagePath: data.pagePath,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        fingerprint: data.fingerprint,
        country: data.country,
        city: data.city,
      },
    });

    // Mettre à jour ou créer l'enregistrement de visiteur unique
    if (data.fingerprint) {
      await prisma.uniqueVisitor.upsert({
        where: { fingerprint: data.fingerprint },
        update: {
          lastVisit: new Date(),
          visitCount: {
            increment: 1,
          },
        },
        create: {
          fingerprint: data.fingerprint,
          firstVisit: new Date(),
          lastVisit: new Date(),
          visitCount: 1,
        },
      });
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de la vue de page:", error);
  }
}

export async function getAnalyticsStats() {
  try {
    // Calculer les statistiques de base
    const totalViews = Number(await prisma.pageView.count());
    const uniqueVisitors = Number(await prisma.uniqueVisitor.count());

    // Calculer les vues des dernières 24h
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const last24hViews = Number(
      await prisma.pageView.count({
        where: {
          timestamp: {
            gte: last24h,
          },
        },
      })
    );

    // Calculer les nouveaux visiteurs des dernières 24h
    const last24hNewVisitors = Number(
      await prisma.uniqueVisitor.count({
        where: {
          firstVisit: {
            gte: last24h,
          },
        },
      })
    );

    // Vues par page (top 10)
    const viewsByPage = (await prisma.$queryRaw`
      SELECT pagePath, CAST(COUNT(*) AS INTEGER) as count
      FROM pageView
      GROUP BY pagePath
      ORDER BY count DESC
      LIMIT 10
    `) as Array<{ pagePath: string; count: number }>;

    // Vues par heure des dernières 24h
    const viewsByHour = (await prisma.$queryRaw`
      WITH hours AS (
        SELECT 0 as hour UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12 UNION ALL SELECT 13 UNION ALL SELECT 14 UNION ALL SELECT 15 UNION ALL SELECT 16 UNION ALL SELECT 17 UNION ALL SELECT 18 UNION ALL SELECT 19 UNION ALL SELECT 20 UNION ALL SELECT 21 UNION ALL SELECT 22 UNION ALL SELECT 23
      ),
      views_by_hour AS (
        SELECT 
          CAST(strftime('%H', datetime(timestamp)) AS INTEGER) as hour,
          CAST(COUNT(*) AS INTEGER) as count
        FROM pageView
        WHERE datetime(timestamp) >= datetime('now', '-24 hours')
        GROUP BY strftime('%H', datetime(timestamp))
      )
      SELECT 
        CAST(hours.hour AS TEXT) as hour,
        CAST(COALESCE(views_by_hour.count, 0) AS INTEGER) as count
      FROM hours
      LEFT JOIN views_by_hour ON hours.hour = views_by_hour.hour
      ORDER BY hours.hour
    `) as Array<{ hour: string; count: number }>;

    return {
      totalViews,
      uniqueVisitors,
      last24hViews,
      last24hNewVisitors,
      viewsByPage: viewsByPage.map((item) => ({
        pagePath: item.pagePath,
        count: item.count,
      })),
      viewsByHour: viewsByHour.map((item) => ({
        hour: item.hour,
        count: item.count,
      })),
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      last24hViews: 0,
      last24hNewVisitors: 0,
      viewsByPage: [],
      viewsByHour: [],
    };
  }
}

export async function getUniqueVisitors() {
  try {
    const visitors = await prisma.uniqueVisitor.findMany({
      orderBy: {
        lastVisit: "desc",
      },
      take: 50,
    });

    return visitors.map((visitor) => ({
      fingerprint: visitor.fingerprint,
      firstVisit: visitor.firstVisit,
      lastVisit: visitor.lastVisit,
      visitCount: visitor.visitCount,
    }));
  } catch (error) {
    console.error("Erreur lors de la récupération des visiteurs:", error);
    return [];
  }
}

export async function clearAnalytics() {
  try {
    await prisma.pageView.deleteMany();
    await prisma.uniqueVisitor.deleteMany();
    return { success: true };
  } catch (error) {
    console.error("Erreur lors du nettoyage des analytics:", error);
    return { success: false, error: error.message };
  }
}

export async function exportAnalytics() {
  try {
    const pageViews = await prisma.pageView.findMany({
      orderBy: {
        timestamp: "desc",
      },
    });

    const uniqueVisitors = await prisma.uniqueVisitor.findMany({
      orderBy: {
        lastVisit: "desc",
      },
    });

    return {
      pageViews,
      uniqueVisitors,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Erreur lors de l'export des analytics:", error);
    return null;
  }
}
