import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';

import { useRouter } from 'vue-router';

export const userStore = defineStore('userStore', {
    state: () => ({
        users: null,
        message: null
    }),
    actions: {
        async getUsers() {
            const store = authStore();
            const router = useRouter();
            try {
                await axios
                    .get('http://localhost:5000/api/user/all', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.message = res.data.message;
                            this.users = res.data.users;
                        } else {
                            this.users = res.data.users;
                            console.log(res.data.users);
                        }
                        this.users = res.data.users;
                        console.log(res);
                        console.log(this.users.length);
                    })
                    .catch((err) => {
                        router.push('/auth/access');
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async addUser(username, password) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            try {
                await axios
                    .post('http://localhost:5000/api/user/add', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.users = res.data.users;
                        this.getUsers();
                        console.log(res);
                    })
                    .catch((err) => {
                        throw err;
                    });
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        async deleteUser(idUser) {
            const store = authStore();

            try {
                await axios
                    .delete(`http://localhost:5000/api/user/delete/${idUser}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.users = res.data.users;
                        this.getUsers();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async updateUser(idUser, username, password) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            try {
                await axios
                    .put(`http://localhost:5000/api/user/update/${idUser}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.users = res.data.users;
                        this.getUsers();
                        console.log(res);
                    })
                    .catch((err) => {
                        throw err;
                    });
            } catch (error) {
                console.log(error);
                throw error;
            }
        },
        test() {
            console.log('test');
        }
    }
});
