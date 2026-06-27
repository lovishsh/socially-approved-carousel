const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    user: { type: String, required: true, trim: true, maxlength: 60 },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ShareEventSchema = new Schema(
  {
    platform: { type: String, required: true, trim: true },
    user: { type: String, default: "anonymous" },
    ip: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const VideoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    duration: { type: Number, default: 0 }, 
    author: { type: String, default: "Verified Customer" },
    likeCount: { type: Number, default: 0, min: 0 },
    likedBy: { type: [String], default: [] }, 
    shareCount: { type: Number, default: 0, min: 0 },
    shares: { type: [ShareEventSchema], default: [] },
    comments: { type: [CommentSchema], default: [] },
  },
  { timestamps: true }
);


VideoSchema.methods.toCard = function toCard() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    videoUrl: this.videoUrl,
    thumbnailUrl: this.thumbnailUrl,
    duration: this.duration,
    author: this.author,
    likeCount: this.likeCount,
    shareCount: this.shareCount,
    commentCount: this.comments.length,
  };
};

module.exports = mongoose.model("Video", VideoSchema);
