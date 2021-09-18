using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Office_Automation.Extensions.ControllerExtensions
{
    public class AutoAnalysisControllerFactory : IControllerFactory
    {
        public object CreateController(ControllerContext context)
        {
            Stopwatch sw = Stopwatch.StartNew();
            // 获取当前控制器实例
            var Controller = ActivatorUtilities.CreateInstance(context.HttpContext.RequestServices, context.ActionDescriptor.ControllerTypeInfo);
            // 循环当前控制器实例的属性
            foreach (var Prop in Controller.GetType().GetProperties())
            {
                // 获取属性自定义特性
                var AutoAnalysisAttr = (AutoAnalysisAttribute)Attribute.GetCustomAttributes(Prop, typeof(AutoAnalysisAttribute)).FirstOrDefault();
                // 如果 "自动解析" 特性不为空则进入属性设置代码
                if (AutoAnalysisAttr != null)
                {
                    // 获取自定义特性的"服务索引"
                    var ServiceIndex = AutoAnalysisAttr.ServiceIndex;
                    // 获取对应的服务实例列表
                    var Services = context.HttpContext.RequestServices.GetServices(Prop.PropertyType);
                    // 如果当前 "服务索引" 不符合服务实例列表，那么将抛出错误
                    if (Services.Count() == 0 || ServiceIndex > Services.Count() - 1) throw new Exception("服务自动解析时出现问题，可能是指定的服务索引超出界限或服务未注入。");
                    // 如果没有抛出错误，那么将会为属性设置所对应的实例
                    Prop.SetValue(Controller, Services.ElementAt(ServiceIndex));
                }
            }
            sw.Stop();
            Console.WriteLine($"属性注入耗费毫秒：{sw.ElapsedMilliseconds}");
            return Controller;
        }

        public void ReleaseController(ControllerContext context, object controller)
        {
            (controller as IDisposable)?.Dispose();
        }
    }
}
