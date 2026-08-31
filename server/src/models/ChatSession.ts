import mongoose, { Schema, Document } from 'mongoose';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  language: 'en' | 'ur' | 'roman-urdu';
  timestamp: Date;
}

export interface ChatSessionDocument extends Document {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<ChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    language: {
      type: String,
      enum: ['en', 'ur', 'roman-urdu'],
      default: 'en',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatSessionSchema = new Schema<ChatSessionDocument>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// TTL index — automatically remove sessions after 30 days
chatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const ChatSession = mongoose.model<ChatSessionDocument>(
  'ChatSession',
  chatSessionSchema
);
