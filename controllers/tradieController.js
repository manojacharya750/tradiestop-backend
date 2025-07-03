import Tradie from '../models/Tradie.js';
import CompanyDetails from '../models/CompanyDetails.js';

// @desc    Update company details for a tradie
// @route   PUT /api/tradies/company-details
// @access  Private (Tradie only)
const updateCompanyDetails = async (req, res) => {
    const user = req.user;

    if (user.role !== 'Tradie') {
        return res.status(403).json({ message: 'User is not a tradie.' });
    }

    try {
        const companyDetails = await CompanyDetails.findOne({ tradieId: user.id });
        if (companyDetails) {
            companyDetails.name = req.body.name || companyDetails.name;
            companyDetails.address = req.body.address || companyDetails.address;
            companyDetails.phone = req.body.phone || companyDetails.phone;
            companyDetails.email = req.body.email || companyDetails.email;
            companyDetails.taxId = req.body.taxId || companyDetails.taxId;
            companyDetails.logoUrl = req.body.logoUrl || companyDetails.logoUrl;
            
            await companyDetails.save();

            const tradie = await Tradie.findOne({ id: user.id }).populate('companyDetails');
            res.json(tradie);
        } else {
            res.status(404).json({ message: 'Company details not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating company details.' });
        console.error(error);
    }
};

export { updateCompanyDetails };