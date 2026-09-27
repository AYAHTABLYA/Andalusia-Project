namespace AndalusiaApp.Models
{
    public class Payment
    {

        public long PaymentId { get; set; }
        public long UserId { get; set; }
        public long? ApplicationId { get; set; }
        public long? EnrollmentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "";
        public string GatewayName { get; set; } = "";
        public string TransactionRef { get; set; } = "";
        public string Status { get; set; } = "Initiated"; // Initiated | Success | Failed | Refunded
        public DateTime? PaidAt { get; set; }

        public User User { get; set; } = null!;
        public Application? Application { get; set; }
        public Enrollment? Enrollment { get; set; }







    }
}
