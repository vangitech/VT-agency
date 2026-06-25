import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'Vangitech',
    },
    url: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Technology',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const News = mongoose.model('News', newsSchema);
export default News;