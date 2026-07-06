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
import { CreateOrganization } from './pages/authenticated/create-organization/create-organization';
import { Countdown } from './pages/public/countdown/countdown';
import { ControlType } from './pages/authenticated/controls/control-type/control-type';
import { Register } from './pages/public/register/register';
import { environment } from '../environments/environment';
import { loginGuard } from './guards/login/login-guard';
import { VerifyEmail } from './pages/public/verify-email/verify-email';
import { ForgotPassword } from './pages/public/forgot-password/forgot-password';
import { ResetPassword } from './pages/public/reset-password/reset-password';
import { adminGuard, superAdminGuard, userGuard } from './guards/auth/role-guard';
import { Industry } from './pages/authenticated/industry/industry';
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
            },
            {
                path:'forgot-password',
                canActivate:[loginGuard],
                component:ForgotPassword,
                title:`Forgot Password | ${environment.applicationName}`
            },
            {
                path: 'reset-password/:token',
                canActivate: [loginGuard],
                component: ResetPassword,
                title: `Reset Password | ${environment.applicationName}`
            }
        ]
    },
    {
        path: '',
        canActivateChild: [authGuard],
        component: Authenticated,
        children: [
            {
                path: 'create-organization',
                canActivate: [adminGuard],
                component: CreateOrganization,
                title: `Create Organization | ${environment.applicationName}`
            },
            {
                path: 'dashboard',
                component: Dashboard,
                title: `Dashboard | ${environment.applicationName}`
            },
            {
                path: 'superadmin-only',
                canActivate: [superAdminGuard],
                component: Dashboard,
                title: `Super Admin | ${environment.applicationName}`
            },
            {
                path: 'admin-only',
                canActivate: [adminGuard],
                component: Dashboard,
                title: `Admin | ${environment.applicationName}`
            },
            {
                path: 'user-only',
                canActivate: [userGuard],
                component: Dashboard,
                title: `User | ${environment.applicationName}`
            },
            {
                path: 'controls',
                canActivate: [superAdminGuard],
                component: Controls,
                title: `Controls | ${environment.applicationName}`
            },
           
            {
                path: 'frameworks',
                canActivate: [superAdminGuard],
                component: Framework,

                title: `Frameworks | ${environment.applicationName}`
            },
            {
                path: 'framework-categories',
                canActivate: [superAdminGuard],
                component: FrameworkCategory,
                title: `Framework Categories | ${environment.applicationName}`
            },
            {
                path: 'control-types',
                canActivate: [superAdminGuard],
                component: ControlType,
                title: `Control Types | ${environment.applicationName}`
            },
            {
                path: 'industries',
                canActivate: [superAdminGuard],
                component: Industry,
                title: `Industries | ${environment.applicationName}`
            }


        ]
    }
];
