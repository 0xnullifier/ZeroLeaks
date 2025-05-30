# Threaded Comments API Documentation

This document describes the threaded commenting system that allows YouTube-style nested replies to comments.

## API Endpoints

### 1. Get Comments (with threads)

`GET /:leakId/comments`

Returns all comments organized into threads with nested replies.

**Response Structure:**

```json
{
  "comments": [
    {
      "id": "comment-1",
      "leakId": "leak-123",
      "content": "This is a top-level comment",
      "author": "0x123...",
      "timestamp": "2025-05-30T10:00:00Z",
      "isOP": false,
      "replies": [
        {
          "id": "comment-2",
          "leakId": "leak-123",
          "content": "This is a reply to comment-1",
          "author": "0x456...",
          "timestamp": "2025-05-30T10:05:00Z",
          "isOP": false,
          "parentId": "comment-1",
          "replies": []
        }
      ],
      "replyCount": 1
    }
  ]
}
```

### 2. Add Comment (supports replies)

`POST /:leakId/comments`

Creates a new comment or reply to an existing comment.

**Request Body:**

```json
{
  "content": "Your comment content",
  "author": "0x123...",
  "isOP": false,
  "parentId": "comment-id-to-reply-to" // Optional: omit for top-level comment
}
```

### 3. Get Specific Comment Thread

`GET /:leakId/comments/:commentId`

Returns a specific comment with all its replies.

### 4. Get Replies to a Comment

`GET /:leakId/comments/:commentId/replies`

Returns only the direct replies to a specific comment.

### 5. Get Comment Statistics

`GET /:leakId/comments/stats`

Returns statistics about comments for a leak.

**Response:**

```json
{
  "totalComments": 15,
  "topLevelComments": 8,
  "replies": 7
}
```

## Comment Structure

Each comment now has the following properties:

- `id`: Unique identifier for the comment
- `leakId`: ID of the leak this comment belongs to
- `content`: The comment text
- `author`: Wallet address of the commenter
- `timestamp`: ISO timestamp when comment was created
- `isOP`: Boolean indicating if this is the original poster
- `parentId`: ID of parent comment (null for top-level comments)
- `replies`: Array of nested reply comments (populated when fetching)
- `replyCount`: Number of direct replies to this comment

## Threading Behavior

- **Top-level comments** are sorted by timestamp (newest first)
- **Replies** within a thread are sorted by timestamp (oldest first for conversation flow)
- **Nested replies** are supported (replies to replies)
- **Parent validation** ensures replies are only created for existing comments

## Usage Examples

### Creating a top-level comment

```bash
curl -X POST http://localhost:3000/api/leaks/leak-123/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great leak! Thanks for sharing.",
    "author": "0x123...",
    "isOP": false
  }'
```

### Replying to a comment

```bash
curl -X POST http://localhost:3000/api/leaks/leak-123/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I agree with your point!",
    "author": "0x456...",
    "isOP": false,
    "parentId": "comment-1"
  }'
```

### Getting threaded comments

```bash
curl http://localhost:3000/api/leaks/leak-123/comments
```

This will return all comments organized into threads with nested replies, similar to YouTube's comment system.
