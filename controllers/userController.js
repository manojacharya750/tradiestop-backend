import User from '../models/User.js';
import Tradie from '../models/Tradie.js';
import CompanyDetails from '../models/CompanyDetails.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.imageUrl = req.body.imageUrl || user.imageUrl;
            
            const updatedUser = await user.save();
            
            // If user is a tradie, update the name and image in the Tradie model as well
            if(user.role === 'Tradie') {
                await Tradie.updateOne({ id: user.id }, { $set: { name: updatedUser.name, imageUrl: updatedUser.imageUrl } });
            }

            res.json({
                _id: updatedUser._id,
                id: updatedUser.id,
                name: updatedUser.name,
                role: updatedUser.role,
                imageUrl: updatedUser.imageUrl,
                joinedDate: updatedUser.joinedDate,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile.' });
        console.error(error);
    }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user.role === 'Tradie') {
            await Tradie.deleteOne({ id: user.id });
            await CompanyDetails.deleteOne({ tradieId: user.id });
        }
        
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user.' });
        console.error(error);
    }
};

export { updateUserProfile, deleteUser };