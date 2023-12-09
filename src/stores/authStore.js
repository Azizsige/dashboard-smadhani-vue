import { defineStore } from 'pinia';
import axios from 'axios';

export const authStore = defineStore('authStore', {
    state: () => ({
        accessToken: null,
        role: null
    }),
    actions: {
        async validationToken(token) {
            try {
                await axios
                    .get('http://localhost:5000/api/auth/validate', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                    .then((res) => {
                        return true;
                    });
            } catch (error) {
                return false;
            }
        }
    },
    persist: {
        path: ['accessToken', 'role']
    }
});
