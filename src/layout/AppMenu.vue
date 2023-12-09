<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

import axios from 'axios';

import { useRouter } from 'vue-router';
const router = useRouter();

import { authStore } from './../stores/authStore';
const store = authStore();

const loading = ref(false);

const logout = () => {
    loading.value = true;
    const params = new URLSearchParams();
    params.append('accessToken', store.accessToken);
    axios
        .post(`http://localhost:5000/api/auth/logout`, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${store.accessToken}`
            }
        })
        .then((res) => {
            store.accessToken = null;
            store.role = null;
            router.push('/');
        })
        .catch((err) => {
            console.log(err);
        });

    loading.value = false;
};

const model = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/pages/dashboard' },
            { label: 'Artikel', icon: 'pi pi-fw pi-book', to: '/pages/artikel' },
            { label: 'Tags', icon: 'pi pi-fw pi-images', to: '/pages/tag' },
            { label: 'Kategori', icon: 'pi pi-fw pi-list', to: '/pages/kategori' },
            { label: 'Galeri', icon: 'pi pi-fw pi-images', to: '/pages/gallery' }
        ]
    },
    {
        label: 'Settings',
        items: [
            { label: 'Slider Images', icon: 'pi pi-fw pi-images', to: '/pages/slider' },
            { label: 'Fasilitas Images', icon: 'pi pi-fw pi-images', to: '/pages/facility' },
            { label: 'Users', icon: 'pi pi-fw pi-users', to: '/pages/users' }
        ]
    },
    {
        label: 'Logout',
        items: [{ label: 'Logout', icon: 'pi pi-fw pi-sign-out', command: logout }]
    }
]);

const modelAdmin = ref([
    {
        label: 'Home',
        items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/pages/dashboard' },
            { label: 'Artikel', icon: 'pi pi-fw pi-book', to: '/pages/artikel' },
            { label: 'Tags', icon: 'pi pi-fw pi-images', to: '/pages/tag' },
            { label: 'Kategori', icon: 'pi pi-fw pi-list', to: '/pages/kategori' },
            { label: 'Galeri', icon: 'pi pi-fw pi-images', to: '/pages/gallery' }
        ]
    },
    {
        label: 'Settings',
        items: [
            { label: 'Slider Images', icon: 'pi pi-fw pi-images', to: '/pages/slider' },
            { label: 'Fasilitas Images', icon: 'pi pi-fw pi-images', to: '/pages/facility' }
        ]
    },
    {
        label: 'Logout',
        items: [{ label: 'Logout', icon: 'pi pi-fw pi-sign-out', command: logout }]
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-if="store.role == 'super admin'" v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <template v-else v-for="(itemAdmin, i) in modelAdmin" :key="itemAdmin">
            <app-menu-item v-if="!itemAdmin.separator" :item="itemAdmin" :index="i"></app-menu-item>
            <li v-if="itemAdmin.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
