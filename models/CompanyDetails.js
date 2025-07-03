import mongoose from 'mongoose';

const companyDetailsSchema = new mongoose.Schema({
    tradieId: { type: String, required: true, unique: true, ref: 'User' },
    name: { type: String, required: true },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    taxId: { type: String },
    logoUrl: { type: String }
}, { timestamps: true });

// Clean up the output
companyDetailsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});
const CompanyDetails = mongoose.model('CompanyDetails', companyDetailsSchema);

export default CompanyDetails;
