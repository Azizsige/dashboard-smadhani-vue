<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount, computed, nextTick } from 'vue';
import ProductService from '@/service/ProductService';
import { useToast } from 'primevue/usetoast';
import FileUpload from 'primevue/fileupload';
import Editor from 'primevue/editor';
const toast = useToast();

import { beritaStore } from './../../stores/beritaStore';
import { storeToRefs } from 'pinia';
import { sliderStore } from '../../stores/sliderStore';
const store = beritaStore();
const { getKategori } = storeToRefs(store);

const test = ref('');

const products = ref(null);
const imageBase = ref('');
const imageBerita = ref(null);
const imageContentType = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const viewProductDialog = ref(false);
const updateProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});
const selectedProducts = ref(null);
const dt = ref(null);
const loading = ref(false);
const loadingData = ref(true);
const message = ref();
const filters = ref({});
const submitted = ref(false);
const tagsUpdated = ref([]);
// const selectedCountry = ref({ name: 'Australia', code: 'AU' });
const categoryUpdated = ref("huhu");
// const countries = ref([
//     { name: 'Australia', code: 'AU' },
//     { name: 'Brazil', code: 'BR' },
//     { name: 'China', code: 'CN' },
//     { name: 'Egypt', code: 'EG' },
//     { name: 'France', code: 'FR' },
//     { name: 'Germany', code: 'DE' },
//     { name: 'India', code: 'IN' },
//     { name: 'Japan', code: 'JP' },
//     { name: 'Spain', code: 'ES' },
//     { name: 'United States', code: 'US' },
// ]);
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

const selected = ref({ _id: '6514190a8c80fd0d994af716', namaKategori: 'sadf' });

const kategoris = computed(() => {
    return store.kategori;
});
const tags = computed(() => {
    return store.tags;
});

const SelectTags = ref(null);
SelectTags.value = store.tags;
console.log(store.tags);

const selectedCategories = ref([]);

const selectedCategoriesUpdate = ref(store.tagsById);

const productService = new ProductService();

// Get Slider
const getBerita = async () => {
    await store.getBerita();
    loadingData.value = false;
    message.value = await store.message;
    kategoris.value = await store.kategori;
};

// Add Slider
const addBerita = async (judul, konten, kategori) => {
    loading.value = await true;
    loadingData.value = await true;
    try {
        await store.addBerita(judul, konten, kategori, selectedCategories.value, imageBerita.value);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${judul} Image has been added!`, life: 3000 });
        await getBerita();
        productDialog.value = await false;
        imageBase.value = await '';
        imageBerita.value = await '';
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `Image has been exist`, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
};

// Delete Tag
const deleteBerita = async (Id, judul) => {
    loading.value = await true;
    loadingData.value = await true;
    try {
        await store.deleteBerita(Id);
        await getBerita();
        deleteProductDialog.value = await false;
        imageBase.value = await '';
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${judul} has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `Image has been exist`, life: 3000 });
    }

    loading.value = await true;
    loadingData.value = await true;
};

// Delete Many Tag
const deleteBeritaMany = async () => {
    loading.value = await true;
    loadingData.value = await true;
    try {
        const selectedTag = selectedProducts.value;
        console.log(selectedTag.value);
        selectedTag.forEach(async (berita) => {
            await store.deleteBerita(berita._id);
        });
        await getBerita();
        deleteProductsDialog.value = await false;
        imageBase.value = await '';
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Selected Slider has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.message, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
    // get selected tag
};

// Update Tag
const updateArticle = async (id, judul, konten, kategori) => {
    console.log(kategori)
    // loading.value = await true;
    // loadingData.value = await true;
    // try {
    //     await store.updateBerita(id, judul, konten, kategori, selectedCategories.value, imageBerita.value);
    //     // Menjalankan langkah selanjutnya setelah semua promise selesai
    //     await store.getBerita();
    //     await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${judul} has been updated!`, life: 3000 });
    //     updateProductDialog.value = await false;
    //     imageBase.value = await '';
    //     imageBerita.value = await '';
    // } catch (error) {
    //     await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `${judul} has been exist`, life: 3000 });
    // }
    // loading.value = await false;
    // loadingData.value = await false;
    // imageBase.value = await '';
};

// noColumn
const noColumn = (rowData, column) => {
    const rowIndex = store.berita.indexOf(rowData);
    return rowIndex + 1;
};

// Upload File
const onFileChange = (e) => {
    imageBerita.value = e.target.files[0];
    const files = e.target.files[0];
    const reader = new FileReader(files);
    reader.onload = () => {
        imageBase.value = reader.result;
    };
    reader.readAsDataURL(files);
};

const isTagSelected = (tag) => {
    return product.value.tags.some((t) => t._id === tag._id);
};

const updateTags = async (tag) => {
    if (isTagSelected(tag)) {
        product.value.tags = product.value.tags.filter((t) => t._id !== tag._id);
        console.log(tag);
    } else {
        product.value.tags.push(tag);
    }

    await nextTick();
};

onBeforeMount(() => {
    initFilters();
});
onMounted(async () => {
    await getBerita();
    console.log(message.value);
});
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
    console.log(imageBerita.value, imageBase.value);
    console.log(store.getKategori());
};

const hideDialog = async () => {
    // productDialog.value = false;
    // submitted.value = false;
    updateProductDialog.value = await false;
    productDialog.value = await false;
    deleteProductDialog.value = await false;
    deleteProductsDialog.value = await false;
    viewProductDialog.value = await false;
    imageBase.value = '';
};

const editProduct = async (editProduct, id) => {
    console.log(editProduct, id)
    tagsUpdated.value = editProduct.tags.map((tag) => tag.namaTag);

    product.value = { ...editProduct };
    updateProductDialog.value = true;
    console.log(product.value.tags);
    await store.getBeritaById(product.value._id);
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
};

const confirmViewProduct = async (viewProduct) => {
    console.log(viewProduct._id);
    loading.value = await true;
    loading.value = await false;
    product.value = viewProduct;
    viewProductDialog.value = true;
    await store.getBeritaById(viewProduct._id);
};

const deleteProduct = () => {
    products.value = products.value.filter((val) => val.id !== product.value.id);
    deleteProductDialog.value = false;
    product.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Deleted', life: 3000 });
};

const findIndexById = (id) => {
    let index = -1;
    for (let i = 0; i < products.value.length; i++) {
        if (products.value[i].id === id) {
            index = i;
            break;
        }
    }
    return index;
};

const createId = () => {
    let id = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
};

const exportCSV = () => {
    dt.value.exportCSV();
};

const confirmDeleteSelected = () => {
    deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
    products.value = products.value.filter((val) => !selectedProducts.value.includes(val));
    deleteProductsDialog.value = false;
    selectedProducts.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Products Deleted', life: 3000 });
};

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    };
};
</script>

<template>
    <div class="grid">
        <div class="col-12">
            <div class="card">
                <Toast />
                <Toolbar class="mb-4">
                    <template v-slot:start>
                        <div class="my-2">
                            <h1>MANAGE Slider</h1>
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="mr-2 p-button-success" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected"
                                :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>
                </Toolbar>

                <Skeleton width="100%" height="150px" v-if="loadingData"></Skeleton>

                <DataTable v-else-if="store.berita && store.berita.length > 0 && !loadingData"
                    class="p-datatable-gridlines p-datatable-lg" ref="dt" :value="store.berita" :paginator="true" :rows="10"
                    :rowsPerPageOptions="[5, 10, 25, 50]" :globalFilterFields="['name', 'description', 'category']"
                    :filters="filters" :selection="selectedProducts" @selectionChange="selectedProducts = $event.value"
                    :rowHover="true" v-model:selection="selectedProducts"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll">
                    <Column selectionMode="multiple" style="width: 3rem" />
                    <Column :field="noColumn" header="No" sortable />
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="slotProps.data.url" :alt="slotProps.data.image" class="shadow-2" width="300" />
                        </template>
                    </Column>
                    <Column field="judul" header="Judul" sortable />
                    <Column field="kategori.namaKategori" header="Category" sortable />
                    <Column class="text-center" field="tags" header="Tags" :showFilterMenu="false"
                        :filterMenuStyle="{ width: '14rem' }" style="min-width: 12rem">
                        <template class="flex gap-2 w-100" #body="{ data }">
                            <div class="flex gap-3 justify-content-center">
                                <Tag class="fs-6" v-for="tags in data.tags" :value="tags.namaTag" />
                            </div>
                        </template>
                    </Column>
                    <Column header="Action" headerStyle="min-width:1rem;">
                        <template #body="slotProps">
                            <Button label="View" severity="info" icon="pi pi-eye" class="mb-2 p-button-rounded"
                                @click="confirmViewProduct(slotProps.data)" />
                            <Button label="Edit" icon="pi pi-pencil" class="mr-2 p-button-rounded p-button-success"
                                @click="editProduct(slotProps.data, slotProps.data.id)" />
                            <Button severity="danger" label="Delete" icon="pi pi-trash"
                                class="mt-2 p-button-rounded p-button-warning"
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <div class="text-center card" v-else>
                    <h1>{{ store.message }}</h1>
                </div>

                <Dialog :closable="false" v-model:visible="productDialog" :style="{ width: '450px' }" header="Add Article"
                    :modal="true" class="p-fluid">
                    <img :src="product.url" :alt="product.image" v-if="product.image" width="150"
                        class="block mx-auto mt-0 mb-5 shadow-2" />
                    <div class="flex w-full mx-auto field flex-column align-items-center justify-content-center">
                        <!-- image dinamis src -->
                        <div class="wrapp">
                            <img :src="imageBase" v-if="imageBase" width="250" class="block mx-auto mt-0 mb-5 shadow-2" />
                        </div>
                        <input id="file-input" class="hide-file-input" type="file" accept="image/*"
                            @change="onFileChange($event)" />
                        <label class="file-label" for="file-input"> Upload Image </label>
                    </div>
                    <div class="field">
                        <label for="description">Title</label>
                        <InputText type="text" v-model="product.judul" />
                    </div>
                    <div class="field">
                        <label for="description">Description</label>
                        <Editor v-model="product.konten" editorStyle="height: 320px" />
                    </div>

                    <div class="field">
                        <label for="inventoryStatus" class="mb-3">Category </label>
                        <!-- dropdown-->
                        <Dropdown v-model="product.kategori" :options="kategoris" optionLabel="namaKategori"
                            placeholder="Select a Category" />
                    </div>

                    <div class="field">
                        <label class="mb-3">Tags</label>
                        <div class="flex">
                            <div class="flex flex-wrap gap-4">
                                <!-- <MultiSelect v-model="product.tags" filter display="chip" :options="tags" optionLabel="namaTag" placeholder="Select Tag" :maxSelectedLabels="5" class="w-full md:w-25rem" /> -->
                                <div v-for="tag of tags" :key="tag._id" class="flex align-items-center">
                                    <Checkbox v-model="selectedCategories" :inputId="tag._id" name="Tags"
                                        :value="tag._id" />
                                    <label class="ml-1" :for="tag._id">{{ tag.namaTag }}</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Add New Article"
                            v-if="imageBase && product.judul && product.konten && product.kategori && selectedCategories"
                            :loading="loading" icon="pi pi-check" class="p-button-text"
                            @click="addBerita(product.judul, product.konten, product.kategori._id)" />
                        <Button label="Save" v-else disabled :loading="loading" icon="pi pi-check" class="p-button-text" />
                        <!-- <Button label="Save" v-else disabled :loading="loading" icon="pi pi-check" class="p-button-text" @click="addBerita(product.judul, product.konten, product.kategori, product.tags)" /> -->
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="updateProductDialog" :style="{ width: '450px' }"
                    header="Image Details" modal class="p-fluid">
                    <!-- <img :src="product.url" :alt="product.image" width="250" class="block mx-auto mt-0 mb-5 shadow-2" /> -->
                    <div v-if="imageBase" class="showImageUpdate">
                        <!-- <h5 class="fw-bolder">Update to this :</h5> -->
                        <img :src="imageBase" :alt="imageContentType" width="250"
                            class="block mx-auto mt-0 mb-5 shadow-2" />
                    </div>

                    <div class="flex w-full field justify-content-center align-items-center">
                        <!-- image dinamis src -->

                        <input id="file-input" class="hide-file-input" type="file" accept="image/*"
                            @change="onFileChange($event)" />
                        <label class="file-label" for="file-input"> Upload a new image </label>
                    </div>
                    <div class="field">
                        <label for="description">Title</label>
                        <InputText type="text" v-model="product.judul" />
                    </div>
                    <div class="field">
                        <label for="description">Description</label>
                        <Editor v-model="product.konten" editorStyle="height: 320px" />
                    </div>

                    <div class="field">
                        <label for="inventoryStatus" class="mb-3">Category </label>
                        <Dropdown v-model="categoryUpdated" :options="store.kategori" optionLabel="namaKategori"
                            optionValue="namaKategori" />
                        <!-- <Dropdown v-model="selectedCountry" editable :options="countries" optionLabel="name"
                            placeholder="Select a City" class="w-full md:w-14rem" /> -->
                    </div>

                    <div class="field">
                        <label class="mb-3">Tags </label>
                        <div class="flex">
                            <div class="flex flex-wrap gap-4">
                                <!-- <MultiSelect v-model="product.tags.namaTag" :options="tags" optionLabel="namaTag" placeholder="Select Countries" display="chip" class="w-full md:w-25rem">
                                    <template #option="slotProps">
                                        <div class="flex align-items-center">
                                            <div>{{ slotProps.option.namaTag }}</div>
                                        </div>
                                    </template>
                                    <template #footer>
                                        <div class="px-3 py-2">
                                            <b>{{ selectedCountries ? selectedCountries.length : 0 }}</b> item{{ (selectedCountries ? selectedCountries.length : 0) > 1 ? 's' : '' }} selected.
                                        </div>
                                    </template>
                                </MultiSelect> -->
                                <div v-for="tag of tags" :key="tag._id" class="flex align-items-center">
                                    <Checkbox v-model="tagsUpdated" :inputId="tag._id" name="Tags" :value="tag.namaTag" />
                                    <label class="ml-1" :for="tag._id">{{ tag.namaTag }}</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-if="imageBase" label="Update" :loading="loading" icon="pi pi-check" class="p-button-text"
                            @click="updateArticle(product._id, product.judul, product.konten, product.kategori._id)" />
                        <Button v-else disabled label="Update" :loading="loading" icon="pi pi-check"
                            class="p-button-text" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="viewProductDialog" :style="{ width: '650px' }" header="Article Details" modal
                    class="p-fluid">
                    <img :src="product.url" :alt="product.image" width="250" class="block mx-auto mt-0 mb-5 shadow-2" />
                    <!-- <div class="mb-2 text-xl font-medium text-900">Title Placeholder</div> -->
                    <div>
                        <p class="m-0">Judul :</p>
                        <h1 class="m-0" v-html="product.judul"></h1>
                    </div>

                    <div class="mt-5 wrapper-konten">
                        <p class="m-0">Konten :</p>
                        <div v-html="product.konten"></div>
                    </div>

                    <div class="mt-5 wrapper-kategori">
                        <p class="m-0">Kategori :</p>
                        <Chip class="mt-2" :label="product.kategori.namaKategori" />
                    </div>

                    <div class="mt-5 wrapper-tags">
                        <p class="m-0">Tags :</p>
                        <Chip class="mt-2 mr-3" v-for="tag in store.tagsById" :key="tags._id" :label="tag.namaTag" />
                    </div>

                    <template #footer>
                        <Button label="Close" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="mr-3 pi pi-exclamation-triangle" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete <b>{{ product.judul }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button :loading="loading" label="Yes" icon="pi pi-check" class="p-button-text"
                            @click="deleteBerita(product._id, product.judul)" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductsDialog" :style="{ width: '450px' }"
                    header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="mr-3 pi pi-exclamation-triangle" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected images?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Yes" :loading="loading" icon="pi pi-check" class="p-button-text"
                            @click="deleteBeritaMany" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="css">
.hide-file-input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

.file-label {
    color: #fff;
    background-color: #3730a3;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
}

input[type='file']:focus+.file-label {
    box-shadow: 0 0 0 4px #bae6fd;
}

/* Untuk mengatur tampilan kotak centang */
.form-check-input {
    border: 2px solid #ced4da !important;
    background: #ffffff !important;
    width: 22px !important;
    height: 22px !important;
    color: #495057 !important;
    border-radius: 6px !important;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s !important;
}

/* Untuk memberikan gaya pada kotak centang yang dicentang */
.form-check-input:checked {
    background-color: #3498db;
    /* Warna latar belakang saat kotak centang dicentang */
    border-color: #3498db;
    /* Warna border saat kotak centang dicentang */
}

/* Untuk mengatur tampilan label */
label {
    font-weight: bold;
    /* Membuat label tebal */
    color: #333;
    /* Warna teks label */
}
</style>
