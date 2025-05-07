public class QuizResultDto
{
    public string AssessmentId { get; set; }  // change from Guid
    public string CourseId { get; set; }      // change from Guid
    public string UserId { get; set; }
    public string InstructorEmail { get; set; }
    public Dictionary<int, string> Answers { get; set; }
    public int Score { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
}
