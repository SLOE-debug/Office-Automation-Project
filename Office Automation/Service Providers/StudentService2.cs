using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Providers
{
    class StudentService2 : IStudentService
    {
        public string WriteMessage(string Message) => "我是2，我叫：" + Message;

        public static StudentService2 Load(IServiceProvider services)
        {
            Console.WriteLine("测试自定义初始化！");
            return new StudentService2();
        }
    }
}
