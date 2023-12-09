<script setup>
import { useLayout } from '@/layout/composables/layout';
import { ref, computed, onMounted } from 'vue';
import AppConfig from '@/layout/AppConfig.vue';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

import { useRouter } from 'vue-router';
const router = useRouter();

import { authStore } from './../../../stores/authStore';
const store = authStore();

import axios from 'axios';

const { layoutConfig } = useLayout();
const username = ref('');
const password = ref('');
const checked = ref(false);
const loading = ref(false);

const logoUrl = computed(() => {
    return `layout/images/${layoutConfig.darkTheme.value ? 'logo-white' : 'logo-dark'}.svg`;
});

const login = async () => {
    const params = new URLSearchParams();
    params.append('username', username.value);
    params.append('password', password.value);

    loading.value = true;

    axios
        .post('http://localhost:5000/api/auth/login', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then((res) => {
            loading.value = false;
            const accessToken = res.data.accessToken;
            const role = res.data.user.role;
            store.accessToken = accessToken;
            store.role = role;
            toast.add({ severity: 'success', summary: 'Congratulation', detail: res.data.message, life: 3000 });
            router.push('/pages/dashboard');
        })
        .catch((err) => {
            loading.value = false;
            const errorValidation = err.response.data.errors;
            const errorAuth = err.response.data.message;

            if (errorValidation) {
                errorValidation.forEach((errors) => {
                    toast.add({ severity: 'error', summary: 'Error Message', detail: errors.msg, life: 3000 });
                });
                username.value = '';
                password.value = '';
            } else {
                toast.add({ severity: 'error', summary: 'Error Message', detail: errorAuth, life: 3000 });
                username.value = '';
                password.value = '';
            }
        });
};

onMounted(() => {
    if (store.accessToken) {
        router.push('/pages/dashboard');
    }
});
</script>

<template>
    <div class="surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden">
        <div class="flex flex-column align-items-center justify-content-center">
            <img :src="logoUrl" alt="Sakai logo" class="mb-5 w-6rem flex-shrink-0" />
            <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                <div class="w-full surface-card py-8 px-5 sm:px-8" style="border-radius: 53px">
                    <div class="text-center mb-5">
                        <img src="/demo/images/login/avatar.png" alt="Image" height="50" class="mb-3" />
                        <div class="text-900 text-3xl font-medium mb-3">Welcome, Isabel!</div>
                        <span class="text-600 font-medium">Sign in to continue</span>
                    </div>
                    <Toast />
                    <div>
                        <label for="username" class="block text-900 text-xl font-medium mb-2">Username</label>
                        <InputText id="username" type="text" placeholder="Username" class="w-full md:w-30rem mb-5" style="padding: 1rem" v-model="username" />

                        <label for="password1" class="block text-900 font-medium text-xl mb-2">Password</label>
                        <Password id="password1" v-model="password" placeholder="Password" :toggleMask="true" class="w-full mb-3" inputClass="w-full"></Password>

                        <Button :loading="loading" @click="login" label="Sign In" class="w-full text-center p-3 text-xl"></Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppConfig simple />
</template>

<style scoped>
.pi-eye {
    transform: scale(1.6);
    margin-right: 1rem;
}

.pi-eye-slash {
    transform: scale(1.6);
    margin-right: 1rem;
}
</style>
