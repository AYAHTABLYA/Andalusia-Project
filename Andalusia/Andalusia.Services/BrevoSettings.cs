using System;
using System.Collections.Generic;
using System.Text;

namespace Andalusia.Services
{
    public sealed class BrevoSettings
    {
        public string Host { get; set; } = "smtp-relay.brevo.com";
        public int Port { get; set; } = 587;
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? SenderEmail { get; set; }
        public string SenderName { get; set; } = "Andalusia Academy";
    }
}
