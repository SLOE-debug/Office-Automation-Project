using MySql.Data.MySqlClient;
using Service_Provider_Extensions;
using Service_Providers.DataBaseContextConfig;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.SqlServer;
using System.Data.SqlClient;
using System.Linq;
using System.Linq.Expressions;

namespace Service_Providers.DataBaseContext
{
    /// <summary>
    /// 将数据库上下文作为服务注入
    /// </summary>
    [Service]
    // 指定当前上下文类使用的 应用程序实体框架配置 “实体配置”即代码的方式编写的配置
    [DbConfigurationType(typeof(CustomDBConfiguration))]
    public class SchoolContext : DbContext
    {
        /// <summary>
        /// 这里很简单，不解释
        /// </summary>
        /// <param name="conn">数据库连接</param>
        public SchoolContext(DbConnection conn) : base(conn, true)
        {
            Console.WriteLine(((IObjectContextAdapter)this).ObjectContext.DatabaseExists());
        }

        /// <summary>
        /// 使用该类型在首次访问数据库时！！！！！！！首次访问数据库时，而非首次创建
        /// 在绑定模型之前会调用该方法，我们这里来重写该方法将模型绑定到该上下文
        /// </summary>
        /// <param name="modelBuilder"></param>
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // 将 DbContext 转为 ObjectContext 示例
            {
                //var dbcontext = (IObjectContextAdapter)this
                //dbcontext.ObjectContext;
            }

            // 以下展示两种设置，他们用来设置要用于给定上下文类型的数据库初始值设定项
            // 本示例传递 MigrateDatabaseToLatestVersion 对象表示对该上下文每次都使用自动迁移，如果 数据库实体 与当前 Code实体 不一致，那么将以 Code实体 去迁移数据库
            Database.SetInitializer<SchoolContext>(new MigrateDatabaseToLatestVersion<SchoolContext, MigratingDatabaseStandard>());

            // 与上相反，对该上下文类型禁用初始化
            //Database.SetInitializer<SchoolContext>(null);

            // 循环当前类库中的所有在 Models命名空间 下的类型，将它们注入到上下文实体中
            foreach (var item in from t in typeof(SchoolContext).Assembly.GetTypes().ToList() where t.Namespace == "Service_Providers.Models" select t)
            {
                modelBuilder.RegisterEntityType(item);
            }
            base.OnModelCreating(modelBuilder);
        }

        private static readonly Dictionary<string, Type> ConnTypes = new Dictionary<string, Type>() {
            { "MySql.Data.MySqlClient", typeof(MySqlConnection) },
            { "System.Data.SqlClient", typeof(SqlConnection) }
        };

        /// <summary>
        /// 如果需要自定义一个类的初始化过程，那么可以声明Load方法，该方法必须是：静态的、公开的。
        /// </summary>
        /// <param name="services">服务提供者容器</param>
        /// <returns>返回当前类型实例</returns>
        public static SchoolContext Load(IServiceProvider services)
        {
            DbConnection conn;
            string providerName = ConfigurationManager.ConnectionStrings["Constr"].ProviderName;
            string ConStr = ConfigurationManager.ConnectionStrings["Constr"].ToString();
            if (!ConnTypes.ContainsKey(providerName)) throw new Exception("未找到相对应的数据库连接提供商！");
            LambdaExpression GetConn = Expression.Lambda(Expression.New(ConnTypes[providerName].GetConstructor(new Type[] { typeof(string) }), Expression.Constant(ConStr, typeof(string))));
            conn = ((Func<DbConnection>)GetConn.Compile())();
            return new SchoolContext(conn);
        }
    }
}
