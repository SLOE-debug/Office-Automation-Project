using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Providers
{
    public class StudentService : IStudentService, IDisposable
    {
        public void Dispose() => Console.WriteLine("学校1释放");

        public string WriteMessage(string Message) => "我叫：" + Message;

    }
}
