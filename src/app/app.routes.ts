import { Routes } from '@angular/router';
import { Public } from './shared/layouts/public/public';
import { Home } from './pages/public/home/home';
import { Login } from './pages/public/login/login';
import { authGuard } from './guards/auth/auth-guard';
import { Dashboard } from './pages/authenticated/dashboard/dashboard';
import { Authenticated } from './shared/layouts/authenticated/authenticated';
import { Controls } from './pages/authenticated/controls/controls';
import { Framework } from './pages/authenticated/framework/framework';
import { FrameworkCategory } from './pages/authenticated/framework/framework-category/framework-category';
import { Countdown } from './pages/public/countdown/countdown';
import { ControlType } from './pages/authenticated/controls/control-type/control-type';
import { Register } from './pages/public/register/register';
import { environment } from '../environments/environment';
import { loginGuard } from './guards/login/login-guard';
import { VerifyEmail } from './pages/public/verify-email/verify-email';
export const routes: Routes = [
    {
        path: 'countdown',
        component: Countdown,
        title: `${environment.applicationName} | Enterprise GRC Platform`
    },
    {
        path: '',
        component: Public,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: Home
            },
            {
                path: 'login',
                canActivate: [loginGuard],
                component: Login,
                title: `Login | ${environment.applicationName}`

            },
            {
                path:'register',
                canActivate: [loginGuard],
                component:Register,
                
                
            },
            {
                path:'verify-email/:token',
                canActivate:[loginGuard],
                component:VerifyEmail,
                title:`Verify Email | ${environment.applicationName}`
            }
        ]
    },
    {
        path: '',
        canActivateChild: [authGuard],
        component: Authenticated,
        children: [
            {
                path: 'dashboard',
                component: Dashboard,
                title: `Dashboard | ${environment.applicationName}`
            },
            {
                path: 'controls',
                component: Controls,
                title: `Controls | ${environment.applicationName}`
            },
           
            {
                path: 'frameworks',
                component: Framework,
                title: `Frameworks | ${environment.applicationName}`
            },
            {
                path: 'framework-categories',
                component: FrameworkCategory,
                title: `Framework Categories | ${environment.applicationName}`
            },
            {
                path: 'control-types',
                component: ControlType,
                title: `Control Types | ${environment.applicationName}`
            }


        ]
    }
];
