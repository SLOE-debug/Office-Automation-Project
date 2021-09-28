using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Office_Automation.Extensions.ControllerExtensions;
using Service_Provider_Extensions;
using Service_Providers.DataBaseContext;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
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
            Stopwatch sw = Stopwatch.StartNew();
            // 获取项目已引入的项目中所有类库的信息
            IEnumerable<AssemblyName> refassemblys = typeof(ServiceCollectionExtensions).Assembly.GetReferencedAssemblies().Where(b => b.GetPublicKeyToken().Length == 0);
            foreach (var assemblyName in refassemblys)
            {
                // 做一个键值对存储 被作为服务的接口及生命周期
                Dictionary<Type, ServiceAttribute> ServiceInterface = new Dictionary<Type, ServiceAttribute>();
                // 加载类库信息，方便获取内部的所有类型
                Assembly ass = Assembly.Load(assemblyName);
                // 对所有类型排序，接口在最前面
                foreach (Type t in from type in ass.GetTypes() orderby !type.IsInterface select type)
                {
                    // 获取该类型的自定义特性
                    var ServiceAttr = (ServiceAttribute)t.GetCustomAttribute(typeof(ServiceAttribute));
                    // 如果 "服务" 特性不为空，那么将会将当前 "服务类型"及"生命周期" 添加到键值对中，作为服务待注册
                    if (ServiceAttr != null)
                    {
                        if (t.IsInterface)
                        {
                            ServiceInterface.Add(t, ServiceAttr);
                        }
                        else
                        {
                            MethodInfo Load = t.GetMethod("Load", BindingFlags.Static | BindingFlags.Public);
                            List<Type> paramsTypes = new List<Type> { services.GetType(), typeof(Type) };
                            if (Load != null)
                            {
                                paramsTypes.Add(typeof(Func<IServiceProvider, object>));
                            }

                            var addMethod = typeof(ServiceCollectionServiceExtensions).GetMethod($"Add{ServiceAttr.Lifecycle}", paramsTypes.ToArray());
                            Type type = typeof(Func<IServiceCollection, Type, IServiceCollection>);
                            List<object> @params = new List<object>() { services, t };
                            if (Load != null)
                            {
                                type = typeof(Func<IServiceCollection, Type, Func<IServiceProvider, object>, IServiceCollection>);
                                @params.Add(Delegate.CreateDelegate(typeof(Func<IServiceProvider, object>), Load));
                            }
                            var add = Delegate.CreateDelegate(type, addMethod);
                            add.DynamicInvoke(@params.ToArray());

                            Console.WriteLine($"注入没有接口的类：{t.FullName}，服务生命周期：{ServiceAttr.Lifecycle}");
                        }
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
                                MethodInfo addMethod = typeof(ServiceCollectionServiceExtensions).GetMethod($"Add{ServiceInterface[Inherited].Lifecycle}", 2, new Type[] { services.GetType() })
                                 // 填入相对应的泛型参数
                                 .MakeGenericMethod(Inherited, t);
                                var add = (Func<IServiceCollection, IServiceCollection>)Delegate.CreateDelegate(typeof(Func<IServiceCollection, IServiceCollection>), addMethod);
                                add(services);
                                Console.WriteLine($"{t.FullName}继承自：{Inherited.FullName}，服务生命周期：{ServiceInterface[Inherited].Lifecycle}");
                            }
                        }
                    }
                }
            }
            sw.Stop();
            Console.WriteLine($"服务注册耗费毫秒：{sw.ElapsedMilliseconds}");
            return services;
        }
        public static IServiceCollection AddSwaager(this IServiceCollection services)
        {
            services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo
                {
                    Version = "v1",
                    Title = "Office Automation API",
                    Description = "Office Automation 接口API",
                });
                // 添加 JWT Bearer 安全定义
                option.AddSecurityDefinition("JWT", new OpenApiSecurityScheme
                {
                    Description = "在请求头中使用JWT验证\r\n\r\n 这将在请求头中添加一项（Bearer：XXXXX）\r\n\r\n请您在下方的Value输入框内键入您得到的Token",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                }); ;
                // 添加全局的安全定义使用
                option.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                         new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "JWT" // 该ID要对应 安全定义 的名称
                            },
                        },
                        new List<string>()
                    }
                });
            });
            return services;
        }
    }
}
