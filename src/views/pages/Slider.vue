<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import ProductService from '@/service/ProductService';
import { useToast } from 'primevue/usetoast';
import FileUpload from 'primevue/fileupload';
const toast = useToast();

import { sliderStore } from './../../stores/sliderStore';
const store = sliderStore();

const products = ref(null);
const imageBase = ref('');
const imageSlider = ref(null);
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

// Get Slider
const getSlider = async () => {
    await store.getSlider();
    loadingData.value = false;
    message.value = await store.message;
    console.log(message.value);
};

// Add Slider
const addSlider = async (name) => {
    loading.value = await true;
    console.log(name);
    try {
        await store.addSlider(imageSlider.value);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Slider Image has been added!`, life: 3000 });
        await getSlider();
        productDialog.value = await false;
        imageBase.value = await '';
        imageSlider.value = await '';
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `Image has been exist`, life: 3000 });
    }
    loading.value = await false;
};

// Delete Tag
const deleteSlider = async (Id, name) => {
    loading.value = true;
    try {
        await store.deleteSlider(Id);
        await getSlider();
        deleteProductDialog.value = await false;
        imageBase.value = '';
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${name} has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `Image has been exist`, life: 3000 });
    }

    loading.value = await false;
};

// Delete Many Tag
const deleteSliderMany = async () => {
    loading.value = await true;
    loadingData.value = await true;
    try {
        const selectedTag = selectedProducts.value;
        console.log(selectedTag.value);
        selectedTag.forEach(async (Slider) => {
            await store.deleteSlider(Slider._id);
        });
        await getSlider();
        deleteProductsDialog.value = await false;
        imageBase.value = '';
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Selected Slider has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.message, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
    // get selected tag
};

// Update Tag
const updateSlider = async (id, name) => {
    loading.value = await true;

    try {
        loadingData.value = await true;
        await store.updateSlider(id, imageSlider.value);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${name} has been updated!`, life: 3000 });
        await getSlider();
        updateProductDialog.value = await false;
        imageBase.value = await '';
        imageSlider.value = await '';
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `${name} has been exist`, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
    imageBase.value = '';
};

// noColumn
const noColumn = (rowData, column) => {
    const rowIndex = store.slider.indexOf(rowData);
    return rowIndex + 1;
};

// Upload File
const onFileChange = (e) => {
    imageSlider.value = e.target.files[0];
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
    await getSlider();
    console.log(message.value);
});
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
    console.log(imageSlider.value, imageBase.value);
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
                            <h1>MANAGE Slider</h1>
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
                    v-else-if="store.slider && store.slider.length > 0 && !loadingData"
                    class="p-datatable-gridlines p-datatable-lg"
                    ref="dt"
                    :value="store.slider"
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
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" v-if="imageBase" :loading="loading" icon="pi pi-check" class="p-button-text" @click="addSlider" />
                        <Button label="Save" v-else disabled :loading="loading" icon="pi pi-check" class="p-button-text" @click="addSlider(product.image)" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="updateProductDialog" :style="{ width: '450px' }" header="Image Details" modal class="p-fluid">
                    <img :src="product.url" :alt="product.image" v-if="product.image" width="250" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div v-if="imageBase" class="showImageUpdate">
                        <p>Update to this :</p>
                        <img :src="imageBase" :alt="imageContentType" width="250" class="mt-0 mx-auto mb-5 block shadow-2" />
                    </div>

                    <div class="field w-full flex justify-content-center align-items-center">
                        <!-- image dinamis src -->

                        <input id="file-input" class="hide-file-input" type="file" accept="image/*" @change="onFileChange($event)" />
                        <label class="file-label" for="file-input"> Upload a file </label>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-if="imageBase" label="Update" :loading="loading" icon="pi pi-check" class="p-button-text" @click="updateSlider(product._id, product.image)" />
                        <Button v-else disabled label="Update" :loading="loading" icon="pi pi-check" class="p-button-text" @click="updateSlider(product._id, product.image)" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.image }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button :loading="loading" label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteSlider(product._id, product.image)" />
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
                        <Button label="Yes" :loading="loading" icon="pi pi-check" class="p-button-text" @click="deleteSliderMany" />
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
