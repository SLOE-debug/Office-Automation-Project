using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.Entity.Infrastructure.Interception;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using Util;
using Service_Provider_Extensions;

namespace Service_Providers.DataBaseContextConfig
{
    /// <summary>
    /// 通过继承 DbCommandInterceptor拦截器 实现（创建命令、执行命令、命令失败、释放命令的datareader）的拦截操作
    /// 本类主要负责的是Redis缓存
    /// </summary>
    public class AccessInterceptor : DbCommandInterceptor
    {
        private readonly RedisCache redis;
        public AccessInterceptor(RedisCache _redis)
        {
            redis = _redis;
        }
        /// <summary>
        /// 在查询前执行，此时命令还未运行，上下文也没有结果
        /// </summary>
        /// <param name="command">正在执行的命令</param>
        /// <param name="interceptionContext">调用的上下文信息</param>
        public override void ReaderExecuting(DbCommand command, DbCommandInterceptionContext<DbDataReader> interceptionContext)
        {
            // 如果 Redis 缓存中存在当前命令
            if (redis.db.KeyExists(command.CommandText.Replace("\r\n", "")))
            {
                // 获取对应的 DataTable 作为结果
                interceptionContext.Result = redis.GetTable(command.CommandText.Replace("\r\n", "")).CreateDataReader();
                // 为命令添加标识，此操作将为了略过缓存代码
                command.CommandText = "-- GetCache \r\n" + command.CommandText;
                Console.WriteLine("读取缓存~~~");
            }
            base.ReaderExecuting(command, interceptionContext);
        }

        /// <summary>
        /// 在查询后执行，此时命令已经运行完毕，上下文中也获取到了结果
        /// </summary>
        /// <param name="command">正在执行的命令</param>
        /// <param name="interceptionContext">调用的上下文信息</param>
        public override void ReaderExecuted(DbCommand command, DbCommandInterceptionContext<DbDataReader> interceptionContext)
        {
            // 通过比较sql字符串来判断是不是获取缓存，注意！！！这里是反向比较，StringComparison.Ordinal表示为：使用序号（二进制）排序规则比较字符串
            // StartsWith方法解释：https://docs.microsoft.com/zh-cn/dotnet/api/system.string.startswith?view=net-5.0#System_String_StartsWith_System_String_System_StringComparison_
            if (!command.CommandText.StartsWith("-- GetCache", StringComparison.Ordinal))
            {
                // 当前符合条件类的过期时间
                List<int> exps = new List<int>();
                // 暂存Model层中所有的的类和表名关系的信息
                Dictionary<string, Type> tableNameRelType = (from t in typeof(AccessInterceptor).Assembly.GetTypes() where t.Namespace == "Service_Providers.Models" select t).ToDictionary(t =>
                {
                    // 如果实体被 TableAttribute 特性标识了，那么将会以 TableAttribute 标识的表名为键，否则将以原实体类名为键
                    string tableName = ((TableAttribute)t.GetCustomAttributes(typeof(TableAttribute), false).FirstOrDefault())?.Name;
                    return tableName == null ? t.Name : tableName;
                }, t => t);

                // 通过sql语句来正则匹配查询的表名
                foreach (var item in Regex.Matches(command.CommandText, "(?<=FROM\\s\\`).*(?=\\`\\sAS)"))
                {
                    // 判断当前类信息中有没有当前查询的表
                    if (tableNameRelType.ContainsKey(item.ToString()))
                    {
                        // 获取当前类中的缓存标识时间
                        int? cacheSeconds = ((RedisCachingAttribute)tableNameRelType[item.ToString()].GetCustomAttributes(typeof(RedisCachingAttribute), false).FirstOrDefault())?.Seconds;
                        // 如果当前缓存标识中有值
                        if (cacheSeconds.HasValue && cacheSeconds.Value > 0)
                        {
                            // 将当前缓存标识时间存起来
                            exps.Add(cacheSeconds.Value);
                        }
                    }
                }
                // 如果当前查询语句中涉及到缓存
                if (exps.Count > 0)
                {
                    DataTable dt = new DataTable();
                    // 通过当前的返回的 DataReader 来加载 DataTable
                    dt.Load(interceptionContext.Result);
                    // 将当前的结果对象换成 DataTable
                    interceptionContext.Result = dt.CreateDataReader();
                    // 使用最小的 “缓存时间” 设置 Redis 缓存
                    redis.SetTable(command.CommandText.Replace("\r\n", ""), dt, TimeSpan.FromSeconds(exps.Min()));
                }
            }
            base.ReaderExecuted(command, interceptionContext);
        }
    }
}
