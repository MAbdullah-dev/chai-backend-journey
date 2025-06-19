class APIError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message); // Set the base message from Error

        this.name = this.constructor.name; // Optional: makes error name clearer
        this.statusCode = statusCode;
        this.data = null; // Optional, set this to some response data if needed
        this.success = false; // Useful for API responses
        this.errors = errors;

        // Capture custom or default stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default APIError;
