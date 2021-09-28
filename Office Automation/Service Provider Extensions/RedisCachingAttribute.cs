using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service_Provider_Extensions
{
    /// <summary>
    /// 缓存标识，在类上标识该特性将会被放入Redis缓存中
    /// </summary>
    public class RedisCachingAttribute : Attribute
    {
        // 缓存时间，以秒为单位
        public int Seconds { get; set; }
        /// <summary>
        /// 构造函数
        /// </summary>
        /// <param name="_seconds">缓存时间，以秒为单位</param>
        public RedisCachingAttribute(int _seconds)
        {
            Seconds = _seconds;
        }
    }
}
