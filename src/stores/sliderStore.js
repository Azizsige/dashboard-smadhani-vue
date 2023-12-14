import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';

export const sliderStore = defineStore('sliderStore', {
    state: () => ({
        slider: null,
        message: null,
        imageGetter: null,
        imageSet: [],
        imageSetUpdate: [],
        fileName: '',
        fileUrl: null,
        loadingData: false
    }),
    actions: {
        async getSlider() {
            const store = authStore();
            try {
                await axios
                    .get('http://localhost:5000/api/slider', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.message = res.data.message;
                            this.slider = res.data.slider;
                        } else {
                            console.log(res);
                            this.slider = res.data.slider;
                        }
                        // this.slider = getimageBase64;

                        console.log(this.slider);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async getSliderById(id) {
            const store = authStore();
            console.log(id);
            this.loadingData = true;
            try {
                await axios
                    .get(`http://localhost:5000/api/slider/${id}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        console.log(res);
                        this.fileName = res.data.slider.images;
                        this.fileUrl = res.data.slider.url;
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
        async addSlider(image) {
            const store = authStore();

            const params = new FormData();
            params.append('images', image);

            try {
                await axios
                    .post('http://localhost:5000/api/slider', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.slider = res.data.slider;
                        this.getSlider();
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
        async deleteSlider(ids) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('ids', ids);

            try {
                await axios
                    .delete(`http://localhost:5000/api/slider/`, {
                        data: params,
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.slider = res.data.slider;
                        this.getSlider();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async updateSlider(idImage, images) {
            const store = authStore();

            const params = new FormData();
            params.append('images', images);

            try {
                await axios
                    .put(`http://localhost:5000/api/slider/${idImage}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.slider = res.data.slider;
                        this.getSlider();
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
