import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    message: { type: String, required: true },
    link: { type: String }, // Optional page to navigate to
    read: { type: Boolean, default: false, required: true },
}, { timestamps: true });

notificationSchema.set('toJSON', {
  virtuals: true,
  versionKey:false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;