import { Schema, models, model } from 'mongoose'

// This single model holds subscribers from ALL sources
// Whether they came from Stripe, PayPal CSV, Gumroad CSV, or any other source
// the shape is always the same — that's what lets the AI treat them identically
const SubscriberSchema = new Schema(
  {
    // Which SubPilot user owns this subscriber
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // index for fast lookups by user
    },

    // Where did this subscriber come from?
    source: {
      type: String,
      enum: ['stripe', 'paypal', 'gumroad', 'teachable', 'kajabi', 'csv', 'manual'],
      required: true,
    },

    // The ID from the source platform (Stripe customer ID, Gumroad order ID etc)
    sourceId: {
      type: String,
    },

    // Core subscriber info
    name: { type: String },
    email: { type: String, required: true },

    // Subscription details
    plan: { type: String },
    amount: { type: Number, default: 0 },   // monthly amount in cents
    currency: { type: String, default: 'usd' },

    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing', 'paused', 'unknown'],
      default: 'active',
    },

    // Dates — critical for churn scoring
    startedAt: { type: Date },       // when they first subscribed
    cancelledAt: { type: Date },     // when they cancelled (if they did)
    lastActiveAt: { type: Date },    // last login / last engagement

    // Churn risk — calculated by our scoring algorithm
    churnScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null, // null means not yet scored
    },

    churnScoreUpdatedAt: { type: Date },

    // Raw data from the source — stored in case we need it later
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for fast dashboard queries
// "give me all active subscribers for user X sorted by churn score"
SubscriberSchema.index({ userId: 1, status: 1, churnScore: -1 })

export const Subscriber = models.Subscriber || model('Subscriber', SubscriberSchema)