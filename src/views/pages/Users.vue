<script setup>
import { FilterMatchMode } from 'primevue/api';
import { ref, onMounted, onBeforeMount } from 'vue';
import ProductService from '@/service/ProductService';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

import { userStore } from './../../stores/userStore';
const store = userStore();

const products = ref(null);
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

// Get Tags
const getUser = async () => {
    await store.getUsers();
    loadingData.value = false;
    message.value = await store.message;
    console.log(message.value);
};

// Add Tags
const addUser = async (username, password) => {
    loading.value = true;
    try {
        if (username == undefined || password == undefined) {
            await toast.add({ severity: 'error', summary: 'Error Message', detail: 'Username or Password is required!', life: 3000 });
        } else {
            await store.addUser(username, password);
            await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${username} has been added!`, life: 3000 });
            await getUser();
            productDialog.value = false;
        }
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `${username} has been exist`, life: 3000 });
    }
    loading.value = false;

    console.log(username, password);
};

// Delete Tag
const deleteUser = async (data, name) => {
    loading.value = true;
    await store.deleteUser(data);
    await getUser();
    deleteProductDialog.value = false;
    await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${name} has been deleted!`, life: 3000 });
    loading.value = false;
};

// Delete Many Tag
const deleteUserMany = async () => {
    loading.value = true;
    loadingData.value = true;
    try {
        const selectedTag = selectedProducts.value;
        selectedTag.forEach(async (tag) => {
            await store.deleteUser(tag._id);
            await getUser();
        });

        deleteProductsDialog.value = false;
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `Selected Tag has been deleted!`, life: 3000 });
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.message, life: 3000 });
    }
    loading.value = false;
    loadingData.value = false;
    // get selected tag
};

// Update Tag
const updateUser = async (id, username, password) => {
    loading.value = true;
    try {
        await store.updateUser(id, username, password);
        await toast.add({ severity: 'success', summary: 'Congratulations!', detail: `${username} has been updated!`, life: 3000 });
        await getUser();
        updateProductDialog.value = false;
    } catch (error) {
        await toast.add({ severity: 'error', summary: 'Error Message', detail: error.response.data.message || `${username} has been exist`, life: 3000 });
    }
    loading.value = false;
};

// noColumn
const noColumn = (rowData, column) => {
    const rowIndex = store.users.indexOf(rowData);
    return rowIndex + 1;
};

onBeforeMount(() => {
    initFilters();
});
onMounted(async () => {
    await getUser();
    console.log(message.value);
    console.log(product.value);
});
const formatCurrency = (value) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const openNew = () => {
    product.value = {};
    submitted.value = false;
    productDialog.value = true;
};

const hideDialog = () => {
    productDialog.value = false;
    updateProductDialog.value = false;
    deleteProductDialog.value = false;
    submitted.value = false;
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
                            <h1>MANAGE TAGS</h1>
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
                    v-else-if="store.users && store.users.length > 0 && !loadingData"
                    class="p-datatable-gridlines p-datatable-lg"
                    ref="dt"
                    :value="store.users"
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
                    <template #header>
                        <div class="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
                            <h5 class="m-0">Manage Users</h5>
                            <span class="block mt-2 md:mt-0 p-input-icon-left">
                                <i class="pi pi-search" />
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </span>
                        </div>
                    </template>
                    <Column selectionMode="multiple" style="width: 3rem" />
                    <Column :field="noColumn" header="No" sortable />
                    <Column field="username" header="Username" sortable />
                    <Column field="createdAt" header="Create At" sortable />
                    <Column field="updatedAt" header="Update At" sortable />
                    <Column field="lastLogin" header="Last Login" sortable />
                    <Column field="lastLogout" header="Last Logout" sortable />
                    <Column header="Action" headerStyle="min-width:10rem;">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2" @click="editProduct(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-warning mt-2" @click="confirmDeleteProduct(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <div class="card text-center" v-else>
                    <h1>{{ store.message }}</h1>
                </div>

                <Dialog :closable="false" v-model:visible="productDialog" :style="{ width: '450px' }" header="Product Details" :modal="true" class="p-fluid">
                    <img :src="'demo/images/product/' + product.image" :alt="product.image" v-if="product.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field">
                        <span class="p-float-label">
                            <InputText id="username" v-model="product.username" />
                            <label for="username">Username</label>
                        </span>
                    </div>
                    <div class="field mt-5">
                        <span class="p-float-label">
                            <Password v-model="product.password" inputId="password" toggleMask>
                                <template #header>
                                    <h6>Pick a password</h6>
                                </template>
                                <template #footer>
                                    <Divider />
                                    <p class="mt-2">Suggestions</p>
                                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                                        <li>Minimum 6 characters</li>
                                    </ul>
                                </template>
                            </Password>
                            <label for="password">Password</label>
                        </span>
                    </div>
                    <template #footer>
                        <Button v-if="loading" disabled label="Cancel" icon="pi pi-times" class="p-button-text" />
                        <Button v-else label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-if="product.username && product.password" label="Add New User" :loading="loading" icon="pi pi-check" class="p-button-text" @click="addUser(product.username, product.password)" />
                        <Button v-else label="Add New User" icon="pi pi-check" class="p-button-text" disabled />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="updateProductDialog" :style="{ width: '450px' }" header="Product Details" :modal="true" class="p-fluid">
                    <img :src="'demo/images/product/' + product.image" :alt="product.image" v-if="product.image" width="150" class="mt-0 mx-auto mb-5 block shadow-2" />
                    <div class="field">
                        <span class="p-float-label">
                            <InputText id="username" v-model.trim="product.username" />
                            <label for="username">Username</label>
                        </span>
                    </div>
                    <div class="field mt-5">
                        <span class="p-float-label">
                            <Password v-model.trim="product.password" inputId="password" toggleMask>
                                <template #header>
                                    <h6>Pick a password</h6>
                                </template>
                                <template #footer>
                                    <Divider />
                                    <p class="mt-2">Suggestions</p>
                                    <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
                                        <li>Minimum 6 characters</li>
                                    </ul>
                                </template>
                            </Password>
                            <label for="password">Password</label>
                        </span>
                    </div>
                    <template #footer>
                        <Button v-if="loading" disabled label="Cancel" icon="pi pi-times" class="p-button-text" />
                        <Button v-else label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog" />
                        <Button v-if="product.username && product.password" label="Update" :loading="loading" icon="pi pi-check" class="p-button-text" @click="updateUser(product._id, product.username, product.password)" />
                        <Button v-else label="Update" icon="pi pi-check" class="p-button-text" disabled />
                    </template>
                </Dialog>

                <Dialog :closable="false" v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product"
                            >Are you sure you want to delete <b>{{ product.namaTag }}</b
                            >?</span
                        >
                    </div>
                    <template #footer>
                        <Button v-if="loading" disabled label="Cancel" icon="pi pi-times" class="p-button-text" />
                        <Button v-else label="Cancel" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog" />
                        <Button :loading="loading" label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteUser(product._id, product.username)" />
                    </template>
                </Dialog>

                <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
                    <div class="flex align-items-center justify-content-center">
                        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
                        <span v-if="product">Are you sure you want to delete the selected products?</span>
                    </div>
                    <template #footer>
                        <Button label="No" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false" />
                        <Button label="Yes" :loading="loading" icon="pi pi-check" class="p-button-text" @click="deleteUserMany" />
                    </template>
                </Dialog>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
