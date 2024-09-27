import albums from "./albums.ts";
import auth from "./auth.ts";
import playlists from "./playlists.ts";
import songs from "./songs.ts";

export default [...albums, ...songs, ...auth, ...playlists];
