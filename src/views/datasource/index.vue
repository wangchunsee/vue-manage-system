<template>
    <div>
        <div class="container">
            <div class="search-container">
                <el-form :inline="true" :model="query" class="demo-form-inline">
                    <el-form-item label="数据源名称">
                        <el-input v-model="query.nameLike" placeholder="请输入数据源名称"></el-input>
                    </el-form-item>
                    <el-form-item label="数据源URL">
                        <el-input v-model="query.url" placeholder="请输入数据源URL"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="handleSearch">搜索</el-button>
                        <el-button type="warning" @click="handleAdd">新建</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <TableCustom 
                :columns="columns" 
                :tableData="tableData" 
                :total="page.total" 
                :currentPage="page.current"
                :pageSize="page.size"
                :delFunc="handleDelete" 
                :editFunc="handleEdit" 
                :refresh="fetchDatasources" 
                :changePage="changePage">
            </TableCustom>
        </div>

        <el-dialog 
            :title="isEdit ? '编辑数据源' : '新建数据源'" 
            v-model="visible" 
            width="700px" 
            destroy-on-close
            :close-on-click-modal="false" 
            @close="closeDialog">
            <el-form 
                ref="formRef" 
                :model="formData" 
                :rules="rules" 
                label-width="120px">
                <el-form-item label="数据源名称" prop="name">
                    <el-input v-model="formData.name" placeholder="请输入数据源名称"></el-input>
                </el-form-item>
                <el-form-item label="数据源类型" prop="type">
                    <el-select v-model="formData.type" placeholder="请选择数据源类型">
                        <el-option label="MySQL" value="mysql"></el-option>
                        <el-option label="PostgreSQL" value="postgresql"></el-option>
                        <el-option label="Oracle" value="oracle"></el-option>
                        <el-option label="SQL Server" value="sqlserver"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="URL" prop="url">
                    <el-input v-model="formData.url" placeholder="请输入数据源URL"></el-input>
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="formData.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="formData.password" type="password" placeholder="请输入密码"></el-input>
                </el-form-item>
                <el-form-item label="驱动类名" prop="driverClassName">
                    <el-input v-model="formData.driverClassName" placeholder="请输入驱动类名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button @click="closeDialog">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                    <el-button type="warning" @click="testConnection">测试</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="datasource">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import TableCustom from '@/components/table-custom.vue';
import { searchDatasources, createDatasource, updateDatasource, deleteDatasource, testDatasource } from '@/api/datasource';

// 查询相关
const query = reactive({
    nameLike: '',
    type: '',
    url: ''
});

// 表格相关
const columns = ref([
    { type: 'index', label: '序号', width: 55, align: 'center' },
    { prop: 'name', label: '数据源名称' },
    { prop: 'type', label: '数据源类型' },
    { prop: 'url', label: '数据源URL' },
    { prop: 'username', label: '用户名' },
    { prop: 'createTime', label: '创建时间' },
    { prop: 'operator', label: '操作', width: 200 }
]);

const page = reactive({
    current: 1,
    size: 20,
    total: 0,
    orders: [
        {
            column: 'id',
            asc: true
        }
    ]
});

const tableData = ref([]);

// 获取数据源列表
const fetchDatasources = async () => {
    try {
        const res = await searchDatasources({
            page: page,
            query: query
        });
        
        if (res.data && res.data.data) {
            tableData.value = res.data.data.records || [];
            page.total = res.data.data.total || 0;
        }
    } catch (error) {
        console.error('获取数据源列表失败', error);
        ElMessage.error('获取数据源列表失败');
    }
};

// 搜索
const handleSearch = () => {
    page.current = 1;
    fetchDatasources();
};

// 分页
const changePage = (val: number) => {
    page.current = val;
    fetchDatasources();
};

// 表单相关
const formRef = ref<FormInstance>();
const visible = ref(false);
const isEdit = ref(false);
const formData = reactive({
    id: null,
    name: '',
    type: 'mysql',
    url: '',
    username: '',
    password: '',
    driverClassName: ''
});

const rules = {
    name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
    url: [{ required: true, message: '请输入数据源URL', trigger: 'blur' }],
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
    driverClassName: [{ required: true, message: '请输入驱动类名', trigger: 'blur' }]
};

// 新增
const handleAdd = () => {
    resetForm();
    isEdit.value = false;
    visible.value = true;
};

// 编辑
const handleEdit = (row: any) => {
    resetForm();
    Object.assign(formData, row);
    isEdit.value = true;
    visible.value = true;
};

// 删除
const handleDelete = async (row: any) => {
    try {
        await deleteDatasource(row.id);
        ElMessage.success('删除成功');
        fetchDatasources();
    } catch (error) {
        console.error('删除失败', error);
        ElMessage.error('删除失败');
    }
};

// 提交表单
const submitForm = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                if (isEdit.value) {
                    await updateDatasource(formData);
                    ElMessage.success('更新成功');
                } else {
                    await createDatasource(formData);
                    ElMessage.success('创建成功');
                }
                closeDialog();
                fetchDatasources();
            } catch (error) {
                console.error('保存失败', error);
                ElMessage.error('保存失败');
            }
        }
    });
};

// 测试连接
const testConnection = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                await testDatasource(formData);
                ElMessage.success('连接测试成功');
            } catch (error) {
                console.error('连接测试失败', error);
                ElMessage.error('连接测试失败');
            }
        }
    });
};

// 重置表单
const resetForm = () => {
    formData.id = null;
    formData.name = '';
    formData.type = 'mysql';
    formData.url = '';
    formData.username = '';
    formData.password = '';
    formData.driverClassName = '';
};

// 关闭弹窗
const closeDialog = () => {
    visible.value = false;
};

onMounted(() => {
    fetchDatasources();
});
</script>

<style scoped>
.search-container {
    margin-bottom: 20px;
}
</style>
