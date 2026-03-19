import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    hashedPassword: {
      type: String,
      required() {
        return !this.passwordHash;
      }
    },
    passwordHash: {
      type: String
    },
    createdAt: {
      type: Date
    }
  },
  {
    timestamps: { createdAt: 'creationDate', updatedAt: false }
  }
);

export default mongoose.model('User', userSchema);