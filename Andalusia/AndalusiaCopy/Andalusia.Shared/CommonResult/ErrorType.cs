using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.CommonResult
{
    public enum ErrorType
    {
        Failure,
        Validation,
        NotFound,
        Unauthorized,
        Forbidden,
        InvalidCredentials
    }
}
