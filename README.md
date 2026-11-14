# EpisodeX – Offline Movie and TV Series Tracker

EpisodeX is a React Native mobile app for organising and tracking movies and TV series. It works fully offline, using a local SQLite database with a dataset created for this project.

**Course:** IT3133 – ICA 03, Individual React Native Project
**Student:** Nethum Sandiw (2022/ICT/65), University of Vavuniya

## Features
- **Catalogue:** 28 titles (20 movies and 8 TV series) stored locally, with genre, year, description and duration
- **Search and filters:** search by title, filter by type (Movies / TV Series), genre and release year
- **Details screen:** full information for each title
- **Personal library:** Plan to Watch, Watching, Completed and Dropped, plus favourites
- **Ratings and reviews:** 1–5 star rating and a written review for each title
- **Episode tracking:** mark individual episodes as watched, with season and overall progress percentages
- **Automatic status:** a series moves to Watching or Completed based on episode progress
- **Home dashboard:** currently watching (with progress), watchlist and recently completed
- **Statistics:** movies watched, series completed, episodes watched, average rating, favourite genres and estimated watch time

## Screens
1. Home
2. Explore (search and filters)
3. My Library
4. Details
5. Series Tracker
6. Profile and Statistics

## Tech Stack
- React Native with Expo
- JavaScript
- SQLite (`expo-sqlite`)
- React Navigation (bottom tabs and native stack)
- Git and GitHub

## Database
The catalogue and the user's personal data are kept in separate tables, so users can never change the original catalogue.

| Table | Purpose |
|---|---|
| `titles` | Movies and series (catalogue) |
| `seasons` | Seasons of each series (catalogue) |
| `episodes` | Episodes of each season (catalogue) |
| `library` | The user's status, favourite, rating and review |
| `episode_progress` | Which episodes the user has watched |

The database is created and seeded automatically on first launch. No internet connection or external API is used.

## Project Structure
```
src/
  components/   Chip.js, TitleCard.js
  database/     db.js, schema.js, seed.js
  navigation/   AppNavigator.js
  screens/      Home, Explore, Library, Details, SeriesTracker, Profile
  theme.js      Colours and genre accent colours
App.js
```

## How to Run
1. Install Node.js and the **Expo Go** app on your phone
2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/nethum003/EpisodeX.git
   cd EpisodeX
   npm install
   ```
3. Start the app:
   ```bash
   npx expo start
   ```
4. Scan the QR code with Expo Go (phone and computer on the same Wi-Fi)

## Offline Use
After the app is installed or loaded, all features work without an internet connection, since all data is stored in the local SQLite database.

## Notes
- The interface is text-based: each title is shown with a genre-coloured accent, with no images or external assets.
- Watch time estimates assume 45 minutes per episode.