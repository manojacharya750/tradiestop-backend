import Invoice from '../models/Invoice.js';
import Booking from '../models/Booking.js';
import Tradie from '../models/Tradie.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private (Tradie only)
const createInvoice = async (req, res) => {
    const { 
        bookingId, items, notes, 
        clientName, clientAddress, clientEmail, clientPhone, jobAddress,
        invoiceNumber, issueDate, dueDate, 
        taxRate, themeColor, footerNotes, logoDataUrl, signatureDataUrl
    } = req.body;
    
    const tradieUser = req.user;

    if (tradieUser.role !== 'Tradie') {
        return res.status(403).json({ message: 'Only tradies can create invoices.' });
    }
    
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking || booking.tradieId !== tradieUser.id) {
            return res.status(404).json({ message: 'Booking not found or not associated with this tradie.' });
        }
        
        const tradieProfile = await Tradie.findOne({ id: tradieUser.id }).populate('companyDetails');
        const clientUser = await User.findOne({ id: booking.clientId });

        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0);
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;

        const newInvoice = new Invoice({
            _id: `inv${new Date().getTime()}`,
            bookingId,
            tradie: {
                id: tradieProfile.id,
                name: tradieProfile.name,
                profession: tradieProfile.profession,
                companyDetails: tradieProfile.companyDetails._id,
            },
            client: {
                id: clientUser.id,
                name: clientName,
                address: clientAddress,
                email: clientEmail,
                phone: clientPhone,
            },
            jobAddress,
            invoiceNumber,
            issueDate,
            dueDate,
            items: items.map((item, index) => ({ ...item, id: `item${index + 1}` })),
            notes,
            subtotal,
            tax: taxAmount,
            total,
            status: 'Pending',
            taxRate,
            themeColor,
            footerNotes,
            logoDataUrl,
            signatureDataUrl,
        });

        const createdInvoice = await newInvoice.save();
        
        await Notification.create({
            userId: clientUser.id,
            message: `You have a new invoice from ${tradieUser.name} for $${total.toFixed(2)}.`,
            link: 'Payments'
        });
        
        // Populate company details for the response
        const responseInvoice = await Invoice.findById(createdInvoice._id).populate('tradie.companyDetails');

        res.status(201).json(responseInvoice);

    } catch (error) {
        res.status(500).json({ message: 'Server error creating invoice.' });
        console.error(error);
    }
};

// @desc    Mark an invoice as paid
// @route   PUT /api/invoices/:id/pay
// @access  Private (Client only)
const markInvoiceAsPaid = async (req, res) => {
    const clientUser = req.user;
    const { id: invoiceId } = req.params;

    if (clientUser.role !== 'Client') {
        return res.status(403).json({ message: 'Only clients can mark invoices as paid.' });
    }

    try {
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }

        if (invoice.client.id !== clientUser.id) {
            return res.status(403).json({ message: 'You are not authorized to pay this invoice.' });
        }

        invoice.status = 'Paid';
        const updatedInvoice = await invoice.save();

        await Notification.create({
            userId: invoice.tradie.id,
            message: `Payment received for invoice ${invoice.invoiceNumber} from ${clientUser.name}.`,
            link: 'Payments'
        });
        
        const responseInvoice = await Invoice.findById(updatedInvoice._id).populate('tradie.companyDetails');

        res.json(responseInvoice);

    } catch (error) {
        res.status(500).json({ message: 'Server error updating invoice.' });
        console.error(error);
    }
};

export { createInvoice, markInvoiceAsPaid };
