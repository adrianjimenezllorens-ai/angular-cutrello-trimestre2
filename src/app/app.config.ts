import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { baseUrlInterceptor } from './shared/interceptors/base-url-interceptor';
import { provideSignalFormsConfig, SignalFormsConfig } from '@angular/forms/signals';
import { tokenInterceptor } from './shared/interceptors/token-interceptor';
import { provideGoogleId } from './google-login/google-login.config';
import { provideFacebookId } from './facebook-login/facebook-login.config';

export const NG_STATUS_CLASSES: SignalFormsConfig['classes'] = {
  'ng-touched': ({state}) => state().touched(),
  'ng-untouched': ({state}) => !state().touched(),
  'ng-dirty': ({state}) => state().dirty(),
  'ng-pristine': ({state}) => !state().dirty(),
  'ng-valid': ({state}) => state().valid(),
  'ng-invalid': ({state}) => state().invalid(),
  'ng-pending': ({state}) => state().pending(),
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([baseUrlInterceptor, tokenInterceptor])),
    provideGoogleId('649332112115-17d30ck7739diviuf24vtthnkcd2onfo.apps.googleusercontent.com'),
    provideFacebookId('id_ejemplo', 'v22.0'),
    provideSignalFormsConfig({
      classes: NG_STATUS_CLASSES,
    }),
  ]
};
