const VAR_MESSAGE = (code, vars) => {
    let msg = code.message;
    for (let i = 0; i < vars.length; i++) {
        let regex = "${" + i + "}";
        msg = msg.replace(regex, vars[i]);
    }
    return { ...code, message: msg };
}

const ERROR_MESSAGE = (message) => ({
    errorCode: 2008010,
    status: 400,
    message: message,
});

module.exports = {
    BAD_REQUEST: {
        errorCode: 940000,
        status: 400,
        message: "Bad request",
    },
    
    NOT_FOUND: { errorCode: 940400, status: 404, message: "Not found" },
    
    ADD_FAILED: { errorCode: 100006, status: 400, message: "Add Failed" },
    UPDATE_FAILED: { errorCode: 100007, status: 400, message: "Update Failed" },
    NOT_EXIST: { errorCode: 100025, status: 404, message: "Not exist" },
    UPLOAD_FAILED_LIMIT_SIZE: { errorCode: 100013, status: 400, message: "upload failed for limit size" },
    FILE_READ_FAILED: { errorCode: 100019, status: 400, message: "download file failed" },

    VAR_MESSAGE,
    ERROR_MESSAGE,
}
