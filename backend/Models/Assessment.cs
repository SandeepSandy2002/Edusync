namespace backend.Models
{
    public class Assessment
    {
        public Guid AssessmentId { get; set; }
        public Guid CourseId { get; set; }  // Foreign key to Course
        public string Title { get; set; }
        public string Questions { get; set; }  // Store quiz content in JSON format
        public int MaxScore { get; set; }
    }
}
