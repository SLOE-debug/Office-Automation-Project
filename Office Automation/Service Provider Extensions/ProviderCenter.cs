using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service_Provider_Extensions
{
    /// <summary>
    /// 容器提供者中心
    /// </summary>
    public static class ProviderCenter
    {
        // 主机
        public static IHost Host { get; set; }

        /// <summary>
        /// 根据服务提供容器创建服务
        /// </summary>
        /// <returns>返回服务实例化</returns>
        public static T GetService<T>()
        {
            // 使用主机创建一个范围
            using (var scope = Host.Services.CreateScope())
            {
                // 使用当前的范围服务容器创建对应的类
                return ActivatorUtilities.CreateInstance<T>(scope.ServiceProvider);
            }
        }
    }
}
