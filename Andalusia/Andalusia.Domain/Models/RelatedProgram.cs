namespace AndalusiaApp.Models;

public class RelatedProgram
{
    public long ProgramId { get; set; }
    public long RelatedProgramId { get; set; }
    public Program Program { get; set; } = null!;
    public Program Related { get; set; } = null!;
}