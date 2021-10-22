using MySql.Data.EntityFramework;
using MySql.Data.MySqlClient;
using Service_Provider_Extensions;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Util;

namespace Service_Providers.DataBaseContextConfig
{
    /// <summary>
    /// 自定义实体配置
    /// </summary>
    class CustomDBConfiguration : DbConfiguration
    {
        public CustomDBConfiguration()
        {
            // 设置指定的数据库提供程序的异常类
            SetExecutionStrategy("MySql.Data.MySqlClient", () => new MySqlExecutionStrategy());
            //SetDefaultConnectionFactory(new MySqlConnectionFactory());
            // 设置指定的数据库提供程序的工厂类
            SetProviderFactory("MySql.Data.MySqlClient", new MySqlClientFactory());
            // 设置指定的数据库提供程序的服务类
            SetProviderServices("MySql.Data.MySqlClient", new MySqlProviderServices());
            // 添加命令拦截器，为了缓存
            AddInterceptor(new AccessInterceptor(ServiceProviderCenter.GetService<RedisCache>()));
        }
    }
}
