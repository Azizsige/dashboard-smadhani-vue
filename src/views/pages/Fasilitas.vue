<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import ProductService from '@/service/ProductService';
import { useToast } from 'primevue/usetoast';
import FileUpload from 'primevue/fileupload';
const toast = useToast();

import { facilityStore } from './../../stores/facilityStore';
const store = facilityStore();

const products = ref(null);
const imageBase = ref('');
const imageGallery = ref(null);
const imageContentType = ref(null);
const productDialog = ref(false);
const deleteProductDialog = ref(false);
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
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

const productService = new ProductService();

// Get Gallery
const getFacility = async () => {
    await store.getFacility();
    loadingData.value = false;
    message.value = await store.message;
    console.log(message.value);
};

// Add Gallery
const addFacility = async (name) => {
    loading.value = await true;
    console.log(name);
    try {
        await store.addFacility(imageGallery.value, name);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${name} has been added!`, life: 3000 });
        await getFacility();
        productDialog.value = await false;
        imageBase.value = await '';
        imageGallery.value = await '';
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `Image has been exist`, life: 3000 });
    }
    loading.value = await false;
};

// Delete Tag
const deleteFacility = async (Id, name) => {
    loading.value = true;
    try {
        await store.deleteFacility(Id);
        await getFacility();
        deleteProductDialog.value = await false;
        imageBase.value = '';
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${name} has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `Image has been exist`, life: 3000 });
    }

    loading.value = await false;
};

// Delete Many Tag
const deleteFacilityMany = async () => {
    loading.value = await true;
    loadingData.value = await true;
    try {
        const selectedTag = selectedProducts.value;
        console.log(selectedTag.value);
        selectedTag.forEach(async (gallery) => {
            await store.deleteFacility(gallery._id);
        });
        await getFacility();
        deleteProductsDialog.value = await false;
        imageBase.value = '';
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Selected Gallery has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.message, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
    // get selected tag
};

// Update Tag
const updateFacility = async (id, name) => {
    loading.value = await true;

    try {
        loadingData.value = await true;
        await store.updateFacility(id, imageGallery.value, name);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${name} has been updated!`, life: 3000 });
        await getFacility();
        updateProductDialog.value = await false;
        imageBase.value = await '';
        imageGallery.value = await '';
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error || `${name} has been exist`, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
    imageBase.value = '';
};

// noColumn
const noColumn = (rowData, column) => {
    const rowIndex = store.fasilitas.indexOf(rowData);
    return rowIndex + 1;
};

// Upload File
const onFileChange = (e) => {
    imageGallery.value = e.target.files[0];
    const files = e.target.files[0];
    const reader = new FileReader(files);
    reader.onload = () => {
        imageBase.value = reader.result;
    };
    reader.readAsDataURL(files);
    // if (files.length > 0) {
    //     const file = files[0];
    //     const reader = new FileReader(file);
    //     reader.onload = () => {
    //         file.value = reader.result;
    //         imageBase.value = file.value;
    //     };
    //     reader.readAsDataURL(file);
    // }
};
onBeforeMount(() => {
    initFilters();
});
onMounted(async () => {
    await getFacility();
    console.log(message.value);
});
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
    console.log(imageGallery.value, imageBase.value);
};

const hideDialog = async () => {
    // productDialog.value = false;
    // submitted.value = false;
    updateProductDialog.value = await false;
    productDialog.value = await false;
    deleteProductDialog.value = await false;
    deleteProductsDialog.value = await false;
    imageBase.value = '';
};

const saveProduct = () => {
    submitted.value = true;
    if (product.value.name && product.value.name.trim() && product.value.price) {
        if (product.value.id) {
            product.value.inventoryStatus = product.value.inventoryStatus.value ? product.value.inventoryStatus.value : product.value.inventoryStatus;
            products.value[findIndexById(product.value.id)] = product.value;
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Updated', life: 3000 });
        } else {
            product.value.id = createId();
            product.value.code = createId();
            product.value.image = 'product-placeholder.svg';
            product.value.inventoryStatus = product.value.inventoryStatus ? product.value.inventoryStatus.value : 'INSTOCK';
            products.value.push(product.value);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Product Created', life: 3000 });
        }
        productDialog.value = false;
        product.value = {};
    }
};

const editProduct = (editProduct) => {
    product.value = { ...editProduct };
    console.log(product);
    updateProductDialog.value = true;
    console.log(product.value.url);
};

const confirmDeleteProduct = (editProduct) => {
    product.value = editProduct;
    deleteProductDialog.value = true;
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
                            <h1>FACILITY MANAGES</h1>
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-2">
                            <Button label="New" icon="pi pi-plus" class="p-button-success mr-2" @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>
                </Toolbar>

                <Skeleton width="100%" height="150px" v-if="loadingData"></Skeleton>

                <DataTable
                    v-else-if="store.fasilitas && store.fasilitas.length > 0 && !loadingData"
                    class="p-datatable-gridlines p-datatable-lg"
                    ref="dt"
                    :value="store.fasilitas"
                    :paginator="true"
                    :rows="10"
                    :rowsPerPageOptions="[5, 10, 25, 50]"
                    :globalFilterFields="['name', 'description', 'category']"
                    :filters="filters"
                    :selection="selectedProducts"
                    @selectionChange="selectedProducts = $event.value"
                    :rowHover="true"
                    v-model:selection="selectedProducts"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll"
                >
                    <Column selectionMode="multiple" style="width: 3rem" />
                    <Column :field="noColumn" header="No" sortable />
                    <Column field="namaFasilitas" header="Facility Name" sortable />
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="slotProps.data.url" :alt="slotProps.data.image" class="shadow-2" width="300" />
                        </template>
                    </Column>
                    <Column header="Action" headerStyle="min-width:1rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <div class="card text-center" v-else>
                    <h1>{{ store.message }}</h1>
                </div>

                <Dialog :closable="false" v-model:visible="productDialog" :style="{ width: '450px' }" header="Image Details" :modal="true" class="p-fluid">
                    <img :src="product.url" :alt="product.image" v-if="product.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field mx-auto w-full flex flex-column align-items-center justify-content-center">
                        <!-- image dinamis src -->
                        <div class="wrapp">
                            <img :src="imageBase" v-if="imageBase" width="250" class="mt-0 mx-auto mb-5 block shadow-2" />
                        </div>
                        <input id="file-input" class="hide-file-input" type="file" accept="image/*" @change="onFileChange($event)" />
                        <label class="file-label" for="file-input"> Upload a file </label>
                    </div>
                    <div class="field">
                        <label for="name">Facility Name</label>
                        <InputText id="name" v-model.trim="product.namaFasilitas" required="true" autofocus :class="{ 'p-invalid': submitted && !product.namaFasilitas }" />
                        <small class="p-invalid" v-if="submitted && !product.namaFasilitas">Facility Name is required.</small>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" v-if="imageBase && product.namaFasilitas" :loading="loading" icon="pi pi-check" class="p-button-text" @click="addFacility(product.namaFasilitas)" />
                        <Button label="Save" v-else disabled :loading="loading" icon="pi pi-check" class="p-button-text" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="updateProductDialog" :style="{ width: '450px' }" header="Image Details" modal class="p-fluid">
                    <img :src="product.url" :alt="product.image" v-if="product.image" width="250" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div v-if="imageBase" class="showImageUpdate">
                        <h5 class="fw-bolder">Update to this :</h5>
                        <img :src="imageBase" :alt="imageContentType" width="250" class="mt-0 mx-auto mb-5 block shadow-2" />
                    </div>

                    <div class="field w-full flex justify-content-center align-items-center">
                        <!-- image dinamis src -->

                        <input id="file-input" class="hide-file-input" type="file" accept="image/*" @change="onFileChange($event)" />
                        <label class="file-label" for="file-input"> Upload a file </label>
                    </div>
                    <div class="field">
                        <label for="name">Facility Name</label>
                        <InputText id="name" v-model.trim="product.namaFasilitas" required="true" autofocus :class="{ 'p-invalid': submitted && !product.name }" />
                        <small class="p-invalid" v-if="submitted && !product.name">Facility Name is required.</small>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-if="imageBase && product.namaFasilitas" label="Update" :loading="loading" icon="pi pi-check" class="p-button-text" @click="updateFacility(product._id, product.namaFasilitas)" />
                        <Button v-else disabled label="Update" :loading="loading" icon="pi pi-check" class="p-button-text" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.namaFasilitas }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button :loading="loading" label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteFacility(product._id, product.namaFasilitas)" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected images?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Yes" :loading="loading" icon="pi pi-check" class="p-button-text" @click="deleteFacilityMany" />
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
input[type='file']:focus + .file-label {
    box-shadow: 0 0 0 4px #bae6fd;
}
</style>
