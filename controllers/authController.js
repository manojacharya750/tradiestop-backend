
import User from '../models/User.js';
import Tradie from '../models/Tradie.js';
import CompanyDetails from '../models/CompanyDetails.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { userId, password } = req.body;

    // Use collation for case-insensitive login ID check
    const user = await User.findOne({ id: userId }).collation({ locale: 'en', strength: 2 });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            id: user.id,
            name: user.name,
            role: user.role,
            imageUrl: user.imageUrl,
            joinedDate: user.joinedDate,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid user ID or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
    const { id, name, password, role, profession } = req.body;

    if (!id || !name || !password || !role) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    if (role === 'Tradie' && !profession) {
        return res.status(400).json({ message: 'Tradies must select a profession.' });
    }

    try {
        // Find a user with the same ID, ignoring case, by using a collation
        const userExists = await User.findOne({ id }).collation({ locale: 'en', strength: 2 });

        if (userExists) {
            // Return a user-friendly error message
            return res.status(400).json({ message: 'That User ID is already taken.' });
        }

        const user = new User({
            id,
            name,
            password,
            role,
            imageUrl: `https://i.pravatar.cc/150?u=${id}`, // Default avatar
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        });
        
        const createdUser = await user.save();

        // If it's a tradie, create associated records
        if (role === 'Tradie') {
            const companyDetails = await CompanyDetails.create({
                tradieId: createdUser.id,
                name: `${name}'s Services`,
                address: "123 Business Rd, Suite 100",
                phone: "555-0100",
                email: `${id}@example.com`,
                taxId: "Not set",
                logoUrl: "https://i.imgur.com/gEy5ZNe.png",
            });
            await Tradie.create({
                id: createdUser.id,
                name: createdUser.name,
                profession: profession, // Use the selected profession
                imageUrl: createdUser.imageUrl,
                companyDetails: companyDetails._id
            });
        }
        
        res.status(201).json({
            _id: createdUser._id,
            id: createdUser.id,
            name: createdUser.name,
            role: createdUser.role,
            imageUrl: createdUser.imageUrl,
            joinedDate: createdUser.joinedDate,
            token: generateToken(createdUser._id),
            // The password is required for auto-login after signup
            // This is a special case and should NOT be done for other user-fetching endpoints
            password: req.body.password,
        });

    } catch (error) {
        // Handle potential race conditions where the database index throws an error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'That User ID is already taken.' });
        }
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
};


export { loginUser, signupUser };
