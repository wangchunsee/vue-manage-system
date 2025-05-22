import request from '../../utils/request';

export const getDictItems = (dictName: string) => {
    try {
        return request({
            url: `/api/dictItem?dictName=${dictName}`,
            method: 'get'
        });
    } catch (error) {
        console.error('获取字典数据失败', error);
        throw error;
    }
};

export const searchDictItems = (dictName: string, labelLike: string) => {
    try {
        return request({
            url: `/api/dictItem/search/${dictName}`,
            method: 'post',
            data: {
                labelLike
            }
        });
    } catch (error) {
        console.error('搜索字典数据失败', error);
        throw error;
    }
};

export const testSQL = (data: any) => {
    try {
        return request({
            url: '/api/sqlMonitor/testSQL',
            method: 'post',
            data
        });
    } catch (error) {
        console.error('执行SQL查询失败', error);
        throw error;
    }
};

export const saveSqlMonitor = (data: any) => {
    try {
        return request({
            url: '/api/sqlMonitor',
            method: 'post',
            data
        });
    } catch (error) {
        console.error('保存SQL监控配置失败', error);
        throw error;
    }
};

export const updateSqlMonitor = (data: any) => {
    try {
        return request({
            url: '/api/sqlMonitor',
            method: 'put',
            data
        });
    } catch (error) {
        console.error('更新SQL监控配置失败', error);
        throw error;
    }
};
