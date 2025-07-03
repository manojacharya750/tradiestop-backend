import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    senderName: { type: String, required: true },
    snippet: { type: String, required: true },
    timestamp: { type: String, required: true },
    avatarUrl: { type: String, required: true },
}, { timestamps: true, _id: false });

// Add a transform to rename _id to id for frontend compatibility
messageSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

const Message = mongoose.model('Message', messageSchema);

export default Message;