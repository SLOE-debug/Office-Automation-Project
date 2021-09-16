using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Office_Automation.Extensions.ControllerExtensions
{
    public class AutoAnalysisAttribute : Attribute
    {
        /// <summary>
        /// 自动解析服务
        /// </summary>
        /// <param name="_serviceIndex">服务索引</param>
        public AutoAnalysisAttribute(int _serviceIndex = 0)
        {
            ServiceIndex = _serviceIndex;
        }
        public int ServiceIndex { get; set; }
    }
}
