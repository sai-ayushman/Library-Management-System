import cron from "node-cron"
import { sendEmail } from "../utils/sendEmail.js";
import { User } from "../models/userModel.js";
import { Borrow } from "../models/borrowModel.js";


export const notifyUsers = () => {
    cron.schedule("*/30 * * * *", async() => {
        try {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            const borrowers = await Borrow.find({
                dueDate:{
                    $lt :oneDayAgo
                },
                returnDate : null,
                notified: false,
            });

            for(const element of borrowers){
                if(element.user && element.user.email){
                    // const user = await User.findById(element.user.id);
                    sendEmail({
                        email: element.user.email,
                        subject: "Book return Reminder",
                        message: `Hello ${element.user.name}, \n\nThis is a reminder that the book you borrowed  is due for return. Please retun the book to the libraryn ASAP\n\nThank You`
                    });
                    element.notified = true;
                    await element.save();
                    console.log(`Email send to ${element.user.name}`);
                    
                }
            }
        } catch (error) {
            console.error("Some Error occured while notifying error")
        }
        
    });
}