<template>
    <div class="container">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
            <!-- 1. 监控名称 -->
            <el-form-item label="监控名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入监控名称"></el-input>
            </el-form-item>

            <!-- 2. 告警组和告警项 -->
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="告警组" prop="alarmGroup">
                        <el-select 
                            v-model="formData.alarmGroup" 
                            placeholder="请选择告警组" 
                            filterable 
                            remote 
                            :remote-method="searchAlarmGroup"
                            :loading="loading.alarmGroup">
                            <el-option 
                                v-for="item in options.alarmGroup" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="告警项" prop="alarm">
                        <el-select 
                            v-model="formData.alarm" 
                            placeholder="请选择告警项" 
                            filterable 
                            remote 
                            :remote-method="searchAlarm"
                            :loading="loading.alarm">
                            <el-option 
                                v-for="item in options.alarm" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <!-- 3. 定时配置 -->
            <el-form-item label="定时配置" prop="cron">
                <el-input v-model="formData.cron" placeholder="Cron表达式">
                    <template #append>
                        <el-button @click="showCronDialog">配置</el-button>
                    </template>
                </el-input>
            </el-form-item>

            <!-- 4. 数据源 -->
            <el-form-item label="数据源" prop="datasource">
                <el-select 
                    v-model="formData.datasource" 
                    placeholder="请选择数据源" 
                    filterable 
                    remote 
                    :remote-method="searchDatasource"
                    :loading="loading.datasource">
                    <el-option 
                        v-for="item in options.datasource" 
                        :key="item.value" 
                        :label="item.label" 
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>

            <!-- 5. SQL编辑器 -->
            <el-form-item label="SQL查询" prop="sql">
                <div class="sql-editor-container">
                    <div class="monaco-editor-container" style="height: 200px; border: 1px solid #dcdfe6; border-radius: 4px;">
                        <!-- Monaco编辑器将在这里挂载 -->
                    </div>
                    <div class="sql-editor-actions">
                        <el-button type="primary" @click="executeSQL">执行查询</el-button>
                    </div>
                </div>
            </el-form-item>

            <!-- SQL查询结果表格 -->
            <el-form-item v-if="sqlResult.columns.length > 0">
                <div class="sql-result-container">
                    <el-table :data="sqlResult.records" border style="width: 100%">
                        <el-table-column 
                            v-for="(column, index) in sqlResult.columns" 
                            :key="index" 
                            :prop="column" 
                            :label="column">
                        </el-table-column>
                    </el-table>
                </div>
            </el-form-item>

            <!-- 6. 阈值配置 -->
            <el-form-item label="阈值配置">
                <div class="threshold-container">
                    <!-- 严重告警 -->
                    <div class="threshold-row">
                        <div class="threshold-label">严重告警:</div>
                        <el-select 
                            v-model="formData.thresholds.critical.column" 
                            placeholder="选择列名"
                            style="width: 200px; margin-right: 10px;">
                            <el-option 
                                v-for="column in sqlResult.columns" 
                                :key="column" 
                                :label="column" 
                                :value="column">
                            </el-option>
                        </el-select>
                        <el-select 
                            v-model="formData.thresholds.critical.operator" 
                            placeholder="选择运算符"
                            style="width: 120px; margin-right: 10px;">
                            <el-option 
                                v-for="item in options.operator" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input 
                            v-model="formData.thresholds.critical.value" 
                            placeholder="输入阈值"
                            style="width: 200px;">
                        </el-input>
                    </div>

                    <!-- 重要告警 -->
                    <div class="threshold-row">
                        <div class="threshold-label">重要告警:</div>
                        <el-select 
                            v-model="formData.thresholds.important.column" 
                            placeholder="选择列名"
                            style="width: 200px; margin-right: 10px;">
                            <el-option 
                                v-for="column in sqlResult.columns" 
                                :key="column" 
                                :label="column" 
                                :value="column">
                            </el-option>
                        </el-select>
                        <el-select 
                            v-model="formData.thresholds.important.operator" 
                            placeholder="选择运算符"
                            style="width: 120px; margin-right: 10px;">
                            <el-option 
                                v-for="item in options.operator" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input 
                            v-model="formData.thresholds.important.value" 
                            placeholder="输入阈值"
                            style="width: 200px;">
                        </el-input>
                    </div>

                    <!-- 普通告警 -->
                    <div class="threshold-row">
                        <div class="threshold-label">普通告警:</div>
                        <el-select 
                            v-model="formData.thresholds.normal.column" 
                            placeholder="选择列名"
                            style="width: 200px; margin-right: 10px;">
                            <el-option 
                                v-for="column in sqlResult.columns" 
                                :key="column" 
                                :label="column" 
                                :value="column">
                            </el-option>
                        </el-select>
                        <el-select 
                            v-model="formData.thresholds.normal.operator" 
                            placeholder="选择运算符"
                            style="width: 120px; margin-right: 10px;">
                            <el-option 
                                v-for="item in options.operator" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input 
                            v-model="formData.thresholds.normal.value" 
                            placeholder="输入阈值"
                            style="width: 200px;">
                        </el-input>
                    </div>

                    <!-- 低级提醒 -->
                    <div class="threshold-row">
                        <div class="threshold-label">低级提醒:</div>
                        <el-select 
                            v-model="formData.thresholds.low.column" 
                            placeholder="选择列名"
                            style="width: 200px; margin-right: 10px;">
                            <el-option 
                                v-for="column in sqlResult.columns" 
                                :key="column" 
                                :label="column" 
                                :value="column">
                            </el-option>
                        </el-select>
                        <el-select 
                            v-model="formData.thresholds.low.operator" 
                            placeholder="选择运算符"
                            style="width: 120px; margin-right: 10px;">
                            <el-option 
                                v-for="item in options.operator" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input 
                            v-model="formData.thresholds.low.value" 
                            placeholder="输入阈值"
                            style="width: 200px;">
                        </el-input>
                    </div>
                </div>
            </el-form-item>

            <!-- 7. 告警消息 -->
            <el-form-item label="告警消息" prop="alarmMessage">
                <el-input 
                    v-model="formData.alarmMessage" 
                    placeholder="请输入告警消息内容，可为空"
                    type="textarea"
                    :rows="2">
                </el-input>
            </el-form-item>

            <!-- 8. 处理链接 -->
            <el-form-item label="处理链接" prop="handleLink">
                <el-input 
                    v-model="formData.handleLink" 
                    placeholder="请输入处理链接，可为空">
                </el-input>
            </el-form-item>

            <!-- 9. 告警接收人 -->
            <el-form-item label="告警接收人">
                <div class="receiver-container">
                    <div v-for="(receiver, index) in formData.receivers" :key="index" class="receiver-row">
                        <el-select 
                            v-model="receiver.selReceiverType" 
                            placeholder="选择规则"
                            style="width: 150px; margin-right: 10px;">
                            <el-option 
                                v-for="item in options.selReceiverType" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <el-select 
                            v-model="receiver.receiverType" 
                            placeholder="选择类型"
                            style="width: 150px; margin-right: 10px;">
                            <el-option 
                                v-for="item in options.receiverType" 
                                :key="item.value" 
                                :label="item.label" 
                                :value="item.value">
                            </el-option>
                        </el-select>
                        <el-input 
                            v-model="receiver.account" 
                            placeholder="请输入账号"
                            style="width: 200px; margin-right: 10px;">
                        </el-input>
                        <el-button 
                            v-if="index === formData.receivers.length - 1" 
                            type="primary" 
                            circle 
                            @click="addReceiver">
                            <el-icon><Plus /></el-icon>
                        </el-button>
                        <el-button 
                            v-if="formData.receivers.length > 1" 
                            type="danger" 
                            circle 
                            @click="removeReceiver(index)">
                            <el-icon><Delete /></el-icon>
                        </el-button>
                    </div>
                </div>
            </el-form-item>

            <!-- 10. 底部按钮 -->
            <el-form-item>
                <el-button @click="cancel">取消</el-button>
                <el-button type="primary" @click="submitForm(formRef)">确认</el-button>
            </el-form-item>
        </el-form>

        <!-- Cron表达式配置对话框 -->
        <el-dialog v-model="cronDialogVisible" title="Cron表达式配置" width="700px">
            <div class="cron-editor-container">
                <vue-js-cron v-model="tempCron" @error="cronError = $event"></vue-js-cron>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cronDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmCron" :disabled="cronError">确认</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts" name="sql-monitor">
import { ref, reactive, onMounted, shallowRef } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { Plus, Delete } from '@element-plus/icons-vue';
import { getDictItems, searchDictItems, testSQL, saveSqlMonitor, updateSqlMonitor } from '@/api/sql-monitor';
import { useRoute, useRouter } from 'vue-router';
import { VueJsCron } from '@vue-js-cron/element-plus';

// 路由相关
const route = useRoute();
const router = useRouter();
const isEdit = ref(false);

// 表单相关
const formRef = ref<FormInstance>();
const formData = reactive({
    id: null,
    name: '',
    alarmGroup: '',
    alarm: '',
    cron: '',
    datasource: '',
    sql: '',
    thresholds: {
        critical: { column: '', operator: '', value: '' },
        important: { column: '', operator: '', value: '' },
        normal: { column: '', operator: '', value: '' },
        low: { column: '', operator: '', value: '' }
    },
    alarmMessage: '',
    handleLink: '',
    receivers: [
        { selReceiverType: '', receiverType: '', account: '' }
    ]
});

// 表单验证规则
const rules = {
    name: [{ required: true, message: '请输入监控名称', trigger: 'blur' }],
    alarmGroup: [{ required: true, message: '请选择告警组', trigger: 'change' }],
    alarm: [{ required: true, message: '请选择告警项', trigger: 'change' }],
    cron: [{ required: true, message: '请配置定时表达式', trigger: 'blur' }],
    datasource: [{ required: true, message: '请选择数据源', trigger: 'change' }],
    sql: [{ required: true, message: '请输入SQL查询语句', trigger: 'blur' }]
};

// 下拉选项
const options = reactive({
    alarmGroup: [],
    alarm: [],
    datasource: [],
    operator: [],
    selReceiverType: [],
    receiverType: []
});

// 加载状态
const loading = reactive({
    alarmGroup: false,
    alarm: false,
    datasource: false
});

// SQL查询结果
const sqlResult = reactive({
    columns: [],
    records: []
});

// Cron表达式配置对话框
const cronDialogVisible = ref(false);
const tempCron = ref('');
const cronError = ref(false);

// Monaco编辑器实例
const monacoEditor = shallowRef<editor.IStandaloneCodeEditor | null>(null);

// 初始化下拉选项
const initOptions = async () => {
    try {
        // 获取不需要搜索功能的字典数据
        const [operatorRes, selReceiverTypeRes, receiverTypeRes] = await Promise.all([
            getDictItems('operator'),
            getDictItems('selReceiverType'),
            getDictItems('receiverType')
        ]);

        if (operatorRes.data && operatorRes.data.data) {
            options.operator = operatorRes.data.data.records.map((item: any) => ({
                label: item.label,
                value: item.value
            }));
        }

        if (selReceiverTypeRes.data && selReceiverTypeRes.data.data) {
            options.selReceiverType = selReceiverTypeRes.data.data.records.map((item: any) => ({
                label: item.label,
                value: item.value
            }));
        }

        if (receiverTypeRes.data && receiverTypeRes.data.data) {
            options.receiverType = receiverTypeRes.data.data.records.map((item: any) => ({
                label: item.label,
                value: item.value
            }));
        }
    } catch (error) {
        console.error('初始化下拉选项失败', error);
        ElMessage.error('初始化下拉选项失败');
    }
};

// 搜索告警组
const searchAlarmGroup = async (query: string) => {
    if (query) {
        loading.alarmGroup = true;
        try {
            const res = await searchDictItems('alarmGroup', query);
            if (res.data && res.data.data) {
                options.alarmGroup = res.data.data.records.map((item: any) => ({
                    label: item.label,
                    value: item.value
                }));
            }
        } catch (error) {
            console.error('搜索告警组失败', error);
            ElMessage.error('搜索告警组失败');
        } finally {
            loading.alarmGroup = false;
        }
    }
};

// 搜索告警项
const searchAlarm = async (query: string) => {
    if (query) {
        loading.alarm = true;
        try {
            const res = await searchDictItems('alarm', query);
            if (res.data && res.data.data) {
                options.alarm = res.data.data.records.map((item: any) => ({
                    label: item.label,
                    value: item.value
                }));
            }
        } catch (error) {
            console.error('搜索告警项失败', error);
            ElMessage.error('搜索告警项失败');
        } finally {
            loading.alarm = false;
        }
    }
};

// 搜索数据源
const searchDatasource = async (query: string) => {
    if (query) {
        loading.datasource = true;
        try {
            const res = await searchDictItems('datasource', query);
            if (res.data && res.data.data) {
                options.datasource = res.data.data.records.map((item: any) => ({
                    label: item.label,
                    value: item.value
                }));
            }
        } catch (error) {
            console.error('搜索数据源失败', error);
            ElMessage.error('搜索数据源失败');
        } finally {
            loading.datasource = false;
        }
    }
};

// 执行SQL查询
const executeSQL = async () => {
    if (!formData.datasource) {
        ElMessage.warning('请先选择数据源');
        return;
    }

    const sql = monacoEditor.value?.getValue() || '';
    if (!sql) {
        ElMessage.warning('请输入SQL查询语句');
        return;
    }

    try {
        const res = await testSQL({
            datasource_config_id: formData.datasource,
            sql: sql
        });

        if (res.data && res.data.data) {
            sqlResult.columns = res.data.data.columns || [];
            sqlResult.records = res.data.data.records || [];
            formData.sql = sql;
            ElMessage.success('查询成功');
        }
    } catch (error) {
        console.error('执行SQL查询失败', error);
        ElMessage.error('执行SQL查询失败');
    }
};

// 显示Cron表达式配置对话框
const showCronDialog = () => {
    tempCron.value = formData.cron || '';
    cronDialogVisible.value = true;
};

// 确认Cron表达式
const confirmCron = () => {
    if (!cronError.value) {
        formData.cron = tempCron.value;
        cronDialogVisible.value = false;
    }
};

// 添加接收人
const addReceiver = () => {
    formData.receivers.push({ selReceiverType: '', receiverType: '', account: '' });
};

// 移除接收人
const removeReceiver = (index: number) => {
    formData.receivers.splice(index, 1);
};

// 取消
const cancel = () => {
    router.back();
};

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    
    // 确保SQL已经设置
    if (monacoEditor.value) {
        formData.sql = monacoEditor.value.getValue() || '';
    }
    
    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                // 构建提交数据
                const submitData = {
                    ...formData,
                    datasource_config_id: formData.datasource, // 调整字段名称以匹配API要求
                };
                
                if (isEdit.value && formData.id) {
                    await updateSqlMonitor(submitData);
                    ElMessage.success('更新成功');
                } else {
                    await saveSqlMonitor(submitData);
                    ElMessage.success('创建成功');
                }
                router.back();
            } catch (error) {
                console.error('保存失败', error);
                ElMessage.error('保存失败');
            }
        } else {
            ElMessage.error('请填写必填字段');
        }
    });
};

// 初始化Monaco编辑器
const initMonacoEditor = () => {
    if (typeof window !== 'undefined') {
        import('monaco-editor').then(monaco => {
            const container = document.querySelector('.monaco-editor-container');
            if (container) {
                monacoEditor.value = monaco.editor.create(container as HTMLElement, {
                    value: formData.sql,
                    language: 'sql',
                    theme: 'vs',
                    automaticLayout: true,
                    minimap: { enabled: false }
                });

                // 监听编辑器内容变化
                monacoEditor.value.onDidChangeModelContent(() => {
                    formData.sql = monacoEditor.value?.getValue() || '';
                });
            }
        });
    }
};

// 初始化Cron编辑器
const initCronEditor = () => {
    // 这里将初始化Cron编辑器
    // 由于我们需要引入第三方库，这里先使用占位代码
};

// 组件挂载后执行
onMounted(() => {
    // 初始化下拉选项
    initOptions();

    // 初始化编辑器
    initMonacoEditor();
    initCronEditor();

    // 如果是编辑模式，获取数据
    const id = route.query.id;
    if (id) {
        isEdit.value = true;
        // 这里应该获取详情数据并填充表单
        // 由于没有提供获取详情的API，这里先使用占位代码
    }
});
</script>

<style scoped>
.container {
    padding: 20px;
}

.sql-editor-container {
    margin-bottom: 10px;
}

.sql-editor-actions {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
}

.sql-result-container {
    margin-top: 10px;
}

.threshold-container {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 15px;
}

.threshold-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
}

.threshold-row:last-child {
    margin-bottom: 0;
}

.threshold-label {
    width: 80px;
    margin-right: 10px;
    text-align: right;
    font-weight: bold;
}

.receiver-container {
    width: 100%;
}

.receiver-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.receiver-row:last-child {
    margin-bottom: 0;
}

.cron-editor-container {
    min-height: 300px;
}
</style>
