export function buildMissingIndex(items: any[]) {
  const summary = {
    primaryMissing: 0,
    logoMissing: 0,
    thumbMissing: 0,
    bannerMissing: 0,
    discMissing: 0,

    backdropBuckets: {
      "0": 0,
      "1-5": 0,
      "6-10": 0,
      "11-20": 0,
      "20+": 0,
    },
  };

  const groups: Record<string, any[]> = {
    primaryMissing: [],
    logoMissing: [],
    thumbMissing: [],
    bannerMissing: [],
    discMissing: [],
    backdrop_0: [],
    backdrop_1_5: [],
    backdrop_6_10: [],
    backdrop_11_20: [],
    backdrop_20_plus: [],
  };

  for (const item of items) {
    const img = item.ImageTags || {};
    const backdrops = item.BackdropImageTags?.length ?? 0;

    if (!img.Primary) {
      summary.primaryMissing++;
      groups.primaryMissing.push(item);
    }

    if (!img.Logo) {
      summary.logoMissing++;
      groups.logoMissing.push(item);
    }

    if (!img.Thumb) {
      summary.thumbMissing++;
      groups.thumbMissing.push(item);
    }

    if (!img.Banner) {
      summary.bannerMissing++;
      groups.bannerMissing.push(item);
    }

    if (!img.Disc) {
      summary.discMissing++;
      groups.discMissing.push(item);
    }

    if (backdrops === 0) {
      summary.backdropBuckets["0"]++;
      groups.backdrop_0.push(item);
    } else if (backdrops <= 5) {
      summary.backdropBuckets["1-5"]++;
      groups.backdrop_1_5.push(item);
    } else if (backdrops <= 10) {
      summary.backdropBuckets["6-10"]++;
      groups.backdrop_6_10.push(item);
    } else if (backdrops <= 20) {
      summary.backdropBuckets["11-20"]++;
      groups.backdrop_11_20.push(item);
    } else {
      summary.backdropBuckets["20+"]++;
      groups.backdrop_20_plus.push(item);
    }
  }

  return { summary, groups };
}