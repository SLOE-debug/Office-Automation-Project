using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Provider_Extensions
{
    public enum ServiceLifecycle
    {
        Transient = 0,
        Scoped = 1,
        Singleton = 2
    }

    public class ServiceAttribute : Attribute
    {
        public ServiceAttribute(ServiceLifecycle _lifecycle = ServiceLifecycle.Scoped)
        {
            Lifecycle = _lifecycle;
        }
        public ServiceLifecycle Lifecycle { get; set; }
    }
}
