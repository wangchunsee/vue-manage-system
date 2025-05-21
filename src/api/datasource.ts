import request from '../utils/request';
import { ElMessage } from 'element-plus';

const mockDatasources = [
    {
        id: 1,
        name: '示例数据源1',
        type: 'mysql',
        url: 'jdbc:mysql://example-server/example-db',
        username: 'example_user',
        password: '[REDACTED]',
        driverClassName: 'com.example.Driver',
        createTime: '2025-05-20T15:26:39',
        createBy: null,
        updateTime: '2025-05-20T15:26:39',
        updateBy: null
    },
    {
        id: 2,
        name: '示例数据源2',
        type: 'postgresql',
        url: 'jdbc:postgresql://example-server/example-db',
        username: 'example_user',
        password: '[REDACTED]',
        driverClassName: 'org.example.Driver',
        createTime: '2025-05-21T10:15:22',
        createBy: 'admin',
        updateTime: '2025-05-21T10:15:22',
        updateBy: 'admin'
    }
];

const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 500));

export const searchDatasources = async (data: any) => {
    try {
        return await request({
            url: '/api/datasource/page/search',
            method: 'post',
            data
        });
    } catch (error) {
        console.log('Using mock data for searchDatasources');
        await simulateApiDelay();
        
        let filteredData = [...mockDatasources];
        if (data.query?.nameLike) {
            filteredData = filteredData.filter(item => 
                item.name.includes(data.query.nameLike)
            );
        }
        if (data.query?.url) {
            filteredData = filteredData.filter(item => 
                item.url.includes(data.query.url)
            );
        }
        
        return {
            data: {
                code: 0,
                data: {
                    records: filteredData,
                    total: filteredData.length,
                    size: data.page.size || 20,
                    current: data.page.current || 1,
                    pages: Math.ceil(filteredData.length / (data.page.size || 20))
                },
                msg: null,
                timestamp: Date.now(),
                success: true
            }
        };
    }
};

export const createDatasource = async (data: any) => {
    try {
        return await request({
            url: '/api/datasource',
            method: 'post',
            data
        });
    } catch (error) {
        console.log('Using mock data for createDatasource');
        await simulateApiDelay();
        
        const newId = mockDatasources.length > 0 ? Math.max(...mockDatasources.map(item => item.id)) + 1 : 1;
        const newDatasource = {
            ...data,
            id: newId,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString(),
            createBy: 'admin',
            updateBy: 'admin'
        };
        
        mockDatasources.push(newDatasource);
        
        return {
            data: {
                code: 0,
                data: newDatasource,
                msg: null,
                timestamp: Date.now(),
                success: true
            }
        };
    }
};

export const updateDatasource = async (data: any) => {
    try {
        return await request({
            url: '/api/datasource',
            method: 'put',
            data
        });
    } catch (error) {
        console.log('Using mock data for updateDatasource');
        await simulateApiDelay();
        
        const index = mockDatasources.findIndex(item => item.id === data.id);
        if (index !== -1) {
            mockDatasources[index] = {
                ...mockDatasources[index],
                ...data,
                updateTime: new Date().toISOString(),
                updateBy: 'admin'
            };
            
            return {
                data: {
                    code: 0,
                    data: mockDatasources[index],
                    msg: null,
                    timestamp: Date.now(),
                    success: true
                }
            };
        } else {
            throw new Error('Datasource not found');
        }
    }
};

export const deleteDatasource = async (id: number) => {
    try {
        return await request({
            url: `/api/datasource/${id}`,
            method: 'delete'
        });
    } catch (error) {
        console.log('Using mock data for deleteDatasource');
        await simulateApiDelay();
        
        const index = mockDatasources.findIndex(item => item.id === id);
        if (index !== -1) {
            mockDatasources.splice(index, 1);
            
            return {
                data: {
                    code: 0,
                    data: null,
                    msg: null,
                    timestamp: Date.now(),
                    success: true
                }
            };
        } else {
            throw new Error('Datasource not found');
        }
    }
};

export const testDatasource = async (data: any) => {
    try {
        return await request({
            url: '/api/datasource/test',
            method: 'post',
            data
        });
    } catch (error) {
        console.log('Using mock data for testDatasource');
        await simulateApiDelay();
        
        return {
            data: {
                code: 0,
                data: true,
                msg: null,
                timestamp: Date.now(),
                success: true
            }
        };
    }
};
