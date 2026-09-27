namespace AndalusiaApp.Models
{
    public class Partner
    {

        public long PartnerId { get; set; }
        public string Name { get; set; } = "";
        public string LogoUrl { get; set; } = "";
        public string Type { get; set; } = "Success_Partner"; // Accreditation | Success_Partner
        public bool IsActive { get; set; } = true;



    }
}
