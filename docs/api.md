# API Documentation

## Base URL
```
http://localhost:3000/api
```

## Response Format
All endpoints return JSON with consistent error handling:

**Success Response:**
```json
{
  "success": true,
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Endpoints

### Users

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-03-03T10:00:00Z"
  }
}
```

#### Get User
```http
GET /api/users/{id}
```

### Matches

#### List Matches
```http
GET /api/matches
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "teamA": "Brazil",
      "teamB": "Argentina",
      "scheduledAt": "2024-03-15T18:00:00Z",
      "teamAScore": null,
      "teamBScore": null,
      "status": "scheduled"
    }
  ]
}
```

#### Get Match
```http
GET /api/matches/{id}
```

### Picks

#### Create Pick
```http
POST /api/picks
Content-Type: application/json

{
  "userId": 1,
  "matchId": 1,
  "predictedTeamAScore": 2,
  "predictedTeamBScore": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "matchId": 1,
    "predictedTeamAScore": 2,
    "predictedTeamBScore": 1,
    "points": 0,
    "createdAt": "2024-03-03T10:00:00Z"
  }
}
```

#### Update Pick
```http
PUT /api/picks/{id}
Content-Type: application/json

{
  "predictedTeamAScore": 3,
  "predictedTeamBScore": 1
}
```

#### Get User Picks
```http
GET /api/picks/user/{userId}
```

#### Get Match Picks
```http
GET /api/picks/match/{matchId}
```

### Leaderboard

#### Get Leaderboard
```http
GET /api/leaderboard
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "userName": "John Doe",
      "totalPoints": 15,
      "correctPicks": 5,
      "totalPicks": 8
    }
  ]
}
```

## Error Codes
- `USER_NOT_FOUND` - User does not exist
- `MATCH_NOT_FOUND` - Match does not exist
- `PICK_NOT_FOUND` - Pick does not exist
- `DUPLICATE_PICK` - User already has a pick for this match
- `MATCH_STARTED` - Cannot modify pick after match starts
- `VALIDATION_ERROR` - Invalid input data
- `INTERNAL_ERROR` - Server error

## Validation Rules
- User name: 1-100 characters, required
- User email: valid email format, unique, required
- Pick scores: non-negative integers, required
- Match teams: 1-50 characters, required