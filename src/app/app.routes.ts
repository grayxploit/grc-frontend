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
export const routes: Routes = [
    {
        path: 'countdown',
        component: Countdown,
        title: 'GrayviX | Enterprise GRC Platform'
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
                component: Login

            },
            {
                path:'register',
                component:Register
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
                data: { title: 'Dashboard', description: 'User dashboard' }
            },
            {
                path: 'controls',
                component: Controls,
                title: 'Controls'
            },
           
            {
                path: 'frameworks',
                component: Framework,
                title: 'Frameworks'
            },
            {
                path: 'framework-categories',
                component: FrameworkCategory,
                title: 'Framework Categories'
            },
            {
                path: 'control-types',
                component: ControlType,
                title: 'Control Types'
            }


        ]
    }
];
