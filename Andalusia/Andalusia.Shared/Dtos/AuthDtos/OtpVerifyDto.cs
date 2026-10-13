using System;
using System.Collections.Generic;
using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Shared.Dtos.AuthDtos
{
    public class OtpVerifyDto
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }
}
