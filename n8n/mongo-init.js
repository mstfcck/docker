// =============================================================================
// MongoDB Initialization Script for n8n AI Agent Memory
// =============================================================================
// This script sets up MongoDB for AI Agent chat memory with proper collections,
// indexes, and user permissions for optimal performance
// =============================================================================

// Switch to the admin database to create users
db = db.getSiblingDB('admin');

// Create the root admin user (if not already created by Docker)
try {
    const rootPwd = process.env.MONGO_INITDB_ROOT_PASSWORD || 'change-me';
    db.createUser({
        user: 'n8n_admin',
        pwd: rootPwd, // pulled from env
        roles: [
            { role: 'userAdminAnyDatabase', db: 'admin' },
            { role: 'readWriteAnyDatabase', db: 'admin' },
            { role: 'dbAdminAnyDatabase', db: 'admin' }
        ]
    });
    print('✅ Admin user "n8n_admin" created successfully');
} catch (e) {
    print('ℹ️  Admin user already exists or Docker created it');
}

// Switch to the AI memory database
db = db.getSiblingDB('n8n_ai_memory');

// Create a user for n8n AI operations (that matches the connection string)
db.createUser({
    user: 'n8n_admin',
    pwd: process.env.MONGO_INITDB_ROOT_PASSWORD || 'change-me', // matches MONGODB_PASSWORD
    roles: [
        {
            role: 'readWrite',
            db: 'n8n_ai_memory'
        },
        {
            role: 'dbAdmin',
            db: 'n8n_ai_memory'
        }
    ]
});

print('✅ AI memory user "n8n_admin" created for database "n8n_ai_memory"');

// Create collections for AI Agent memory storage
db.createCollection('chat_memory', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['sessionId', 'messageType', 'content', 'createdAt'],
            properties: {
                sessionId: {
                    bsonType: 'string',
                    description: 'Session identifier for grouping related messages'
                },
                messageType: {
                    bsonType: 'string',
                    enum: ['human', 'ai', 'system'],
                    description: 'Type of message in the conversation'
                },
                content: {
                    bsonType: 'string',
                    description: 'The actual message content'
                },
                metadata: {
                    bsonType: 'object',
                    description: 'Additional metadata for the message'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Timestamp when the message was created'
                },
                embedding: {
                    bsonType: 'array',
                    description: 'Vector embedding for semantic search (optional)'
                }
            }
        }
    }
});

// Create indexes for optimal query performance
db.chat_memory.createIndex({ sessionId: 1, createdAt: 1 });
db.chat_memory.createIndex({ sessionId: 1, messageType: 1 });
db.chat_memory.createIndex({ createdAt: 1 });

// Create vector search index if using embeddings (MongoDB Atlas Vector Search)
// Uncomment if using vector embeddings for semantic memory search
/*
db.chat_memory.createIndex(
  { embedding: "vectorSearch" },
  {
    name: "vector_index",
    vectorSearchOptions: {
      type: "vectorSearch",
      similarity: "cosine",
      dimensions: 1536 // Adjust based on your embedding model
    }
  }
);
*/

// Create collection for AI context and session management
db.createCollection('ai_sessions', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['sessionId', 'userId', 'createdAt'],
            properties: {
                sessionId: {
                    bsonType: 'string',
                    description: 'Unique session identifier'
                },
                userId: {
                    bsonType: 'string',
                    description: 'User identifier associated with the session'
                },
                context: {
                    bsonType: 'object',
                    description: 'Session context and state information'
                },
                metadata: {
                    bsonType: 'object',
                    description: 'Additional session metadata'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Session creation timestamp'
                },
                lastAccessedAt: {
                    bsonType: 'date',
                    description: 'Last time the session was accessed'
                },
                expiresAt: {
                    bsonType: 'date',
                    description: 'Session expiration timestamp'
                }
            }
        }
    }
});

// Create indexes for session management
db.ai_sessions.createIndex({ sessionId: 1 }, { unique: true });
db.ai_sessions.createIndex({ userId: 1 });
db.ai_sessions.createIndex({ lastAccessedAt: 1 });
db.ai_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Create collection for AI memory summaries and long-term storage
db.createCollection('memory_summaries', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['sessionId', 'summary', 'createdAt'],
            properties: {
                sessionId: {
                    bsonType: 'string',
                    description: 'Associated session identifier'
                },
                summary: {
                    bsonType: 'string',
                    description: 'Summarized conversation or context'
                },
                keywords: {
                    bsonType: 'array',
                    items: { bsonType: 'string' },
                    description: 'Extracted keywords for search'
                },
                importance: {
                    bsonType: 'number',
                    minimum: 0,
                    maximum: 10,
                    description: 'Importance score for retention priority'
                },
                createdAt: {
                    bsonType: 'date',
                    description: 'Summary creation timestamp'
                },
                embedding: {
                    bsonType: 'array',
                    description: 'Vector embedding for semantic search'
                }
            }
        }
    }
});

// Create indexes for memory summaries
db.memory_summaries.createIndex({ sessionId: 1 });
db.memory_summaries.createIndex({ keywords: 1 });
db.memory_summaries.createIndex({ importance: -1 });
db.memory_summaries.createIndex({ createdAt: 1 });

print('✅ MongoDB AI memory database setup completed successfully!');
print('📊 Collections created: chat_memory, ai_sessions, memory_summaries');
print('🔍 Indexes created for optimal query performance');
print('👤 User "n8n_admin" created with readWrite permissions on n8n_ai_memory');
print('⚠️  Password sourced from MONGO_INITDB_ROOT_PASSWORD environment variable');
