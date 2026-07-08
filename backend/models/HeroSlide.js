import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    ctaText: {
      type: String,
      default: 'Learn More',
    },
    ctaLink: {
      type: String,
      default: '#',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

heroSlideSchema.index({ isActive: 1, order: 1 });

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;