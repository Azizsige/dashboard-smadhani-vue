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
        for (const file of store.imageSet) {
            await store.addSlider(file);
        }
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Slider Image has been added!`, life: 3000 });
        await getSlider();
        productDialog.value = await false;
        store.imageSet = []
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

const deleteSliderMany = async () => {
    loading.value = await true;
    loadingData.value = await true;
    try {
        const selectedTag = selectedProducts.value;
        console.log(selectedTag.value);
        selectedTag.forEach(async (slider) => {
            await store.deleteSlider(slider._id);
        });
        await getSlider();
        deleteProductsDialog.value = await false;
        selectedProducts.value = await null;
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Selected Image Slider has been deleted!`, life: 3000 });
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
        await store.updateSlider(id, store.imageSetUpdate[0]);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Image Slider has been updated!`, life: 3000 });
        await getSlider();
        updateProductDialog.value = await false;
        store.imageSetUpdate = []
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `${name} has been exist`, life: 3000 });
    }
    loading.value = await false;
    loadingData.value = await false;
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

const editProduct = async (editProduct) => {
    product.value = { ...editProduct };
    updateProductDialog.value = true;
    await store.getSliderById(product.value._id);
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
                            <span class="block p-1 text-black-alpha-90 text-5xl">Slider</span>
                            <span class="block lb-desc p-1">View all image slider</span>
                        </div>
                    </template>
                    <template v-slot:end>
                        <div class="my-2">
                            <Button label="Add New Image Slider" icon="pi pi-plus" class="p-button-success mr-2"
                                @click="openNew" />
                            <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected"
                                :disabled="!selectedProducts || !selectedProducts.length" />
                        </div>
                    </template>
                </Toolbar>

                <Skeleton width="100%" height="150px" v-if="loadingData"></Skeleton>

                <DataTable v-else-if="store.slider && store.slider.length > 0 && !loadingData"
                    class="p-datatable-gridlines p-datatable-lg" ref="dt" :value="store.slider" :paginator="true" :rows="10"
                    :rowsPerPageOptions="[5, 10, 25, 50]" :globalFilterFields="['name', 'description', 'category']"
                    :filters="filters" :selection="selectedProducts" @selectionChange="selectedProducts = $event.value"
                    :rowHover="true" v-model:selection="selectedProducts"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
                    responsiveLayout="scroll">
                    <Column selectionMode="multiple" style="width: 3rem" />
                    <Column header="Image" headerStyle="width:14%; min-width:10rem;">
                        <template #body="slotProps">
                            <span class="p-column-title">Image</span>
                            <img :src="slotProps.data.url" :alt="slotProps.data.image" class="shadow-2" width="150" />
                        </template>
                    </Column>
                    <Column header="Action" headerStyle="min-width:1rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" label='Edit' class="p-button-rounded p-button-warning mr-2"
                                @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger mt-2" label="Delete"
                                @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <div class="card text-center" v-else>
                    <h1>{{ store.message }}</h1>
                </div>

                <Dialog :closable="false" v-model:visible="productDialog" :style="{ width: '450px' }" header="Add New Image"
                    :modal="true" class="p-fluid">
                    <Toast />
                    <FileUpload name="demo[]" url="#" :showCancelButton="false" :auto="true" :multiple="true"
                        :maxFileSize="1000000" ref="fileUpload" @progress="($event) => {
                            console.log('On progress : ', $event);

                            progress = $event.progress;
                        }
                            " @before-send="($event) => {
        console.log('Before send : ', $event);
    }" @select="($event) => {
    console.log('On select : ', $event.files);
    store.imageSet = $event.files
}" @removeUploadedFile="($event) => {
    console.log('On remove : ', $event);
    store.imageSet = $event.files;
}">
                        <template #header="">
                            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                            </div>
                        </template>
                        <template #empty>
                            <div class="flex flex-row flex-wrap align-items-center justify-content-center ">
                                <i class="pi pi-cloud-upload text-4xl text-400 border-400 flex " />
                                <p class="flex mx-2 m-0">Drag and drop files to here to upload or </p>
                                <Button @click="$refs.fileUpload.choose()" label="browse" class="underline p-1"
                                    link></Button>
                            </div>
                        </template>
                    </FileUpload>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Save" v-if="store.imageSet.length == 0" disabled :loading="loading"
                            icon="pi pi-check" class="p-button-text" @click="addSlider" />
                        <Button label="Save" v-else :loading="loading" icon="pi pi-check" class="p-button-text"
                            @click="addSlider" />
                    </template>
                </Dialog>

                <!-- Update Slider -->
                <Dialog v-if="store.loadingData" :closable="false" v-model:visible="updateProductDialog"
                    :style="{ width: '450px' }" header="Update New Image" modal class="p-fluid">
                    <Skeleton width="100%" height="150px"></Skeleton>
                </Dialog>
                <Dialog v-else :closable="false" v-model:visible="updateProductDialog" :style="{ width: '450px' }"
                    header="Update Image Slider" modal class="p-fluid">
                    <Toast />
                    <Message :closable="false">
                        <template #messageicon>
                            <Avatar :image="store.fileUrl" size="xlarge" />

                        </template>
                        <span class="ml-2">{{ store.fileName }}</span>
                    </Message>
                    <FileUpload name="demo[]" url="#" :auto="true" :multiple="false" :maxFileSize="1000000" ref="fileUpload"
                        @select="($event) => {
                            console.log('On select : ', $event.files);
                            store.imageSetUpdate = $event.files
                        }">
                        <template #header="">
                            <div class="flex flex-wrap justify-content-between align-items-center flex-1 gap-2">
                            </div>
                        </template>
                        <template #empty>
                            <div class="flex flex-row flex-wrap align-items-center justify-content-center ">
                                <i class="pi pi-cloud-upload text-4xl text-400 border-400 flex " />
                                <p class="flex mx-2 m-0">Drag and drop files to here to upload or </p>
                                <Button @click="$refs.fileUpload.choose()" label="browse" class="underline p-1"
                                    link></Button>
                            </div>
                        </template>
                    </FileUpload>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-if="store.imageSetUpdate.length == 0" disabled label="Update" :loading="loading"
                            icon="pi pi-check" class="p-button-text" @click="updateSlider(product._id)" />
                        <Button label="Update" v-else :loading="loading" icon="pi pi-check" class="p-button-text"
                            @click="updateSlider(product._id)" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm"
                    :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete <b>{{ product.image }}</b>?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button :loading="loading" label="Yes" icon="pi pi-check" class="p-button-text"
                            @click="deleteSlider(product._id, product.image)" />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductsDialog" :style="{ width: '450px' }"
                    header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected images?</span>
                    </div>
                    <template #footer>
                        <Button label="Cancel" v-if="loading" disabled icon="pi pi-times" class="p-button-text"
                            @click="hideDialog" />
                        <Button label="Cancel" v-else icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button label="Yes" :loading="loading" icon="pi pi-check" class="p-button-text"
                            @click="deleteSliderMany" />
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
</style>
