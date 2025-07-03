import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    bookingId: { type: String, required: true, ref: 'Booking' },
    tradie: {
        id: { type: String, required: true, ref: 'User' },
        name: String,
        profession: String,
        companyDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyDetails' }
    },
    client: {
        id: { type: String, required: true, ref: 'User' },
        name: String,
        address: String,
    },
    invoiceNumber: { type: String, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    items: [invoiceItemSchema],
    notes: { type: String },
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['Paid', 'Pending', 'Overdue'] 
    }
}, { timestamps: true, _id: false });

// Add a transform to rename _id to id for frontend compatibility
invoiceSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});


const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;