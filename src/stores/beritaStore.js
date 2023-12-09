import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';
import { categoryStore } from './categoryStore';
import { tagStore } from './tagStore';

export const beritaStore = defineStore('beritaStore', {
    state: () => ({
        berita: null,
        beritaById: null,
        kategori: null,
        tags: null,
        message: null,
        tagsMessage: null,
        categoryMessage: null,
        tagsById: null
    }),
    actions: {
        async getTags() {
            const store = authStore();
            try {
                await axios
                    .get('http://localhost:5000/api/tags', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.tagsMessage = res.data.message;
                            this.tags = res.data.tags;
                        } else {
                            this.tags = res.data.tags;
                            console.log(res.data.tags);
                        }
                        this.tags = res.data.tags;
                        console.log(res);
                        console.log(this.tags.length);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
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
                            this.kategori = res.data.kategoris;
                        } else {
                            this.kategori = res.data.kategoris;
                            console.log(res.data.kategoris);
                        }
                        this.kategori = res.data.kategoris;
                        console.log(res);
                        console.log(this.categories.length);
                    })
                    .catch((err) => {
                        // this.categoryMessage = err.response.data.message;
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async getBerita() {
            const store = authStore();
            const category = categoryStore();
            const tag = tagStore();

            try {
                await axios
                    .get('http://localhost:5000/api/berita', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.message = res.data.message;
                            this.berita = res.data.berita;
                        } else {
                            this.berita = res.data.berita;
                        }
                        this.berita = res.data.berita;
                        this.getCategory();
                        this.getTags();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        getKategori() {
            return this.kategori;
        },
        async getBeritaById(Id) {
            const store = authStore();

            const params = new FormData();
            params.append('id', Id);

            try {
                await axios
                    .get(`http://localhost:5000/api/berita/${Id}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            // this.message = res.data.message;
                            // this.berita = res.data.berita;
                            console.log(res);
                        } else {
                            this.beritaById = res.data.berita;
                            this.tagsById = res.data.berita.tags;
                            // this.getCategory();
                            // this.getTags();
                            console.log(res);
                        }
                        // this.berita = res.data.berita;
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async addBerita(judul, konten, kategori, tags, image) {
            const store = authStore();

            const params = new FormData();
            params.append('judul', judul);
            params.append('konten', konten);
            params.append('kategori', kategori);
            params.append('tags', tags);
            params.append('image', image);

            try {
                await axios
                    .post('http://localhost:5000/api/berita', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.berita = res.data.berita;
                        this.getBerita();
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
        async deleteBerita(idBerita) {
            const store = authStore();

            try {
                await axios
                    .delete(`http://localhost:5000/api/berita/${idBerita}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.berita = res.data.berita;
                        this.getBerita();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async updateBerita(idBerita, judul, konten, kategori, tags, image) {
            const store = authStore();

            const params = new FormData();
            params.append('judul', judul);
            params.append('konten', konten);
            params.append('kategori', kategori);
            params.append('tags', tags);
            params.append('image', image);

            try {
                await axios
                    .put(`http://localhost:5000/api/berita/${idBerita}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.berita = res.data.berita;
                        this.getBerita();
                        console.log(res);
                    })
                    .catch((err) => {
                        throw err;
                    });
            } catch (error) {
                console.log(error);
                throw error;
            }
        }
    }
});
