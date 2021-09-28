using System;
using System.Collections.Generic;
using System.Text;

namespace Service_Providers
{
    public class StudentService : IStudentService
    {

        public string WriteMessage(string Message) => "我叫：" + Message;

    }
}
