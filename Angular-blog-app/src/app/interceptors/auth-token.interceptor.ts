import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { ACCESS_TOKEN_STORAGE_KEY } from '../services/auth/auth.models';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

    const isBackendRequest =
        request.url.startsWith(environment.apiUrl) ||
        request.url.startsWith(environment.graphqlUrl);

    if (!token || !isBackendRequest) {
        return next(request);
    }

    return next(
        request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        })
    );
};