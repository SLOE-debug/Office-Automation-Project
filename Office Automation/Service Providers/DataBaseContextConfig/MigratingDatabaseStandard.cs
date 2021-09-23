using MySql.Data.EntityFramework;
using Service_Providers.DataBaseContext;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service_Providers.DataBaseContextConfig
{
    /// <summary>
    /// 此处通过继承 DbMigrationsConfiguration 迁移模型类，实现数据库模型一致
    /// 具体情况查看 SchoolContext 类中 OnModelCreating 方法的重写
    /// </summary>
    public class MigratingDatabaseStandard : DbMigrationsConfiguration<SchoolContext>
    {
        public MigratingDatabaseStandard()
        {
            // 指定迁移期间，是否可以接收数据丢失，如果设置为false那么将会触发异常
            // 数据丢失情况一：当新增一个列或修改一个列时，将可为空变成了不可为空，那么这时候将会丢失一些数据
            // 数据丢失情况二：当删除一个现有的列时，那么这时候将会丢失一些数据
            AutomaticMigrationDataLossAllowed = false;
            // 指示迁移数据库时是否可以使用自动迁移
            AutomaticMigrationsEnabled = true;
            // 迁移的模型的派生 DbContext 与 SchoolContext 相关联
            ContextType = typeof(SchoolContext);
            // 基于代码的迁移的命名空间。可能是 Code模型 类的命名空间，也可能是 生成的迁移代码的命名空间 
            MigrationsNamespace = "Service_Providers.Models";
            // 为 MySql.Data.MySqlClient 提供程序声明 sql语句生成器，以便生成代码用于迁移
            SetSqlGenerator("MySql.Data.MySqlClient", new MySqlMigrationSqlGenerator());
        }
    }
}
