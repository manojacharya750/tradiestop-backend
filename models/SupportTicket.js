import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    userId: { type: String, ref: 'User', required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Open', 'Closed']
    },
    date: { type: String, required: true },
}, { timestamps: true, _id: false });

// Add a transform to rename _id to id for frontend compatibility
supportTicketSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;