import { HttpInterceptorFn } from '@angular/common/http';

const API_BASE_URL = 'https://tech-site.aletbeta.com/api/';

export const domainInterceptor: HttpInterceptorFn = (req, next) => {
  const isAbsolute = /^https?:\/\//i.test(req.url);
  if (!isAbsolute) {
    const normalizedBase = API_BASE_URL.replace(/\/$/, '');
    const normalizedPath = req.url.startsWith('/') ? req.url : `/${req.url}`;

    const updated = req.clone({
      url: `${normalizedBase}${normalizedPath}`,
    });

    return next(updated);
  }

  return next(req);
};
