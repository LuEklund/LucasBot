# Request Flow

This document outlines how a Discord interaction travels through LucasBot and ends up persisted in MongoDB.

```mermaid
sequenceDiagram
    participant User as Discord User
    participant Discord as Discord API
    participant Bot as LucasBot
    participant CommandSvc as Command Service
    participant Mongoose
    participant DB as MongoDB Atlas

    User->>Discord: Slash command/message
    Discord->>Bot: Gateway event
    Bot->>CommandSvc: Dispatch InteractionCreate/MessageCreate
    CommandSvc->>Command: Execute logic
    Command->>Mongoose: Read/Write models
    Mongoose->>DB: Query/Update
    DB-->>Mongoose: Result
    Mongoose-->>Command: Document
    Command-->>Bot: Response
    Bot-->>Discord: reply message
    Discord-->>User: updated message
```

Steps in detail:

1. A user sends a message or slash command in Discord.
2. Discord forwards the event to LucasBot over its WebSocket gateway.
3. The `discord.js` client dispatches the event to the `CommandService` (or message handler).
4. Command logic uses the Mongoose models (`UserModel`, `QuestModel`, etc.) to query or update MongoDB Atlas.
5. The command replies to Discord with the result, which appears back in the user's client.
