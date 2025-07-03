
import mongoose from 'mongoose';

const tradieSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true, ref: 'User' },
    name: { type: String, required: true },
    profession: { type: String, required: true },
    rating: { type: Number, default: 0 },
    availability: { type: String },
    imageUrl: { type: String, required: true },
    reviewsCount: { type: Number, default: 0 },
    companyDetails: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'CompanyDetails' 
    }
}, { timestamps: true });

// Clean up the output
tradieSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

const Tradie = mongoose.model('Tradie', tradieSchema);

export default Tradie;