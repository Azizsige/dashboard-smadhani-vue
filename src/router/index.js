import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

import axios from 'axios';

import { authStore } from './../stores/authStore';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        {
            path: '/pages/dashboard',
            component: AppLayout,
            meta: {
                requiresAuth: true
            },
            children: [
                {
                    path: '/pages/dashboard',
                    name: 'dashboard',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/pages/crud',
                    name: 'crud',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Crud.vue')
                },
                {
                    path: '/pages/artikel',
                    name: 'artikel',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Artikel.vue')
                },
                {
                    path: '/pages/kategori',
                    name: 'kategori',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Kategori.vue')
                },
                {
                    path: '/pages/galeri',
                    name: 'galeri',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Gallery.vue')
                },
                {
                    path: '/pages/tag',
                    name: 'tag',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Tag.vue')
                },
                {
                    path: '/pages/gallery',
                    name: 'gallery',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Gallery.vue')
                },
                {
                    path: '/pages/slider',
                    name: 'slider',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Slider.vue')
                },
                {
                    path: '/pages/facility',
                    name: 'facility',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Fasilitas.vue')
                },
                {
                    path: '/pages/users',
                    name: 'users',
                    meta: {
                        requiresAuth: true
                    },
                    component: () => import('@/views/pages/Users.vue')
                }
            ]
        },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue')
        },

        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue')
        },
        {
            path: '/auth/error',
            name: 'error',
            component: () => import('@/views/pages/auth/Error.vue')
        }
    ]
});

async function validationToken(token) {
    try {
        await axios.get('http://localhost:5000/api/auth/validate', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return true;
    } catch (error) {
        return false;
    }
}

router.beforeEach(async (to, from, next) => {
    console.log('Checking if access is allowed.');
    const authRequired = to.meta.requiresAuth;
    const store = authStore();

    console.log('to.name:', to.name);
    console.log('store.accessToken:', store.accessToken);

    if (authRequired && !store.accessToken) {
        console.log('Redirecting to login because accessToken is missing.');
        next('/');
    } else if (to.name === 'login' && store.accessToken) {
        const isValidToken = await validationToken(store.accessToken);

        if (!isValidToken) {
            console.log('Redirecting to login because accessToken is invalid.');
            store.accessToken = null;
            next('/');
        } else {
            console.log('Access is allowed.');
            next();
        }
    } else if (
        to.name === 'dashboard' ||
        to.name === 'artikel' ||
        to.name === 'kategori' ||
        to.name === 'galeri' ||
        to.name === 'tag' ||
        to.name === 'gallery' ||
        to.name === 'slider' ||
        to.name === 'facility' ||
        to.name === 'crud' ||
        store.accessToken
    ) {
        const isValidToken = await validationToken(store.accessToken);

        if (!isValidToken) {
            console.log('Redirecting to login because accessToken is invalid.');
            store.accessToken = null;
            store.role = null;
            next('/');
        } else {
            console.log('Access is allowed.');
            next();
        }
    } else {
        console.log('Access is allowed.');
        next();
    }
});

export default router;
