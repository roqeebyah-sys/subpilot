import mongoose, { Schema, models, model } from 'mongoose'

// This defines the shape of a User document in MongoDB
// Every user we create will follow this structure
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // no two users can have the same email
      lowercase: true, // always store emails in lowercase
      trim: true, // remove accidental spaces
    },
    password: {
      type: String,
      // not required because OAuth users (Google etc) won't have one
    },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'pro'],
      default: 'starter',
    },
    stripeCustomerId: {
      type: String,
      // added later when they subscribe
    },
    onboarded: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
)

// 'models.User ||' prevents re-compiling the model on every hot reload
export const User = models.User || model('User', UserSchema)