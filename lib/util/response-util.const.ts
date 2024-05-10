
export enum ErrorCode {
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
    NotImplemented = 501,
}

export interface ErrorResponse {
    error: true;
    message?: string;
    errorCode?: ErrorCode;
}

export interface SuccessResponse<TData = any> {
    error: false;
    data: TData;
}

export type ResponseResult<TData = any> = SuccessResponse<TData> | ErrorResponse;

export const responses = {
    isError(response: ResponseResult<any>): response is ErrorResponse {
        return response.error;
    },
    isServerError(response: ResponseResult<any>): response is ErrorResponse {
        return response.error && (response.errorCode ? response.errorCode >= 500 : false);
    },
    isSuccess<TData>(response: ResponseResult<TData>): response is SuccessResponse<TData> {
        return !response.error;
    },
    error(message?: string, errorCode?: ErrorCode): ErrorResponse {
        return { error: true, message, errorCode };
    },
    success<TData>(data: TData): SuccessResponse<TData> {
        return { error: false, data };
    },
};

