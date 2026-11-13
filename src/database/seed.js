const MOVIES = [
  // [title, year, genre, duration_min, description]
  ['Inception', 2010, 'Sci-Fi', 148, 'A thief who steals secrets from dreams takes on one last impossible job.'],
  ['The Dark Knight', 2008, 'Action', 152, 'Batman faces a chaotic criminal who pushes Gotham to its limits.'],
  ['Interstellar', 2014, 'Sci-Fi', 169, 'Astronauts travel through a wormhole to find a new home for humanity.'],
  ['The Matrix', 1999, 'Sci-Fi', 136, 'A hacker discovers that his world is a simulation controlled by machines.'],
  ['Gladiator', 2000, 'Action', 155, 'A betrayed Roman general fights his way through the arena for revenge.'],
  ['Avengers: Endgame', 2019, 'Action', 181, 'The surviving heroes attempt a final plan to undo a universe-wide disaster.'],
  ['Mad Max: Fury Road', 2015, 'Action', 120, 'A drifter and a rebel driver flee a tyrant across a desert wasteland.'],
  ['The Shawshank Redemption', 1994, 'Drama', 142, 'A wrongly convicted banker finds hope and friendship inside prison.'],
  ['Forrest Gump', 1994, 'Drama', 142, 'A kind-hearted man unknowingly shapes several defining moments of his era.'],
  ['Parasite', 2019, 'Thriller', 132, 'A poor family slowly infiltrates the life of a wealthy household.'],
  ['Se7en', 1995, 'Thriller', 127, 'Two detectives hunt a killer whose crimes follow a disturbing pattern.'],
  ['The Godfather', 1972, 'Crime', 175, 'The aging head of a crime family hands control to his reluctant son.'],
  ['Pulp Fiction', 1994, 'Crime', 154, 'Interlinked stories of criminals unfold out of order in Los Angeles.'],
  ['Spirited Away', 2001, 'Animation', 125, 'A girl must work in a spirit bathhouse to rescue her parents.'],
  ['Toy Story', 1995, 'Animation', 81, 'A cowboy doll feels threatened when a new space toy joins the room.'],
  ['The Lion King', 1994, 'Animation', 88, 'A young lion prince flees his kingdom, then returns to claim his place.'],
  ['Superbad', 2007, 'Comedy', 113, 'Two friends chase one wild night before they graduate high school.'],
  ['The Grand Budapest Hotel', 2014, 'Comedy', 99, 'A legendary hotel concierge is caught up in a stolen painting mystery.'],
  ['The Fellowship of the Ring', 2001, 'Fantasy', 178, 'A hobbit and his companions set out to destroy a dangerous ring.'],
  ["Harry Potter and the Philosopher's Stone", 2001, 'Fantasy', 152, 'A boy learns he is a wizard and starts his first year at Hogwarts.'],
];

const SERIES = [
  { title: 'Breaking Bad', year: 2008, genre: 'Drama', seasons: [7, 13, 13, 13, 16],
    desc: 'A chemistry teacher turns to making drugs to secure his family\'s future.' },
  { title: 'Stranger Things', year: 2016, genre: 'Sci-Fi', seasons: [8, 9, 8, 9, 8],
    desc: 'Kids in a small town uncover secret experiments and a hidden dark dimension.' },
  { title: 'Game of Thrones', year: 2011, genre: 'Fantasy', seasons: [10, 10, 10, 10, 10, 10, 7, 6],
    desc: 'Noble families fight for the throne while an ancient threat grows in the north.' },
  { title: 'Sherlock', year: 2010, genre: 'Crime', seasons: [3, 3, 3, 3],
    desc: 'A modern-day detective and his friend solve puzzling cases in London.' },
  { title: 'Chernobyl', year: 2019, genre: 'Drama', seasons: [5],
    desc: 'A dramatised look at the 1986 nuclear disaster and the people who dealt with it.' },
  { title: 'Peaky Blinders', year: 2013, genre: 'Crime', seasons: [6, 6, 6, 6, 6, 6],
    desc: 'A Birmingham gang leader builds a criminal empire after the First World War.' },
  { title: 'Avatar: The Last Airbender', year: 2005, genre: 'Animation', seasons: [20, 20, 21],
    desc: 'A young airbender must master four elements to end a century-long war.' },
  { title: 'Squid Game', year: 2021, genre: 'Thriller', seasons: [9, 7, 6],
    desc: 'Desperate players risk their lives in deadly children\'s games for a huge prize.' },
];

// Assumes the catalogue tables are empty
export async function seedCatalogue(db) {
  for (const [title, year, genre, duration, desc] of MOVIES) {
    await db.runAsync(
      'INSERT INTO titles (type, title, year, genre, description, duration_min) VALUES (?, ?, ?, ?, ?, ?)',
      ['movie', title, year, genre, desc, duration]
    );
  }

  for (const s of SERIES) {
    const series = await db.runAsync(
      'INSERT INTO titles (type, title, year, genre, description) VALUES (?, ?, ?, ?, ?)',
      ['series', s.title, s.year, s.genre, s.desc]
    );
    for (let i = 0; i < s.seasons.length; i++) {
      const season = await db.runAsync(
        'INSERT INTO seasons (title_id, season_number, episode_count) VALUES (?, ?, ?)',
        [series.lastInsertRowId, i + 1, s.seasons[i]]
      );
      for (let e = 1; e <= s.seasons[i]; e++) {
        await db.runAsync(
          'INSERT INTO episodes (season_id, episode_number) VALUES (?, ?)',
          [season.lastInsertRowId, e]
        );
      }
    }
  }
}