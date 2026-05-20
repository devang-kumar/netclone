# StreamVault — Technical Reference

---

## Database Schemas

### User

| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique, lowercase |
| password | String | bcrypt hashed, min 6 chars |
| role | Enum | `user` \| `admin`, default `user` |
| profile.avatar | String | URL |
| profile.preferences | [String] | genre preferences |
| watchlist | [ObjectId] | ref Series |
| watchHistory | [{ series, episode, watchedAt, progress }] | progress 0–100 |
| subscription.status | Enum | `free` \| `premium` |
| subscription.expiryDate | Date | |
| isActive | Boolean | default true |

---

### Series

| Field | Type | Notes |
|---|---|---|
| title | String | required |
| description | String | required |
| thumbnail | String | URL, required — poster image |
| banner | String | URL — hero banner |
| genre | [String] | required |
| cast | [{ name, role, image }] | |
| director | String | |
| releaseYear | Number | |
| rating | Number | 0–10, default 0 |
| totalEpisodes | Number | auto-incremented on episode create |
| status | Enum | `upcoming` \| `ongoing` \| `completed` |
| categories | [Enum] | legacy tags: `top-picks`, `recommended`, `new-releases`, `upcoming` |
| browseCategories | [ObjectId] | ref Category — admin-defined homepage rows |
| views | Number | incremented on series detail load |
| isPublished | Boolean | default false |

Indexes: `categories + isPublished`, `browseCategories + isPublished`, `views desc`, `rating desc`, `createdAt desc`, `title text`

---

### Episode

| Field | Type | Notes |
|---|---|---|
| series | ObjectId | ref Series, required |
| episodeNumber | Number | required |
| title | String | required |
| description | String | required |
| thumbnail | String | URL, required |
| video.url | String | Cloudinary URL, required |
| video.publicId | String | Cloudinary public_id |
| video.duration | Number | seconds |
| views | Number | incremented on episode load |
| isPublished | Boolean | default false |

Indexes: `{ series, episodeNumber }` unique compound

---

### Category

| Field | Type | Notes |
|---|---|---|
| name | String | required, max 60 chars |
| slug | String | unique, auto-generated from name |
| description | String | |
| displayOrder | Number | controls row order on homepage |
| isActive | Boolean | default true |
| showOnHome | Boolean | whether to render as homepage row |
| sortBy | Enum | `views` \| `rating` \| `createdAt` \| `releaseYear` |

---

## API Routes

### Auth — `/api/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account, returns JWT |
| POST | `/login` | Public | Authenticate, returns JWT |
| GET | `/me` | Private | Get current user from token |

---

### Users — `/api/users`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/watchlist` | Private | Get user watchlist (populated) |
| POST | `/watchlist/:seriesId` | Private | Add series to watchlist |
| DELETE | `/watchlist/:seriesId` | Private | Remove from watchlist |
| GET | `/history` | Private | Get watch history |
| POST | `/history` | Private | Add entry to watch history |

---

### Series — `/api/series`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | All published series. Query: `category`, `genre`, `search` |
| GET | `/:id` | Public | Single series + episodes. Increments views |
| GET | `/category/:category` | Public | Series by legacy category tag |

---

### Episodes — `/api/episodes`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/:id` | Public | Single episode + prev/next navigation. Increments views |
| GET | `/series/:seriesId` | Public | All published episodes for a series |

---

### Categories — `/api/categories`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Public | All active categories |
| GET | `/home` | Public | Homepage rows — each category with its series. Prepends "Recently Added" |
| GET | `/:slug/series` | Public | Series for a specific category slug |

---

### Admin — `/api/admin` (admin role required)

**Series**

| Method | Path | Description |
|---|---|---|
| GET | `/series` | All series including drafts |
| POST | `/series` | Create series (multipart/form-data) |
| PUT | `/series/:id` | Update series |
| DELETE | `/series/:id` | Delete series + all episodes |
| PATCH | `/series/:id/publish` | Toggle publish status |

**Episodes**

| Method | Path | Description |
|---|---|---|
| GET | `/episodes` | All episodes including drafts |
| POST | `/episodes` | Create episode |
| PUT | `/episodes/:id` | Update episode |
| DELETE | `/episodes/:id` | Delete episode + Cloudinary video |
| PATCH | `/episodes/:id/publish` | Toggle publish status |

**Categories**

| Method | Path | Description |
|---|---|---|
| GET | `/categories` | All categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete + unlink from series |

---

### Upload — `/api/admin` (admin role required)

| Method | Path | Description |
|---|---|---|
| POST | `/upload-cloudinary` | Direct upload for small files |
| POST | `/upload-chunk` | Receive one chunk, store in memory |
| POST | `/upload-finalize` | Assemble chunks, push to Cloudinary |

---

## Services & Integrations

### Cloudinary

Used for all media storage — images and videos.

Folder structure:
```
ott-platform/
  series/thumbnails/
  series/banners/
  episodes/thumbnails/
  episodes/videos/
```

Two upload paths:

**Direct upload** — for images and small files. File buffer is sent directly to Cloudinary via the SDK.

**Chunked upload** — for large video files. The frontend splits the file into 5MB chunks, sends each chunk to `/upload-chunk` which stores them in a server-side `Map` keyed by a `fileId`. Once all chunks arrive, the frontend calls `/upload-finalize` which assembles the buffers and uploads the complete file to Cloudinary in one call. The session is then cleared from memory.

```
Client splits file → POST /upload-chunk (x N) → server stores chunks in Map
                  → POST /upload-finalize → assemble → Cloudinary → return URL
```

---

### JWT Authentication

Tokens are signed with `JWT_SECRET`, expire after 30 days. Sent as `Authorization: Bearer <token>`. The `protect` middleware verifies the token and attaches `req.user`. The `adminOnly` middleware checks `req.user.role === 'admin'`.

---

### Frontend Caching

Two-layer cache (memory Map + sessionStorage) with TTLs:

| Key | TTL | Data |
|---|---|---|
| `categories` | 5 min | Active categories list |
| `home-rows` | 3 min | Homepage rows with series |
| `cat-series:{slug}` | 2 min | Series for a category |

Cache is invalidated on any admin write operation.

---

### Rate Limiting

1000 requests per 15 minutes on all `/api/` routes. Admin upload routes are excluded.

---

### Server Timeouts

Express server timeout is set to 10 minutes to accommodate large Cloudinary video uploads.
