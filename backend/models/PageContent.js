import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: ['home', 'about', 'contact', 'projects', 'privacy', 'terms', 'faq', 'policy'],
      required: true,
      unique: true,
    },
    sections: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

const PageContent = mongoose.model('PageContent', pageContentSchema);
export default PageContent;