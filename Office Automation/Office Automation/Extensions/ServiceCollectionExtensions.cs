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
                            // 获取当前类型的 Load 方法，通过自定义的 初始化 方式注入服务
                            MethodInfo Load = t.GetMethod("Load", BindingFlags.Static | BindingFlags.Public);
                            // 当前注入方法所需的参数类型列表
                            List<Type> paramsTypes = new List<Type> { services.GetType(), typeof(Type) };
                            // 创建的委托类型
                            Type type = typeof(Func<IServiceCollection, Type, IServiceCollection>);
                            // 委托形参对应的实参
                            List<object> @params = new List<object>() { services, t };
                            // 如果 Load 方法不为空，那么将使用自定义的初始化过程注入，反之将使用自带的DI容器注入
                            if (Load != null)
                            {
                                // 添加 初始化方法 形参
                                paramsTypes.Add(typeof(Func<IServiceProvider, object>));
                                // 替换委托类型为 需传入初始化方法的 类型
                                type = typeof(Func<IServiceCollection, Type, Func<IServiceProvider, object>, IServiceCollection>);
                                // 通过当前的 Load 方法创建一个委托给对应的实参
                                @params.Add(Delegate.CreateDelegate(typeof(Func<IServiceProvider, object>), Load));
                            }
                            // 通过指定的方法名及形参列表获取对应的方法
                            var addMethod = typeof(ServiceCollectionServiceExtensions).GetMethod($"Add{ServiceAttr.Lifecycle}", paramsTypes.ToArray());
                            // 通过委托类型创建委托
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
                                // 获取当前类型的 Load 方法，通过自定义的 初始化 方式注入服务
                                MethodInfo Load = t.GetMethod("Load", BindingFlags.Static | BindingFlags.Public);
                                // 当前注入方法所需的参数类型列表
                                List<Type> paramsTypes = new List<Type> { services.GetType() };
                                // 创建的委托类型
                                Type type = typeof(Func<IServiceCollection, IServiceCollection>);
                                // 委托形参对应的实参
                                List<object> @params = new List<object>() { services };
                                // 如果 Load 方法不为空，那么将使用自定义的初始化过程注入，反之将使用自带的DI容器注入
                                if (Load != null)
                                {
                                    Type loadType = typeof(Func<,>).MakeGenericType(typeof(IServiceProvider), t);
                                    // 添加 初始化方法 形参
                                    paramsTypes.Add(loadType);
                                    // 替换委托类型为 需传入初始化方法的 类型
                                    type = typeof(Func<,,>).MakeGenericType(typeof(IServiceCollection), loadType, typeof(IServiceCollection));
                                    // 通过当前的 Load 方法创建一个委托给对应的实参
                                    @params.Add(Delegate.CreateDelegate(loadType, Load));
                                }
                                // 通过指定的方法名及形参列表获取对应的方法
                                var addMethod = typeof(ServiceCollectionServiceExtensions).GetMethods().Where(m => m.Name == $"Add{ServiceInterface[Inherited].Lifecycle}" && m.GetGenericArguments().Length == 2 && m.GetParameters().Length == paramsTypes.Count).ElementAt(0)
                                     // 填入相对应的泛型参数
                                     .MakeGenericMethod(Inherited, t);
                                // 通过委托类型创建委托
                                var add = Delegate.CreateDelegate(type, addMethod);
                                add.DynamicInvoke(@params.ToArray());

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
