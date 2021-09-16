using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Providers
{
    class StudentService2 : IStudentService
    {
        public string WriteMessage(string Message) => "我是2，我叫：" + Message;
    }
}
