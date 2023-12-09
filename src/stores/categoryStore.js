import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';

export const categoryStore = defineStore('categoryStore', {
    state: () => ({
        categories: null,
        message: null
    }),
    actions: {
        async getCategory() {
            const store = authStore();
            try {
                await axios
                    .get('http://localhost:5000/api/kategori', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.message = res.data.message;
                            this.categories = res.data.kategoris;
                        } else {
                            this.categories = res.data.kategoris;
                            console.log(res.data.kategoris);
                        }
                        this.categories = res.data.kategoris;
                        console.log(res);
                        console.log(this.categories.length);
                    })
                    .catch((err) => {
                        this.message = err.response.data.message;
                        console.log(this.message);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async addCategory(nameCategory) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('namaKategori', nameCategory);

            try {
                await axios
                    .post('http://localhost:5000/api/kategori', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
                        this.getCategory();
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
        async deleteCategory(idCategory) {
            const store = authStore();

            try {
                await axios
                    .delete(`http://localhost:5000/api/kategori/${idCategory}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
                        this.getCategory();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async deleteCategoryMany(ids) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('ids', ids);
            try {
                await axios
                    .delete(`http://localhost:5000/api/kategori/many`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
                        this.getCategory();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async updateCategory(idCategory, nameCategory) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('namaKategori', nameCategory);

            try {
                await axios
                    .put(`http://localhost:5000/api/kategori/${idCategory}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
                        this.getCategory();
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
