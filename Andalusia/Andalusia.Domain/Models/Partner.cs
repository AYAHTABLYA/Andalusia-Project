using Andalusia.Domain.Enums;

namespace AndalusiaApp.Models
{
    public class Partner
    {
        public long PartnerId { get; set; }
        public string Name { get; set; } = "";
        public string LogoUrl { get; set; } = "";
        public PartnerType Type { get; set; } = PartnerType.Success_Partner;
        public bool IsActive { get; set; } = true;

        public ICollection<ProgramPartner> ProgramPartners { get; set; } = new List<ProgramPartner>();
    }
}