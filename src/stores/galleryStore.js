import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';

export const galleryStore = defineStore('galleryStore', {
    state: () => ({
        galleries: null,
        message: null,
        imageGetter: null,
        imageSet: [],
        imageSetUpdate: [],
        fileName: '',
        fileUrl: null,
        loadingData: false
    }),
    actions: {
        async getGallery() {
            const store = authStore();
            try {
                await axios
                    .get('http://localhost:5000/api/galeri', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.message = res.data.message;
                            this.galleries = res.data.galeri;
                        } else {
                            console.log(res);
                            this.galleries = res.data.galeri;
                        }
                        // this.galleries = getimageBase64;

                        console.log(this.galleries);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async getGalleryById(id) {
            const store = authStore();
            console.log(id);
            this.loadingData = true;
            try {
                await axios
                    .get(`http://localhost:5000/api/galeri/${id}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        console.log(res);
                        this.fileName = res.data.galeri.images;
                        this.fileUrl = res.data.galeri.url;
                        this.loadingData = false;
                    })
                    .catch((err) => {
                        console.log(err);
                        this.loadingData = false;
                    });
            } catch (error) {
                console.log(error);
            }
        },
        getGalleryImageUrl(gallery) {
            // Konversi buffer ke base64
            const imageBase64 = Buffer.from(gallery.image.data.data).toString('base64');
            // Buat image url
            const imageUrl = `data:${gallery.image.contentType};base64,${imageBase64}`;

            return imageUrl;
        },
        async addGallery(images) {
            const store = authStore();

            const params = new FormData();
            params.append('images', images);

            try {
                await axios
                    .post('http://localhost:5000/api/galeri', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.galleries = res.data.galeri;
                        this.getGallery();
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
        async deleteGallery(ids) {
            console.log(ids);
            const store = authStore();

            const params = new URLSearchParams();
            params.append('ids', ids);
            try {
                await axios
                    .delete(`http://localhost:5000/api/galeri`, {
                        data: params,
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.galleries = res.data.galeri;
                        this.getGallery();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
                console.log(error.headers);
            }
        },
        async updateGallery(idImage, images) {
            const store = authStore();

            const params = new FormData();
            params.append('images', images);

            try {
                await axios
                    .put(`http://localhost:5000/api/galeri/${idImage}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.galleries = res.data.galeri;
                        this.getGallery();
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
