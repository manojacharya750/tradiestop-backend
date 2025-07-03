import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Using custom 'b1' style IDs
    clientId: { type: String, required: true, ref: 'User' },
    clientName: { type: String, required: true },
    clientImageUrl: { type: String },
    tradieId: { type: String, required: true, ref: 'Tradie' },
    tradieName: { type: String, required: true },
    tradieProfession: { type: String, required: true },
    tradieImageUrl: { type: String },
    serviceDate: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['Requested', 'Confirmed', 'Cancelled', 'Completed'] 
    },
    details: { type: String, required: true }
}, { timestamps: true, _id: false });

// Add a transform to rename _id to id for frontend compatibility
bookingSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;