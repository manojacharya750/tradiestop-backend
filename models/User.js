
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    // unique: true is removed from here to define a more specific index below
    id: { type: String, required: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: ['Client', 'Tradie', 'Admin'] 
    },
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    joinedDate: { type: String, required: true },
    suspended: { type: Boolean, default: false },
}, {
    timestamps: true 
});

// Add a case-insensitive unique index on the 'id' field.
// strength: 2 compares base characters but is case-insensitive.
userSchema.index({ id: 1 }, {
    unique: true,
    collation: { locale: 'en', strength: 2 }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving a new user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Clean up the output
userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});


const User = mongoose.model('User', userSchema);

export default User;