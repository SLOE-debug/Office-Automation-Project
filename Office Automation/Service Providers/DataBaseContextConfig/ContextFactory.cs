using Service_Providers.DataBaseContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace Service_Providers.DataBaseContextConfig
{
    /// <summary>
    /// 通过继承 IDbContextFactory 工厂接口，来实现 SchoolContext 的工厂
    /// 因为迁移不是通过依赖注入来获取 数据库上下文连接的 而是通过默认的无参构造函数来获取上下文连接的
    /// 如果想要改变获取方式，那么就声明 上下文工厂类
    /// </summary>
    public class ContextFactory : IDbContextFactory<SchoolContext>
    {
        public SchoolContext Create()
        {
            return SchoolContext.Load(null);
        }
    }
}
