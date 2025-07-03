import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    bookingId: { type: String, ref: 'Booking', required: true },
    reviewerId: { type: String, ref: 'User', required: true },
    reviewerName: { type: String, required: true },
    reviewerImageUrl: { type: String },
    tradieId: { type: String, ref: 'User', required: true },
    tradieName: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    date: { type: String, required: true },
}, { timestamps: true, _id: false });

// Add a transform to rename _id to id for frontend compatibility
reviewSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;