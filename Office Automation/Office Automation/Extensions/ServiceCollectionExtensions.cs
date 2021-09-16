using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Office_Automation.Extensions.ControllerExtensions;
using Service_Provider_Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Office_Automation.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddAutoAnalysis(this IServiceCollection services)
        {
            services.AddSingleton<IControllerFactory, AutoAnalysisControllerFactory>();
            return services;
        }

        public static IServiceCollection AddAutoInject(this IServiceCollection services)
        {
            // 获取项目已引入的项目中所有类库的信息
            List<AssemblyName> refassemblys = typeof(ServiceCollectionExtensions).Assembly.GetReferencedAssemblies().Where(b => b.GetPublicKeyToken().Length == 0).ToList();
            foreach (var assemblyName in refassemblys)
            {
                // 做一个键值对存储 被作为服务的接口及生命周期
                Dictionary<Type, ServiceAttribute> ServiceInterface = new Dictionary<Type, ServiceAttribute>();
                // 加载类库信息，方便获取内部的所有类型
                Assembly ass = Assembly.Load(assemblyName);
                // 对所有类型排序，接口在最前面
                foreach (Type t in ass.GetTypes().OrderBy(t => !t.IsInterface))
                {
                    // 获取该类型的自定义特性
                    var ServiceAttr = (ServiceAttribute)t.GetCustomAttribute(typeof(ServiceAttribute));
                    // 如果 "服务" 特性不为空，那么将会将当前 "服务类型"及"生命周期" 添加到键值对中，作为服务待注册
                    if (ServiceAttr != null)
                    {
                        ServiceInterface.Add(t, ServiceAttr);
                        continue;
                    }
                    // 如果当前类型不为接口
                    if (!t.IsInterface)
                    {
                        // 获取当前类型继承的所有接口
                        foreach (Type Inherited in t.GetInterfaces())
                        {
                            // 如果 服务键值对 中包含当前接口，那么将会按照当前接口及当前类型做依赖注入
                            if (ServiceInterface.ContainsKey(Inherited))
                            {
                                // 获取相对应的泛型参数的方法，new Type[] { services.GetType() }这里可以查看 services.AddScoped 的方法列表，里面有一个 this IServiceCollection services 参数，也就是说他不是空的
                                typeof(ServiceCollectionServiceExtensions).GetMethod($"Add{ServiceInterface[Inherited].Lifecycle}", 2, new Type[] { services.GetType() })
                                    // 填入相对应的泛型参数
                                    .MakeGenericMethod(Inherited, t)
                                    // 执行方法
                                    .Invoke(services, new object[] { services });
                                Console.WriteLine($"{t.FullName}继承自：{Inherited.FullName}");
                            }
                        }
                    }
                }
            }
            return services;
        }
    }
}
