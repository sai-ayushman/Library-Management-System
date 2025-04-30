// class Error{
//     constructor(message){
//         this.message=message
//     }
// }

// throw new Error("This is an error Message")

class ErrorHandler extends Error{
    constructor(message , statusCode ){
        super(message);
        this.statusCode = statusCode;

    }
}
export const errorMiddleware = (err, req ,res , next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    if(err.code === 11000){
        const statusCode = 400;
        const message = "Duplicate Filed Value Entered";
        err = new ErrorHandler(message, statusCode);
    }


    if(err.name === "JsonWebTokenError"){
        const statusCode = 400;
        const message = "Json Web Token Is Invalid. Try Again.";
        err = new ErrorHandler(message, statusCode);
    }

    if(err.name === "TokenExpiredError"){
        const statusCode = 400;
        const message = "Json Web Token is expired. Try Again";
        err = new ErrorHandler(message, statusCode);
    }

    if(err.name === "CastError"){
        const statusCode = 400;
        const message = `Resources not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, statusCode);
        // console.log("Book ID Received:", id);

    }


    const errorMessage = err.errors ? Object.values(err.errors).map((error) => error.message).join(" ") : err.message;

    return res.status(err.statusCode).json({
        success : false,
        message: errorMessage,
    });

}

export default ErrorHandler;