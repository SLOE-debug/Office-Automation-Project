using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Provider_Extensions
{
    /// <summary>
    /// 生命周期枚举
    /// </summary>
    public enum ServiceLifecycle
    {
        // 瞬态的
        Transient = 0,
        // 范围的
        Scoped = 1,
        // 永久的
        Singleton = 2
    }

    /// <summary>
    /// 服务标识，在类上标识该特性将会被注入到容器中
    /// </summary>
    public class ServiceAttribute : Attribute
    {
        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="_lifecycle">服务生命周期</param>
        public ServiceAttribute(ServiceLifecycle _lifecycle = ServiceLifecycle.Scoped)
        {
            Lifecycle = _lifecycle;
        }
        // 生命周期
        public ServiceLifecycle Lifecycle { get; set; }
    }
}
