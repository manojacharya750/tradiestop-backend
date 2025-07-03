import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import User from '../models/User.js';
import Tradie from '../models/Tradie.js';
import CompanyDetails from '../models/CompanyDetails.js';
import Booking from '../models/Booking.js';
import Invoice from '../models/Invoice.js';
import Review from '../models/Review.js';
import ClientReview from '../models/ClientReview.js';
import Message from '../models/Message.js';
import SupportTicket from '../models/SupportTicket.js';
import Notification from '../models/Notification.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log('MongoDB Connected for Script...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();
    try {
        // Clear existing data
        await User.deleteMany();
        await Tradie.deleteMany();
        await CompanyDetails.deleteMany();
        await Booking.deleteMany();
        await Invoice.deleteMany();
        await Review.deleteMany();
        await ClientReview.deleteMany();
        await Message.deleteMany();
        await SupportTicket.deleteMany();
        await Notification.deleteMany();

        // Read JSON file
        const jsonPath = path.resolve(__dirname, './tradie-stop-db.json');
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

        // Create users individually to ensure pre-save hooks (for hashing) are triggered.
        for (const user of data.users) {
            await User.create(user);
        }
        console.log('Users Imported & Passwords Hashed!');
        
        const createdCompanyDetails = await CompanyDetails.insertMany(data.companydetails);
        console.log('Company Details Imported!');
        
        // Link tradies to their company details
        const tradiesWithCompanyDetails = data.tradies.map(tradie => {
            const companyDetail = createdCompanyDetails.find(cd => cd.tradieId === tradie.id);
            return {
                ...tradie,
                companyDetails: companyDetail ? companyDetail._id : null
            };
        });
        await Tradie.insertMany(tradiesWithCompanyDetails);
        console.log('Tradies Imported!');
        
        // Link invoices to their company details
        const invoicesWithCompanyDetails = data.invoices.map(invoice => {
             const companyDetail = createdCompanyDetails.find(cd => cd.tradieId === invoice.tradie.id);
             return {
                 ...invoice,
                 tradie: {
                     ...invoice.tradie,
                     companyDetails: companyDetail ? companyDetail._id : null
                 }
             }
        });

        await Booking.insertMany(data.bookings);
        console.log('Bookings Imported!');
        await Invoice.insertMany(invoicesWithCompanyDetails);
        console.log('Invoices Imported!');
        await Review.insertMany(data.reviews);
        console.log('Reviews Imported!');
        await ClientReview.insertMany(data.clientreviews);
        console.log('Client Reviews Imported!');
        await Message.insertMany(data.messages);
        console.log('Messages Imported!');
        await SupportTicket.insertMany(data.supporttickets);
        console.log('Support Tickets Imported!');


        console.log('Data Imported Successfully!');
        process.exit();
    } catch (error) {
        console.error(`Error with data import: ${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
     await connectDB();
    try {
        await User.deleteMany();
        await Tradie.deleteMany();
        await CompanyDetails.deleteMany();
        await Booking.deleteMany();
        await Invoice.deleteMany();
        await Review.deleteMany();
        await ClientReview.deleteMany();
        await Message.deleteMany();
        await SupportTicket.deleteMany();
        await Notification.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error with data destruction: ${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '--delete') {
    destroyData();
} else {
    importData();
}