import { ArgumentsHost, ExceptionFilter, HttpException } from '@nestjs/common';
import { I18nError } from '../../i18n/i18n-error';
/**
 * Logs thrown I18nErrors via the configured VendureLogger.
 */
export declare class ExceptionLoggerFilter implements ExceptionFilter {
    catch(exception: Error | HttpException | I18nError, host: ArgumentsHost): I18nError | undefined;
    /**
     * For a given I18nError.code, returns a corresponding HTTP
     * status code.
     */
    private errorCodeToStatusCode;
}
