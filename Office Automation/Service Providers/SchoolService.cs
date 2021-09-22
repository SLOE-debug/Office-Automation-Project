using Service_Provider_Extensions;
using Service_Providers.DataBaseContext;
using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Providers
{
    [Service(ServiceLifecycle.Transient)]
    public class SchoolService : IDisposable
    {
        private readonly SchoolContext context;
        public SchoolService(SchoolContext _context)
        {
            context = _context;
        }
        public void Dispose() => Console.WriteLine("学校服务释放");
        public string GetSchoolName(string name)
        {
            return "学校叫：" + name;
        }
    }
}
