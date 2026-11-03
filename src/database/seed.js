export async function seedIfEmpty(db) {
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM titles');
  if (row.count > 0) return; // data already added, do nothing

  // Two movies
  await db.runAsync(
    'INSERT INTO titles (type, title, year, genre, description, duration_min) VALUES (?, ?, ?, ?, ?, ?)',
    ['movie', 'Inception', 2010, 'Sci-Fi', 'A thief enters dreams to steal secrets.', 148]
  );
  await db.runAsync(
    'INSERT INTO titles (type, title, year, genre, description, duration_min) VALUES (?, ?, ?, ?, ?, ?)',
    ['movie', 'The Dark Knight', 2008, 'Action', 'Batman faces the Joker in Gotham.', 152]
  );

  // One series with 2 seasons
  const series = await db.runAsync(
    'INSERT INTO titles (type, title, year, genre, description) VALUES (?, ?, ?, ?, ?)',
    ['series', 'Breaking Bad', 2008, 'Drama', 'A teacher turns to making drugs.']
  );
  const seriesId = series.lastInsertRowId;

  const episodeCounts = [7, 13]; // season 1 has 7 episodes, season 2 has 13
  for (let s = 0; s < episodeCounts.length; s++) {
    const season = await db.runAsync(
      'INSERT INTO seasons (title_id, season_number, episode_count) VALUES (?, ?, ?)',
      [seriesId, s + 1, episodeCounts[s]]
    );
    for (let e = 1; e <= episodeCounts[s]; e++) {
      await db.runAsync(
        'INSERT INTO episodes (season_id, episode_number) VALUES (?, ?)',
        [season.lastInsertRowId, e]
      );
    }
  }
}