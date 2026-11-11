namespace AndalusiaApp.Models;

public class ProgramPartner
{
    public long ProgramId { get; set; }
    public long PartnerId { get; set; }
    public string AccreditationDetails { get; set; } = "";

    public Program Program { get; set; } = null!;
    public Partner Partner { get; set; } = null!;
}
