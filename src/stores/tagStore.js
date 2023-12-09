import { defineStore } from 'pinia';
import axios from 'axios';
import { authStore } from './authStore';

export const tagStore = defineStore('tagStore', {
    state: () => ({
        tags: null,
        message: null
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
                            this.message = res.data.message;
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
        async addTags(nameTag) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('namaTag', nameTag);

            try {
                await axios
                    .post('http://localhost:5000/api/tags', params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
                        this.getTags();
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
        async deleteTag(idTag) {
            const store = authStore();

            try {
                await axios
                    .delete(`http://localhost:5000/api/tags/${idTag}`, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
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
        async deleteTagMany(ids) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('ids', ids);
            try {
                await axios
                    .delete(`http://localhost:5000/api/tags/many`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
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
        async updateTag(idTag, nameTag) {
            const store = authStore();

            const params = new URLSearchParams();
            params.append('namaTag', nameTag);

            try {
                await axios
                    .put(`http://localhost:5000/api/tags/${idTag}`, params, {
                        headers: {
                            Authorization: `Bearer ${store.accessToken}`
                        }
                    })
                    .then((res) => {
                        // this.tags = res.data.tags;
                        this.getTags();
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
