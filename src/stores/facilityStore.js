import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';

export const facilityStore = defineStore('facilityStore', {
    state: () => ({
        fasilitas: null,
        message: null,
        imageGetter: null,
        imageSet: null,
        imageSetUpdate: null,
        fileName: '',
        fileUrl: null,
        loadingData: false
    }),
    actions: {
        async getFacility() {
            const store = authStore();
            try {
                await axios
                    .get('http://localhost:5000/api/fasilitas', {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        if (res.data.status === 'false') {
                            this.message = res.data.message;
                            this.fasilitas = res.data.fasilitas;
                        } else {
                            console.log(res);
                            this.fasilitas = res.data.fasilitas;
                        }
                        // this.galleries = getimageBase64;

                        console.log(this.fasilitas);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async getFacilityById(id) {
            const store = authStore();
            console.log(id);
            this.loadingData = true;
            try {
                await axios
                    .get(`http://localhost:5000/api/fasilitas/${id}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        console.log(res);
                        this.fileName = res.data.fasilitas.image;
                        this.fileUrl = res.data.fasilitas.url;
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
        async addFacility(image, namaFasilitas) {
            const store = authStore();

            const params = new FormData();
            params.append('image', image);
            params.append('namaFasilitas', namaFasilitas);

            try {
                await axios
                    .post('http://localhost:5000/api/fasilitas', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.galleries = res.data.galeri;
                        this.getFacility();
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
        async deleteFacility(ids) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('ids', ids);

            try {
                await axios
                    .delete(`http://localhost:5000/api/fasilitas`, {
                        data: params,
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.galleries = res.data.galeri;
                        this.getFacility();
                        console.log(res);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } catch (error) {
                console.log(error);
            }
        },
        async updateFacility(idFasilitas, image, namaFasilitas) {
            const store = authStore();

            const params = new FormData();
            params.append('image', image);
            params.append('namaFasilitas', namaFasilitas);

            try {
                await axios
                    .put(`http://localhost:5000/api/fasilitas/${idFasilitas}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`,
                            'Content-Type': `multipart/form-data`
                        }
                    })
                    .then((res) => {
                        // this.galleries = res.data.galeri;
                        this.getFacility();
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
