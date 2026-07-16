export type TranslateErrorCode = number | 'BAD_NETWORK' | 'BAD_RESPONSE';

export class TranslateError extends Error {
    readonly code: TranslateErrorCode;

    constructor(message: string, code: TranslateErrorCode, options?: ErrorOptions) {
        super(message, options);
        this.name = 'TranslateError';
        this.code = code;
    }
}
