(function () {
  const WC26 = window.WC26 || (window.WC26 = {});

  function ratedRows(rows) {
    return rows.filter((row) => row._ovr !== null);
  }

  function averageRating(rows) {
    const rated = ratedRows(rows);
    if (!rated.length) return null;
    return rated.reduce((sum, row) => sum + row._ovr, 0) / rated.length;
  }

  function medianRating(rows) {
    const ratings = ratedRows(rows).map((row) => row._ovr).sort((a, b) => a - b);
    if (!ratings.length) return null;
    const middle = Math.floor(ratings.length / 2);
    return ratings.length % 2 ? ratings[middle] : (ratings[middle - 1] + ratings[middle]) / 2;
  }

  function topElevenRating(rows) {
    const ratings = ratedRows(rows)
      .map((row) => row._ovr)
      .sort((a, b) => b - a)
      .slice(0, 11);
    if (!ratings.length) return { score: null, ratedCount: 0, complete: false };
    return {
      score: ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      ratedCount: ratings.length,
      complete: ratings.length >= 11
    };
  }

  function topRated(rows) {
    const rated = ratedRows(rows);
    if (!rated.length) return null;
    return [...rated].sort((a, b) => b._ovr - a._ovr || a.player.localeCompare(b.player))[0];
  }

  function countsBy(rows, key) {
    return rows.reduce((acc, row) => {
      const value = row[key] || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  function teamStats(team, rows) {
    const rated = ratedRows(rows);
    const top = topRated(rows);
    const strength = topElevenRating(rows);
    return {
      team,
      rows,
      count: rows.length,
      ratedCount: rated.length,
      average: averageRating(rows),
      strengthScore: strength.score,
      strengthRatedCount: strength.ratedCount,
      strengthComplete: strength.complete,
      median: medianRating(rows),
      top,
      stars85: rated.filter((row) => row._ovr >= 85).length,
      elite90: rated.filter((row) => row._ovr >= 90).length,
      positionCounts: countsBy(rows, "_position_group"),
      clubCountryCounts: countsBy(rows, "club_country"),
      topFive: [...rated].sort((a, b) => b._ovr - a._ovr || a.player.localeCompare(b.player)).slice(0, 5)
    };
  }

  WC26.Stats = {
    averageRating,
    countsBy,
    medianRating,
    ratedRows,
    teamStats,
    topElevenRating,
    topRated
  };
})();
