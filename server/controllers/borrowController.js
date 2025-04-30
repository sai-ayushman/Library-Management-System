import  { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/errorMiddlewares.js"
import { Borrow } from "../models/borrowModel.js"
import { Book } from "../models/bookModel.js"
import { User } from "../models/userModel.js"
import mongoose from "mongoose"
import { calculateFine } from "../utils/fineCalculator.js"


export const recordBorrowedBooks = catchAsyncErrors(async(req , res , next ) => {
    console.log("Working 10");
    
    const  { id } = req.params;
    const { email } = req.body;
    // console.log("Working 13");
    // console.log(id);
    

    const book = await Book.findById(id);
    // console.log("Received Book ID:", book);
    // console.log("Working 15");
    
    if(!book){
        return next(new ErrorHandler("Book not found." , 404));
    }
    const user = await User.findOne({ email, accountVerified: true})
    if(!user){
        return next(new ErrorHandler("User not found." , 404));
    }
    if(book.quantity === 0 ){
        return next(new ErrorHandler("Book not available.", 400));
    }
    const isAlreadyBorrowed = user.borrowBooks.find(
        (b) => b.bookId.toString() === id && b.returned === false 
    );
    if(isAlreadyBorrowed){
        return next(new ErrorHandler("Book already borrowed.", 400));
    }
    book.quantity -= 1
    book.availability = book.quantity > 0;
    await book.save();
    
    user.borrowBooks.push({
        bookId: book._id,
        bookTitle: book.title,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();
    await Borrow.create({
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
        },
        book:book._id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        price: book.price,
    });
    res.status(200).json({
        success: true,
        message: "Borrowed book recorded Successfully"
    });
})

export const returnBorrowBook = catchAsyncErrors(async(req , res , next ) => {
    const { bookId } = req.params;
    const{ email } = req.body;
    const book = await Book.findById(bookId);

    if(!book){
        return next(new ErrorHandler("Book not found." , 404));
    }
    const user = await User.findOne({ email, accountVerified: true })
    if(!user){
        return next(new ErrorHandler("User not found." , 404));
    }

    const borrowedBook = user.borrowBooks.find(
        (b) => b.bookId.toString() === bookId && b.returned === false
    );
    if(!borrowedBook){
        return next(new ErrorHandler("You have not borrowed this book.", 400))
    }
    borrowedBook.returned = true;
    await user.save();

    book.quantity += 1
    book.availability = book.quantity > 0;
    await book.save();

    const borrow = await Borrow.findOne({
        book: bookId,
        "user.email": email,
        returnDate: null,
    }
    )
    if(!borrow){
        return next(new ErrorHandler("You have noty borrowed this book.", 400))
    }
    borrow.returnDate = new Date();

    const fine = calculateFine(borrow.dueDate);
    borrow.fine = fine;
    await borrow.save();
    res.status(200).json({
        success:true,
        message: 
            fine !== 0 
            ? `The book has been returned Succesfully.The Total charges, including a fine are $${fine + book.price}`
            : `The book has been returned Succesfully.The Total charges are $${book.price}`
    })
})


export const borrowedBooks = catchAsyncErrors(async(req , res , next ) => {
    const { borrowBooks } = req.user;
    res.status(200).json({
        success: true,
        borrowBooks,
    })
})


export const getBorrowedBooksForAdmin = catchAsyncErrors(async(req , res , next ) => {
    const borrowBooks  = await Borrow.find();
    res.status(200).json({
        success: true,
        borrowBooks,
    })
})
