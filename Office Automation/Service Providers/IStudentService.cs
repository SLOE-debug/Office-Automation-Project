using Service_Provider_Extensions;
using System;

namespace Service_Providers
{
    [Service]
    public interface IStudentService
    {
        string WriteMessage(string Message);
    }
}
